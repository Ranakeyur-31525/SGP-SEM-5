import jwt
import datetime
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.db import get_users_col

def generate_jwt(user_dict: dict) -> str:
    payload = {
        'id': user_dict.get('id'),
        'role': user_dict.get('role'),
        'email': user_dict.get('email'),
        'assigned_bed': user_dict.get('assigned_bed'),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

class LoginView(APIView):
    """Authenticate staff or bedside patient and generate access token."""
    def post(self, request):
        data = request.data
        role = data.get('role', 'PATIENT').upper()
        email = data.get('email')

        users_col = get_users_col()
        user = None

        if email:
            user = users_col.find_one({'email': email})
        if not user:
            user = users_col.find_one({'role': role})

        if not user:
            # Fallback default user
            user = {
                'id': f'usr_{role.lower()}_01',
                'name': 'Ramesh Sharma' if role == 'PATIENT' else f'Staff ({role})',
                'email': email or f'{role.lower()}@medibot.hospital',
                'role': role,
                'assigned_bed': 12 if role == 'PATIENT' else None,
                'department': 'Cardiology Floor 2' if role == 'PATIENT' else 'Clinical Care',
            }

        token = generate_jwt(user)
        return Response({
            'success': True,
            'token': token,
            'user': {
                'id': user.get('id'),
                'name': user.get('name'),
                'email': user.get('email'),
                'role': user.get('role'),
                'assigned_bed': user.get('assigned_bed'),
                'department': user.get('department'),
            }
        }, status=status.HTTP_200_OK)


class ProfileMeView(APIView):
    """Return profile of current user with role-gated bed clearance."""
    def get(self, request):
        role = getattr(request, 'user_role', 'ADMIN')
        users_col = get_users_col()
        user = users_col.find_one({'role': role})

        if not user:
            user = {
                'id': f'usr_{role.lower()}_01',
                'name': 'Ramesh Sharma' if role == 'PATIENT' else f'Staff ({role})',
                'email': f'{role.lower()}@medibot.hospital',
                'role': role,
                'assigned_bed': 12 if role == 'PATIENT' else None,
                'department': 'Cardiology Floor 2' if role == 'PATIENT' else 'Hospital Operations',
            }

        return Response({
            'user': user,
            'is_patient_bed_isolated': role == 'PATIENT',
            'allowed_bed': 12 if role == 'PATIENT' else 'ALL_50_BEDS',
        })


class UserListView(APIView):
    """List staff and admitted hospital bed patients."""
    def get(self, request):
        users_col = get_users_col()
        users = users_col.find()
        # Clean mongo _id
        cleaned = [{k: str(v) if k == '_id' else v for k, v in u.items()} for u in users]
        return Response({'users': cleaned, 'count': len(cleaned)})
