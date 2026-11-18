from django.urls import path
from .views import (
    RegisterView, LoginView, CurrentUserView,
    ForgotPasswordView, ResetPasswordConfirmView, MentorDirectoryView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordConfirmView.as_view(), name='reset_password'),
    path('mentors/', MentorDirectoryView.as_view(), name='mentor_directory'),
]
