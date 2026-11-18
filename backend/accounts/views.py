from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, StudentProfileSerializer, MentorProfileSerializer
from .models import StudentProfile, MentorProfile
import uuid

User = get_user_model()

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Return token directly for instant frictionless onboarding
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Registration successful.',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        user = request.user
        # Update user basics
        for field in ['first_name', 'last_name', 'phone_number', 'avatar_url']:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()

        # Update role profile
        if user.role == User.Role.STUDENT and hasattr(user, 'student_profile'):
            profile = user.student_profile
            for p_field in ['college_name', 'degree', 'field_of_study', 'graduation_year', 'bio', 'interests', 'linkedin_url', 'github_url', 'target_role_id']:
                if p_field in request.data:
                    setattr(profile, p_field, request.data[p_field])
            profile.save()
        elif user.role == User.Role.MENTOR and hasattr(user, 'mentor_profile'):
            profile = user.mentor_profile
            for m_field in ['organization', 'designation', 'experience_years', 'expertise_areas', 'linkedin_url', 'bio']:
                if m_field in request.data:
                    setattr(profile, m_field, request.data[m_field])
            profile.save()

        return Response(UserSerializer(user).data)


class ForgotPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        if user:
            token = str(uuid.uuid4())[:8].upper()
            user.reset_token = token
            user.save()
            return Response({
                'message': f"Password reset instructions and verification code have been generated.",
                'mock_token': token  # Displayed in response for frictionless testing
            })
        return Response({'message': 'If this email exists in our records, instructions have been sent.'})


class ResetPasswordConfirmView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not all([email, token, new_password]):
            return Response({'error': 'Email, token, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email, reset_token=token).first()
        if not user:
            return Response({'error': 'Invalid reset token or email.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.reset_token = None
        user.save()
        return Response({'message': 'Password has been successfully reset. You can now login.'})


class MentorDirectoryView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        mentors = User.objects.filter(role=User.Role.MENTOR, mentor_profile__is_approved=True)
        serializer = UserSerializer(mentors, many=True)
        return Response(serializer.data)
