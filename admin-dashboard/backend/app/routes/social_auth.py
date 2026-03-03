"""
Social Authentication Routes

API endpoints for social authentication (Google, Facebook, Apple).

Requirements: 1.1-1.4, 2.1-2.4, 3.1-3.4, 5.1, 5.5, 10.1, 10.4, 12.1, 12.3
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.social_auth_service import (
    SocialAuthService, 
    SocialAuthError, 
    AccountConflictError,
    AccountLockoutError
)
from app.services.token_verification import TokenVerificationError
import logging

logger = logging.getLogger(__name__)

social_auth_bp = Blueprint('social_auth', __name__)
social_auth_service = SocialAuthService()


@social_auth_bp.route('/auth/social/login', methods=['POST'])
def social_login():
    """
    Authenticate user with social provider credentials.
    
    Request body:
        {
            "provider": "google" | "facebook" | "apple",
            "token": "provider_oauth_token",
            "profile": {  // Optional, for Apple name data
                "first_name": "John",
                "last_name": "Doe"
            }
        }
    
    Response:
        200: {"token": "jwt_token", "user": {...}}
        400: {"error": "error_message", "error_code": "ERROR_CODE"}
        401: {"error": "error_message", "error_code": "INVALID_TOKEN"}
        409: {"error": "error_message", "error_code": "ACCOUNT_CONFLICT"}
        503: {"error": "error_message", "error_code": "SERVICE_UNAVAILABLE"}
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Request body is required',
                'error_code': 'MISSING_BODY'
            }), 400
        
        provider = data.get('provider', '').lower()
        token = data.get('token', '')
        profile = data.get('profile')
        
        if not provider:
            return jsonify({
                'error': 'Provider is required',
                'error_code': 'MISSING_PROVIDER'
            }), 400
        
        if not token:
            return jsonify({
                'error': 'Token is required',
                'error_code': 'MISSING_TOKEN'
            }), 400
        
        if provider not in ['google', 'facebook', 'apple']:
            return jsonify({
                'error': f'Unsupported provider: {provider}',
                'error_code': 'UNSUPPORTED_PROVIDER'
            }), 400
        
        # Authenticate user
        user, jwt_token = social_auth_service.authenticate_social_user(
            provider, token, profile
        )
        
        return jsonify({
            'token': jwt_token,
            'user': user.to_dict()
        }), 200
        
    except TokenVerificationError as e:
        logger.warning(f"Token verification failed: {str(e)}")
        return jsonify({
            'error': str(e),
            'error_code': 'INVALID_TOKEN',
            'details': 'The provided token could not be verified',
            'suggested_action': 'Please try signing in again'
        }), 401
        
    except AccountConflictError as e:
        logger.info(f"Account conflict: {str(e)}")
        return jsonify({
            'error': str(e),
            'error_code': 'ACCOUNT_CONFLICT',
            'details': 'An account with this email already exists',
            'suggested_action': 'Please sign in with your existing method or link accounts'
        }), 409
        
    except SocialAuthError as e:
        logger.error(f"Social auth error: {str(e)}")
        return jsonify({
            'error': str(e),
            'error_code': 'AUTH_ERROR',
            'details': 'Authentication failed',
            'suggested_action': 'Please try again or use a different authentication method'
        }), 400
        
    except Exception as e:
        logger.error(f"Unexpected error in social login: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'An unexpected error occurred',
            'error_code': 'INTERNAL_ERROR',
            'details': 'Please try again later',
            'suggested_action': 'If the problem persists, contact support'
        }), 503


