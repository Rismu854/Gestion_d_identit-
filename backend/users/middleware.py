# users/middleware.py
from django.conf import settings
import jwt
from datetime import datetime, timedelta
from django.utils.timezone import make_aware
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

class TokenRefreshMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if token is about to expire and refresh it
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # Decode token without verification to check expiry
                decoded = jwt.decode(token, options={"verify_signature": False})
                exp_timestamp = decoded.get('exp')
                
                # If token is about to expire in the next 5 minutes
                if exp_timestamp:
                    exp_time = datetime.fromtimestamp(exp_timestamp)
                    now = datetime.now()
                    
                    # If token expires in less than 5 minutes
                    if exp_time - now < timedelta(minutes=5):
                        # Try to get refresh token from session
                        refresh_token = request.session.get('refresh_token')
                        if refresh_token:
                            try:
                                # Use refresh token to get new access token
                                refresh = RefreshToken(refresh_token)
                                new_token = str(refresh.access_token)
                                
                                # Replace the Authorization header
                                request.META['HTTP_AUTHORIZATION'] = f'Bearer {new_token}'
                            except TokenError:
                                # If refresh fails, continue with the original token
                                pass
            except (jwt.DecodeError, jwt.ExpiredSignatureError):
                # If token is invalid, continue and let the view handle it
                pass
        
        response = self.get_response(request)
        return response