import re
from datetime import datetime, timezone, timedelta
from app import db
from app.models.device_token import DeviceToken


class TokenManager:
    """
    Service for managing push notification tokens.
    Handles registration, retrieval, validation, and cleanup of device tokens.
    """

    # Expo push token format: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
    TOKEN_PATTERN = r'^ExponentPushToken\[[a-zA-Z0-9_-]{22}\]$'

    def validate_token_format(self, token: str) -> bool:
        """
        Validate that the token matches the expected Expo push token format.
        
        Args:
            token: The push token to validate
            
        Returns:
            True if token format is valid, False otherwise
        """
        if not token:
            return False
        return bool(re.match(self.TOKEN_PATTERN, token))

    def register_token(
        self, 
        user_id: int, 
        token: str, 
        platform: str, 
        device_name: str = None
    ) -> DeviceToken:
        """
        Register or update a push token for a user.
        
        Args:
            user_id: The ID of the user
            token: The Expo push token
            platform: The device platform ('ios' or 'android')
            device_name: Optional device name
            
        Returns:
            The DeviceToken object
            
        Raises:
            ValueError: If token format is invalid
        """
        if not self.validate_token_format(token):
            raise ValueError(f"Invalid token format. Expected: ExponentPushToken[...]")
        
        # Check if token already exists for this user
        existing_token = DeviceToken.query.filter_by(
            user_id=user_id,
            expo_push_token=token
        ).first()
        
        if existing_token:
            # Update existing token
            existing_token.platform = platform
            existing_token.device_name = device_name
            existing_token.is_active = True
            existing_token.last_used_at = datetime.now(timezone.utc)
            db.session.commit()
            return existing_token
        
        # Create new token
        new_token = DeviceToken(
            user_id=user_id,
            expo_push_token=token,
            platform=platform,
            device_name=device_name,
            is_active=True,
            last_used_at=datetime.now(timezone.utc)
        )
        db.session.add(new_token)
        db.session.commit()
        return new_token

    def get_active_tokens(self, user_id: int) -> list[DeviceToken]:
        """
        Retrieve all active push tokens for a user.
        
        Args:
            user_id: The ID of the user
            
        Returns:
            List of active DeviceToken objects
        """
        return DeviceToken.query.filter_by(
            user_id=user_id,
            is_active=True
        ).all()

    def mark_token_inactive(self, token: str) -> None:
        """
        Mark a token as inactive (e.g., when Expo reports it as invalid).
        
        Args:
            token: The push token to deactivate
        """
        device_token = DeviceToken.query.filter_by(expo_push_token=token).first()
        if device_token:
            device_token.is_active = False
            db.session.commit()

    def remove_token(self, token: str, user_id: int) -> bool:
        """
        Remove a push token (e.g., on logout).
        
        Args:
            token: The push token to remove
            user_id: The ID of the user (for authorization)
            
        Returns:
            True if token was removed, False if not found
        """
        device_token = DeviceToken.query.filter_by(
            expo_push_token=token,
            user_id=user_id
        ).first()
        
        if device_token:
            db.session.delete(device_token)
            db.session.commit()
            return True
        return False

    def update_last_used(self, token: str) -> None:
        """
        Update the last_used_at timestamp for a token.
        
        Args:
            token: The push token to update
        """
        device_token = DeviceToken.query.filter_by(expo_push_token=token).first()
        if device_token:
            device_token.last_used_at = datetime.now(timezone.utc)
            db.session.commit()

    def cleanup_old_tokens(self, days: int = 90) -> int:
        """
        Remove tokens that haven't been used in the specified number of days.
        
        Args:
            days: Number of days of inactivity before removal (default: 90)
            
        Returns:
            Number of tokens removed
        """
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        old_tokens = DeviceToken.query.filter(
            DeviceToken.last_used_at < cutoff_date
        ).all()
        
        count = len(old_tokens)
        for token in old_tokens:
            db.session.delete(token)
        
        db.session.commit()
        return count