@social_auth_bp.route('/auth/social/link', methods=['POST'])
@jwt_required()
def link_social_account():
    """
    Link a social provider account to the authenticated user.
    
    Request body:
        {
            "provider": "google" | "facebook" | "apple",
            "token": "provider_oauth_token"
        }
    
    Response:
        200: {"success": true, "message": "Account linked successfully"}
        400: {"error": "error_message", "error_code": "ERROR_CODE"}
        401: {"error": "error_message", "error_code": "INVALID_TOKEN"}
    """
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Request body is required',
                'error_code': 'MISSING_BODY'
            }), 400
        
        provider = data.get('provider', '').lower()
        token = data.get('token', '')
        
        if not provider or not token:
            return jsonify({
                'error': 'Provider and token are required',
                'error_code': 'MISSING_FIELDS'
            }), 400
        
        if provider not in ['google', 'facebook', 'apple']:
            return jsonify({
                'error': f'Unsupported provider: {provider}',
                'error_code': 'UNSUPPORTED_PROVIDER'
            }), 400
        
        # Link account
        social_auth_service.link_social_account(user_id, provider, token)
        
        return jsonify({
            'success': True,
            'message': f'{provider.capitalize()} account linked successfully'
        }), 200
        
    except TokenVerificationError as e:
        logger.warning(f"Token verification failed during linking: {str(e)}")
        return jsonify({
            'error': str(e),
            'error_code': 'INVALID_TOKEN'
        }), 401
        
    except SocialAuthError as e:
        logger.error(f"Account linking error: {str(e)}")
        return jsonify({
            'error': str(e),
            'error_code': 'LINKING_ERROR'
        }), 400
        
    except Exception as e:
        logger.error(f"Unexpected error in account linking: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'An unexpected error occurred',
            'error_code': 'INTERNAL_ERROR'
        }), 500


@social_auth_bp.route('/auth/social/unlink', methods=['DELETE'])
@jwt_required()
def unlink_social_account():
    """
    Unlink a social provider account from the authenticated user.
    
    Request body:
        {
            "provider": "google" | "facebook" | "apple"
        }
    
    Response:
        200: {"success": true, "message": "Account unlinked successfully"}
        400: {"error": "error_message", "error_code": "ERROR_CODE"}
    """
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Request body is required',
                'error_code': 'MISSING_BODY'
            }), 400
        
        provider = data.get('provider', '').lower()
        
        if not provider:
            return jsonify({
                'error': 'Provider is required',
                'error_code': 'MISSING_PROVIDER'
            }), 400
        
        if provider not in ['google', 'facebook', 'apple']:
            return jsonify({
                'error': f'Unsupported provider: {provider}',
                'error_code': 'UNSUPPORTED_PROVIDER'
            }), 400
        
        # Unlink account
        social_auth_service.unlink_social_account(user_id, provider)
        
        return jsonify({
            'success': True,
            'message': f'{provider.capitalize()} account unlinked successfully'
        }), 200
        
    except AccountLockoutError as e:
        logger.warning(f"Account lockout prevented: {str(e)}")
        return jsonify({
            'error': str(e),
            'error_code': 'ACCOUNT_LOCKOUT',
            'details': 'Cannot remove the last authentication method',
            'suggested_action': 'Set a password or link another social account first'
        }), 400
        
    except SocialAuthError as e:
        logger.error(f"Account unlinking error: {str(e)}")
        return jsonify({
            'error': str(e),
            'error_code': 'UNLINKING_ERROR'
        }), 400
        
    except Exception as e:
        logger.error(f"Unexpected error in account unlinking: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'An unexpected error occurred',
            'error_code': 'INTERNAL_ERROR'
        }), 500


@social_auth_bp.route('/auth/methods/<email>', methods=['GET'])
def get_auth_methods(email):
    """
    Get available authentication methods for an email address.
    
    Response:
        200: {
            "email": "user@example.com",
            "has_password": true,
            "linked_providers": ["google", "facebook"]
        }
    """
    try:
        if not email:
            return jsonify({
                'error': 'Email is required',
                'error_code': 'MISSING_EMAIL'
            }), 400
        
        auth_methods = social_auth_service.get_auth_methods(email)
        
        return jsonify({
            'email': email,
            'has_password': auth_methods['has_password'],
            'linked_providers': auth_methods['linked_providers']
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting auth methods: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'An unexpected error occurred',
            'error_code': 'INTERNAL_ERROR'
        }), 500
