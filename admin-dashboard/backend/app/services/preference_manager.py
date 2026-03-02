from app import db
from app.models.notification_preference import NotificationPreference


class PreferenceManager:
    """
    Service for managing user notification preferences.
    Handles creation, retrieval, and updates of notification preferences.
    """

    def get_preferences(self, user_id: int) -> NotificationPreference:
        """
        Get notification preferences for a user.
        Creates default preferences if none exist.
        
        Args:
            user_id: The ID of the user
            
        Returns:
            NotificationPreference object
        """
        preferences = NotificationPreference.query.filter_by(user_id=user_id).first()
        
        if not preferences:
            # Create default preferences (all enabled)
            preferences = NotificationPreference(
                user_id=user_id,
                status_change_enabled=True,
                assignment_enabled=True
            )
            db.session.add(preferences)
            try:
                db.session.commit()
            except Exception:
                # Handle race condition where another request created preferences
                db.session.rollback()
                preferences = NotificationPreference.query.filter_by(user_id=user_id).first()
        
        return preferences

    def update_preferences(
        self,
        user_id: int,
        status_change_enabled: bool = None,
        assignment_enabled: bool = None
    ) -> NotificationPreference:
        """
        Update notification preferences for a user.
        
        Args:
            user_id: The ID of the user
            status_change_enabled: Whether to enable status change notifications
            assignment_enabled: Whether to enable assignment notifications
            
        Returns:
            Updated NotificationPreference object
        """
        preferences = self.get_preferences(user_id)
        
        if status_change_enabled is not None:
            preferences.status_change_enabled = status_change_enabled
        
        if assignment_enabled is not None:
            preferences.assignment_enabled = assignment_enabled
        
        db.session.commit()
        return preferences

    def check_preference_enabled(self, user_id: int, notification_type: str) -> bool:
        """
        Check if a specific notification type is enabled for a user.
        
        Args:
            user_id: The ID of the user
            notification_type: The type of notification ('status_change' or 'assignment')
            
        Returns:
            True if the notification type is enabled, False otherwise
        """
        preferences = self.get_preferences(user_id)
        
        if notification_type == 'status_change':
            return preferences.status_change_enabled
        elif notification_type == 'assignment':
            return preferences.assignment_enabled
        else:
            # Unknown notification type, default to enabled
            return True
