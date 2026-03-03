"""
Social Authentication Service

This service handles social authentication flows including user creation,
account linking, and profile synchronization.

Requirements: 1.1-1.3, 2.1-2.3, 3.1-3.3, 4.1-4.6, 5.1-5.4, 8.1-8.4, 10.1-10.3, 12.1-12.4
"""

from datetime import datetime, timezone
from typing import Tuple, Dict, Optional
from flask_jwt_extended import create_access_token
from app import db
from app.models.user import User
from app.models.social_auth_provider import SocialAuthProvider
from app.services.token_verification import TokenVerificationService, TokenVerificationError
import logging

logger = logging.getLogger(__name__)


class SocialAuthError(Exception):
    """Base exception for social authentication errors."""
    pass


class AccountConflictError(SocialAuthError):
    """Raised when there's an email conflict with existing accounts."""
    pass


class AccountLockoutError(SocialAuthError):
    """Raised when attempting to remove the last authentication method."""
    pass


class SocialAuthService:
    """Service for handling social authentication operations."""
    
    def __init__(self):
        """Initialize the social authentication service."""
        self.token_verifier = TokenVerificationService()
    
    def authenticate_social_user(
        self, 
        provider: str, 
        token: str, 
        profile: Optional[Dict] = None
    ) -> Tuple[User, str]:
        """
        Authenticate user with social provider credentials.
        
        This method:
        1. Verifies the provider token
        2. Checks if provider_user_id exists (returning user login)
        3. Checks if email exists (account linking scenario)
        4. Creates new user if neither exists
        5. Updates profile data (picture, last_login)
        6. Generates JWT token
        
        Args:
            provider: Provider name ('google', 'facebook', 'apple')
            token: OAuth token from provider
            profile: Optional additional profile data from client (for Apple name)
            
        Returns:
            Tuple of (User, jwt_token)
            
        Raises:
            TokenVerificationError: If token verification fails
            SocialAuthError: If authentication fails for other reasons
        """
        try:
            # Verify token and extract profile data
            verified_profile = self.token_verifier.verify_token(provider, token)
            
            # Merge client-provided profile data (for Apple name)
            if profile:
                if profile.get('first_name') and not verified_profile.get('first_name'):
                    verified_profile['first_name'] = profile['first_name']
                if profile.get('last_name') and not verified_profile.get('last_name'):
                    verified_profile['last_name'] = profile['last_name']
                if profile.get('name') and not verified_profile.get('name'):
                    verified_profile['name'] = profile['name']
            
            provider_user_id = verified_profile['provider_user_id']
            email = verified_profile['email']
            
            if not email:
                raise SocialAuthError("Email is required from social provider")
            
            # Check if this provider account is already linked
            social_auth = SocialAuthProvider.query.filter_by(
                provider=provider,
                provider_user_id=provider_user_id
            ).first()
            
            if social_auth:
                # Existing social auth - return the linked user
                user = social_auth.user
                self._update_profile_data(user, social_auth, verified_profile)
                user.last_login = datetime.now(timezone.utc)
                db.session.commit()
                
                token = create_access_token(identity=str(user.id))
                return user, token
            
            # Provider account not linked - check if email exists
            user = User.query.filter_by(email=email).first()
            
            if user:
                # Email exists - this is a potential account linking scenario
                # For now, automatically link if the user has a password
                # (they can verify ownership through password login)
                # If no password, it's likely another social account with same email
                if user.has_password():
                    # Auto-link for users with password authentication
                    social_auth = self._create_social_auth_record(
                        user, provider, provider_user_id, verified_profile
                    )
                    self._update_profile_data(user, social_auth, verified_profile)
                    user.last_login = datetime.now(timezone.utc)
                    db.session.commit()
                    
                    logger.info(f"Auto-linked {provider} account to user {user.id}")
                    
                    token = create_access_token(identity=str(user.id))
                    return user, token
                else:
                    # User has no password - they're using social auth only
                    # Allow linking if they're signing in with a different provider
                    social_auth = self._create_social_auth_record(
                        user, provider, provider_user_id, verified_profile
                    )
                    self._update_profile_data(user, social_auth, verified_profile)
                    user.last_login = datetime.now(timezone.utc)
                    db.session.commit()
                    
                    logger.info(f"Linked {provider} account to social-only user {user.id}")
                    
                    token = create_access_token(identity=str(user.id))
                    return user, token
            
            # New user - create account
            user = self._create_new_user(verified_profile)
            social_auth = self._create_social_auth_record(
                user, provider, provider_user_id, verified_profile
            )
            db.session.commit()
            
            logger.info(f"Created new user {user.id} with {provider} authentication")
            
            token = create_access_token(identity=str(user.id))
            return user, token
            
        except TokenVerificationError:
            raise
        except Exception as e:
            db.session.rollback()
            logger.error(f"Social authentication failed: {str(e)}")
            raise SocialAuthError(f"Authentication failed: {str(e)}")
    
    def link_social_account(
        self, 
        user_id: int, 
        provider: str, 
        token: str
    ) -> bool:
        """
        Link a social provider account to an existing authenticated user.
        
        Args:
            user_id: ID of the authenticated user
            provider: Provider name ('google', 'facebook', 'apple')
            token: OAuth token from provider
            
        Returns:
            True on success
            
        Raises:
            TokenVerificationError: If token verification fails
            SocialAuthError: If linking fails (duplicate provider_id, etc.)
        """
        try:
            # Verify token
            verified_profile = self.token_verifier.verify_token(provider, token)
            provider_user_id = verified_profile['provider_user_id']
            
            # Check if this provider account is already linked to another user
            existing_auth = SocialAuthProvider.query.filter_by(
                provider=provider,
                provider_user_id=provider_user_id
            ).first()
            
            if existing_auth:
                if existing_auth.user_id == user_id:
                    # Already linked to this user
                    return True
                else:
                    raise SocialAuthError(
                        f"This {provider} account is already linked to another user"
                    )
            
            # Get the user
            user = User.query.get(user_id)
            if not user:
                raise SocialAuthError("User not found")
            
            # Check if user already has this provider linked
            existing_provider = SocialAuthProvider.query.filter_by(
                user_id=user_id,
                provider=provider
            ).first()
            
            if existing_provider:
                # Update the existing record with new provider_user_id
                existing_provider.provider_user_id = provider_user_id
                existing_provider.email = verified_profile['email']
                existing_provider.profile_picture_url = verified_profile.get('picture')
                existing_provider.updated_at = datetime.now(timezone.utc)
            else:
                # Create new social auth record
                self._create_social_auth_record(
                    user, provider, provider_user_id, verified_profile
                )
            
            db.session.commit()
            logger.info(f"Linked {provider} account to user {user_id}")
            return True
            
        except TokenVerificationError:
            raise
        except SocialAuthError:
            raise
        except Exception as e:
            db.session.rollback()
            logger.error(f"Account linking failed: {str(e)}")
            raise SocialAuthError(f"Linking failed: {str(e)}")
    
    def unlink_social_account(
        self, 
        user_id: int, 
        provider: str
    ) -> bool:
        """
        Unlink a social provider account from a user.
        
        Args:
            user_id: ID of the user
            provider: Provider name to unlink
            
        Returns:
            True on success
            
        Raises:
            AccountLockoutError: If this is the last authentication method
            SocialAuthError: If unlinking fails
        """
        try:
            user = User.query.get(user_id)
            if not user:
                raise SocialAuthError("User not found")
            
            # Check if user has alternative authentication method
            has_password = user.has_password()
            linked_providers = user.get_linked_providers()
            
            if not has_password and len(linked_providers) <= 1:
                raise AccountLockoutError(
                    "Cannot unlink the last authentication method. "
                    "Please set a password or link another social account first."
                )
            
            # Find and remove the social auth record
            social_auth = SocialAuthProvider.query.filter_by(
                user_id=user_id,
                provider=provider
            ).first()
            
            if not social_auth:
                raise SocialAuthError(f"{provider} account is not linked")
            
            db.session.delete(social_auth)
            db.session.commit()
            
            logger.info(f"Unlinked {provider} account from user {user_id}")
            return True
            
        except (AccountLockoutError, SocialAuthError):
            raise
        except Exception as e:
            db.session.rollback()
            logger.error(f"Account unlinking failed: {str(e)}")
            raise SocialAuthError(f"Unlinking failed: {str(e)}")
    
    def get_auth_methods(self, email: str) -> Dict:
        """
        Get available authentication methods for an email address.
        
        Args:
            email: Email address to query
            
        Returns:
            dict with keys: has_password (bool), linked_providers (list)
        """
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return {
                'has_password': False,
                'linked_providers': []
            }
        
        return {
            'has_password': user.has_password(),
            'linked_providers': user.get_linked_providers()
        }
    
    def _create_new_user(self, profile: Dict) -> User:
        """
        Create a new user from social provider profile data.
        
        Args:
            profile: Verified profile data from provider
            
        Returns:
            New User object (not yet committed)
        """
        # Extract name components
        first_name = profile.get('first_name', '').strip()
        last_name = profile.get('last_name', '').strip()
        
        # Fallback to splitting full name if components not available
        if not first_name and not last_name:
            name = profile.get('name', '').strip()
            if name:
                parts = name.split(' ', 1)
                first_name = parts[0]
                last_name = parts[1] if len(parts) > 1 else ''
        
        # Ensure we have at least something for required fields
        if not first_name:
            first_name = 'User'
        if not last_name:
            last_name = ''
        
        user = User(
            email=profile['email'],
            first_name=first_name,
            last_name=last_name,
            role='resident',  # Default role for social auth users
            password_hash=None,  # No password for social-only accounts
            is_active=True,
            last_login=datetime.now(timezone.utc)
        )
        
        db.session.add(user)
        db.session.flush()  # Get user.id without committing
        
        return user
    
    def _create_social_auth_record(
        self, 
        user: User, 
        provider: str, 
        provider_user_id: str, 
        profile: Dict
    ) -> SocialAuthProvider:
        """
        Create a social auth provider record.
        
        Args:
            user: User object
            provider: Provider name
            provider_user_id: Provider's unique user ID
            profile: Verified profile data
            
        Returns:
            New SocialAuthProvider object (not yet committed)
        """
        social_auth = SocialAuthProvider(
            user_id=user.id,
            provider=provider,
            provider_user_id=provider_user_id,
            email=profile['email'],
            profile_picture_url=profile.get('picture'),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        db.session.add(social_auth)
        return social_auth
    
    def _update_profile_data(
        self, 
        user: User, 
        social_auth: SocialAuthProvider, 
        profile: Dict
    ) -> None:
        """
        Update user profile data from social provider.
        
        Updates:
        - Profile picture URL if changed
        - Empty first_name and last_name fields
        - Does not overwrite user-modified data
        
        Args:
            user: User object to update
            social_auth: SocialAuthProvider object to update
            profile: Verified profile data from provider
        """
        # Update profile picture if changed
        new_picture = profile.get('picture')
        if new_picture and social_auth.profile_picture_url != new_picture:
            social_auth.profile_picture_url = new_picture
            social_auth.updated_at = datetime.now(timezone.utc)
        
        # Populate empty name fields (don't overwrite existing)
        if not user.first_name or user.first_name == 'User':
            first_name = profile.get('first_name', '').strip()
            if first_name:
                user.first_name = first_name
        
        if not user.last_name:
            last_name = profile.get('last_name', '').strip()
            if last_name:
                user.last_name = last_name
