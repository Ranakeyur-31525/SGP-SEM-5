from django.urls import path
from .views import LoginView, ProfileMeView, UserListView

urlpatterns = [
    path('login/', LoginView.as_view(), name='auth-login'),
    path('me/', ProfileMeView.as_view(), name='profile-me'),
    path('all/', UserListView.as_view(), name='users-all'),
]
