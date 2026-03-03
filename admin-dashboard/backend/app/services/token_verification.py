"""
Token Verification Service for Social Authentication

This service verifies OAuth tokens from social providers (Google, Facebook, Apple).
It validates token signatures and extracts user profile data.

Requirements: 1.5, 2.5, 3.5
"""

import os
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import jwt
from jwt import PyJWKClient
from typing import Dict, Optional


class TokenVerificationError(Exception):
    """Raised when token verification fails."""
    pass


class TokenVerificationService:
    """Service for verifying social provider tokens."""
    
    def __init__(self):
        """Initialize the token verification service."""
        self.google_client_id = os.getenv('GOOGLE_CLIENT_ID')
        self.facebook_app_id = os.getenv('FACEBOOK_APP_ID')
        self.facebook_app_secret = os.getenv('FACEBOOK_APP_SECRET')
        self.apple_client_id = os.getenv('APPLE_CLIENT_ID')
    
    def verify_google_token(self, token: str) -> Dict:
        """
        Verify Google ID token using google-auth library.
        
        Args:
            token: Google ID token (JWT)
            
        Returns:
            dict: User profile data with keys: email, name, provider_user_id, picture
            
        Raises:
            TokenVerificationError: If token is invalid or verification fails
        """
        try:
            # Verify the token using Google's library
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                self.google_client_id
            )
            
            # Extract user profile data
            return {
                'email': idinfo.get('email'),
                'name': idinfo.get('name', ''),
                'first_name': idinfo.get('given_name', ''),
                'last_name': idinfo.get('family_name', ''),
                'provider_user_id': idinfo.get('sub'),
                'picture': idinfo.get('picture'),
            }
            
        except ValueError as e:
            raise TokenVerificationError(f"Invalid Google token: {str(e)}")
        except Exception as e:
            raise TokenVerificationError(f"Google token verification failed: {str(e)}")
    
    def verify_facebook_token(self, token: str) -> Dict:
        """
        Verify Facebook access token using Facebook Graph API.
        
        Args:
            token: Facebook access token
            
        Returns:
            dict: User profile data with keys: email, name, provider_user_id, picture
            
        Raises:
            TokenVerificationError: If token is invalid or verification fails
        """
        try:
            # First, verify the token with Facebook's debug endpoint
            debug_url = 'https://graph.facebook.com/debug_token'
            debug_params = {
                'input_token': token,
                'access_token': f"{self.facebook_app_id}|{self.facebook_app_secret}"
            }
            
            debug_response = requests.get(debug_url, params=debug_params, timeout=10)
            debug_data = debug_response.json()
            
            if 'data' not in debug_data or not debug_data['data'].get('is_valid'):
                raise TokenVerificationError("Invalid Facebook token")
            
            # Verify the app ID matches
            if debug_data['data'].get('app_id') != self.facebook_app_id:
                raise TokenVerificationError("Facebook token app ID mismatch")
            
            # Get user profile data
            profile_url = 'https://graph.facebook.com/me'
            profile_params = {
                'fields': 'id,email,name,first_name,last_name,picture',
                'access_token': token
            }
            
            profile_response = requests.get(profile_url, params=profile_params, timeout=10)
            profile_data = profile_response.json()
            
            if 'error' in profile_data:
                raise TokenVerificationError(f"Facebook API error: {profile_data['error'].get('message')}")
            
            # Extract user profile data
            picture_url = None
            if 'picture' in profile_data and 'data' in profile_data['picture']:
                picture_url = profile_data['picture']['data'].get('url')
            
            return {
                'email': profile_data.get('email'),
                'name': profile_data.get('name', ''),
                'first_name': profile_data.get('first_name', ''),
                'last_name': profile_data.get('last_name', ''),
                'provider_user_id': profile_data.get('id'),
                'picture': picture_url,
            }
            
        except requests.RequestException as e:
            raise TokenVerificationError(f"Facebook API request failed: {str(e)}")
        except Exception as e:
            raise TokenVerificationError(f"Facebook token verification failed: {str(e)}")
    
    def verify_apple_token(self, token: str) -> Dict:
        """
        Verify Apple identity token (JWT) by checking signature with Apple's public keys.
        
        Args:
            token: Apple identity token (JWT)
            
        Returns:
            dict: User profile data with keys: email, name, provider_user_id, picture
            
        Raises:
            TokenVerificationError: If token is invalid or verification fails
        """
        try:
            # Get Apple's public keys
            jwks_client = PyJWKClient('https://appleid.apple.com/auth/keys')
            
            # Get the signing key from the token header
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            
            # Verify and decode the token
            decoded = jwt.decode(
                token,
                signing_key.key,
                algorithms=['RS256'],
                audience=self.apple_client_id,
                issuer='https://appleid.apple.com'
            )
            
            # Extract user profile data
            # Note: Apple only provides email and may use private relay
            email = decoded.get('email')
            provider_user_id = decoded.get('sub')
            
            # Apple doesn't provide name in the token after first sign-in
            # The mobile client should send name separately if available
            return {
                'email': email,
                'name': '',  # Name should be provided separately by client
                'first_name': '',
                'last_name': '',
                'provider_user_id': provider_user_id,
                'picture': None,  # Apple doesn't provide profile pictures
            }
            
        except jwt.ExpiredSignatureError:
            raise TokenVerificationError("Apple token has expired")
        except jwt.InvalidTokenError as e:
            raise TokenVerificationError(f"Invalid Apple token: {str(e)}")
        except Exception as e:
            raise TokenVerificationError(f"Apple token verification failed: {str(e)}")
    
    def verify_token(self, provider: str, token: str) -> Dict:
        """
        Verify token for any supported provider.
        
        Args:
            provider: Provider name ('google', 'facebook', or 'apple')
            token: OAuth token to verify
            
        Returns:
            dict: User profile data
            
        Raises:
            TokenVerificationError: If provider is unsupported or verification fails
        """
        if provider == 'google':
            return self.verify_google_token(token)
        elif provider == 'facebook':
            return self.verify_facebook_token(token)
        elif provider == 'apple':
            return self.verify_apple_token(token)
        else:
            raise TokenVerificationError(f"Unsupported provider: {provider}")
