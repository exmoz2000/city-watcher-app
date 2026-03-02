import time
import logging
from typing import Dict, Any, List, Callable
from datetime import datetime, timezone
from exponent_server_sdk import (
    DeviceNotRegisteredError,
    PushClient,
    PushMessage,
    PushServerError,
    PushTicketError,
)
from app import db
from app.models.notification import Notification
from app.models.report import Report
from app.services.token_manager import TokenManager
from app.services.preference_manager import PreferenceManager

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Service for sending push notifications via Expo.
    Handles notification delivery, retry logic, and history logging.
    """

    def __init__(self):
        self.expo_client = PushClient()
        self.token_manager = TokenManager()
        self.preference_manager = PreferenceManager()
        self.max_retries = 3
        self.retry_delays = [1, 5, 15]  # seconds

    def send_status_change_notification(
        self, 
        report_id: int, 
        old_status: str, 
        new_status: str
    ) -> Dict[str, Any]:
        """
        Send notification for report status change.
        
        Args:
            report_id: The ID of the report
            old_status: The previous status
            new_status: The new status
            
        Returns:
            Dictionary with success status and details
        """
        logger.info(f"=== NOTIFICATION TRIGGER === Status change for report {report_id}: {old_status} -> {new_status}")
        
        # Get report and submitter
        report = Report.query.get(report_id)
        if not report:
            logger.error(f"Report {report_id} not found")
            return {"success": False, "error": "Report not found"}
        
        user_id = report.submitter_id
        if not user_id:
            logger.error(f"Report {report_id} has no submitter")
            return {"success": False, "error": "No submitter found"}
        
        logger.info(f"Found submitter user_id={user_id} for report {report_id}")
        
        # Build notification
        title = "Report Status Updated"
        body = f"Report #{report.report_number} status changed to {new_status}"
        data = {
            "reportId": report_id,
            "type": "status_change",
            "oldStatus": old_status,
            "newStatus": new_status,
        }
        
        return self._send_notification(
            user_id=user_id,
            report_id=report_id,
            notification_type="status_change",
            title=title,
            body=body,
            data=data
        )

    def send_assignment_notification(
        self, 
        report_id: int, 
        admin_name: str = None
    ) -> Dict[str, Any]:
        """
        Send notification for report assignment.
        
        Args:
            report_id: The ID of the report
            admin_name: Optional name of the assigned administrator
            
        Returns:
            Dictionary with success status and details
        """
        # Get report and submitter
        report = Report.query.get(report_id)
        if not report:
            logger.error(f"Report {report_id} not found")
            return {"success": False, "error": "Report not found"}
        
        user_id = report.submitter_id
        if not user_id:
            logger.error(f"Report {report_id} has no submitter")
            return {"success": False, "error": "No submitter found"}
        
        # Build notification
        title = "Report Assigned"
        body = f"Report #{report.report_number} has been assigned to a team member"
        data = {
            "reportId": report_id,
            "type": "assignment",
        }
        
        return self._send_notification(
            user_id=user_id,
            report_id=report_id,
            notification_type="assignment",
            title=title,
            body=body,
            data=data
        )

    def _send_notification(
        self,
        user_id: int,
        report_id: int,
        notification_type: str,
        title: str,
        body: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Core notification sending logic.
        
        Args:
            user_id: The ID of the user to notify
            report_id: The ID of the related report
            notification_type: Type of notification ('status_change' or 'assignment')
            title: Notification title
            body: Notification body
            data: Additional data payload
            
        Returns:
            Dictionary with success status and details
        """
        try:
            # Check user preferences
            if not self.preference_manager.check_preference_enabled(user_id, notification_type):
                logger.info(f"User {user_id} has disabled {notification_type} notifications")
                return {"success": False, "error": "Notification type disabled by user"}
            
            logger.info(f"User {user_id} has {notification_type} notifications enabled")
            
            # Get active tokens
            tokens = self.token_manager.get_active_tokens(user_id)
            if not tokens:
                logger.warning(f"No active tokens found for user {user_id}")
                self._log_notification(
                    user_id=user_id,
                    report_id=report_id,
                    notification_type=notification_type,
                    title=title,
                    body=body,
                    status="failed",
                    error_message="No active push tokens"
                )
                return {"success": False, "error": "No active push tokens"}
            
            logger.info(f"Found {len(tokens)} active token(s) for user {user_id}")
            
            # Send to Expo
            token_strings = [token.expo_push_token for token in tokens]
            logger.info(f"Sending notification to Expo with tokens: {token_strings}")
            responses = self._send_to_expo(token_strings, title, body, data)
            
            # Handle responses
            self._handle_expo_response(responses, tokens)
            
            logger.info(f"Notification sent successfully to {len(token_strings)} token(s)")
            
            # Log successful notification
            self._log_notification(
                user_id=user_id,
                report_id=report_id,
                notification_type=notification_type,
                title=title,
                body=body,
                status="sent"
            )
            
            return {
                "success": True,
                "tokens_sent": len(token_strings),
                "responses": responses
            }
            
        except Exception as e:
            logger.error(f"Error sending notification: {str(e)}", exc_info=True)
            self._log_notification(
                user_id=user_id,
                report_id=report_id,
                notification_type=notification_type,
                title=title,
                body=body,
                status="failed",
                error_message=str(e)
            )
            return {"success": False, "error": str(e)}

    def _send_to_expo(
        self, 
        tokens: List[str], 
        title: str,
        body: str,
        data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Send push notification via Expo API.
        
        Args:
            tokens: List of Expo push tokens
            title: Notification title
            body: Notification body
            data: Additional data payload
            
        Returns:
            List of response dictionaries
        """
        messages = []
        for token in tokens:
            messages.append(PushMessage(
                to=token,
                title=title,
                body=body,
                data=data,
                sound="default",
                priority="high"
            ))
        
        # Send with retry logic
        def send_func():
            try:
                return self.expo_client.publish_multiple(messages)
            except PushServerError as e:
                logger.error(f"Expo server error: {e.errors}, {e.response_data}")
                raise
        
        responses = self._retry_with_backoff(send_func)
        
        # Convert responses to dictionaries
        result = []
        for response in responses:
            result.append({
                "status": response.status if hasattr(response, 'status') else "ok",
                "message": response.message if hasattr(response, 'message') else None,
                "details": response.details if hasattr(response, 'details') else None,
            })
        
        return result

    def _handle_expo_response(
        self, 
        responses: List[Dict[str, Any]], 
        tokens: List
    ) -> None:
        """
        Process Expo API responses and update token status.
        
        Args:
            responses: List of response dictionaries from Expo
            tokens: List of DeviceToken objects
        """
        for i, response in enumerate(responses):
            if i >= len(tokens):
                break
            
            token = tokens[i]
            status = response.get("status")
            details = response.get("details", {})
            
            if status == "error":
                error_type = details.get("error") if isinstance(details, dict) else None
                
                # Mark token as inactive if device not registered
                if error_type == "DeviceNotRegistered":
                    logger.warning(f"Token {token.expo_push_token} is not registered, marking inactive")
                    self.token_manager.mark_token_inactive(token.expo_push_token)
                else:
                    logger.error(f"Push notification error for token {token.expo_push_token}: {error_type}")
            else:
                # Update last_used timestamp for successful delivery
                self.token_manager.update_last_used(token.expo_push_token)

    def _log_notification(
        self,
        user_id: int,
        report_id: int,
        notification_type: str,
        title: str,
        body: str,
        status: str,
        error_message: str = None
    ) -> None:
        """
        Store notification in history.
        
        Args:
            user_id: The ID of the user
            report_id: The ID of the report
            notification_type: Type of notification
            title: Notification title
            body: Notification body
            status: Status ('sent', 'failed', 'pending')
            error_message: Optional error message
        """
        try:
            notification = Notification(
                user_id=user_id,
                report_id=report_id,
                notification_type=notification_type,
                type=notification_type,  # For backward compatibility
                title=title,
                message=body,
                body=body,
                status=status,
                error_message=error_message,
                sent_at=datetime.now(timezone.utc)
            )
            db.session.add(notification)
            db.session.commit()
        except Exception as e:
            logger.error(f"Error logging notification: {str(e)}", exc_info=True)
            db.session.rollback()

    def _retry_with_backoff(
        self, 
        func: Callable, 
        *args, 
        **kwargs
    ) -> Any:
        """
        Retry function with exponential backoff.
        
        Args:
            func: Function to retry
            *args: Positional arguments for the function
            **kwargs: Keyword arguments for the function
            
        Returns:
            Result of the function
            
        Raises:
            Last exception if all retries fail
        """
        last_exception = None
        
        for attempt in range(self.max_retries):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                if attempt < self.max_retries - 1:
                    delay = self.retry_delays[attempt]
                    logger.warning(f"Attempt {attempt + 1} failed, retrying in {delay}s: {str(e)}")
                    time.sleep(delay)
                else:
                    logger.error(f"All {self.max_retries} attempts failed: {str(e)}")
        
        raise last_exception
