from django.http import HttpResponse

class CorsAndRoleMiddleware:
    """CORS header injection and User Role extraction middleware."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'OPTIONS':
            response = HttpResponse()
            self._set_cors_headers(response)
            return response

        # Extract role
        role = request.headers.get('X-User-Role') or 'ADMIN'
        request.user_role = role.upper()

        response = self.get_response(request)
        self._set_cors_headers(response)
        return response

    def _set_cors_headers(self, response):
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-User-Role, X-Requested-With'
        response['Access-Control-Max-Age'] = '86400'
