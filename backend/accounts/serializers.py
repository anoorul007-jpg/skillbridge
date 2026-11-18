from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, StudentProfile, MentorProfile
from careers.models import CareerRole

class StudentProfileSerializer(serializers.ModelSerializer):
    target_role_title = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'college_name', 'degree', 'field_of_study', 'graduation_year',
            'bio', 'interests', 'target_role_id', 'target_role_title',
            'linkedin_url', 'github_url', 'readiness_score', 'created_at', 'updated_at'
        ]

    def get_target_role_title(self, obj):
        if obj.target_role_id:
            role = CareerRole.objects.filter(id=obj.target_role_id).first()
            return role.title if role else None
        return None


class MentorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorProfile
        fields = [
            'id', 'organization', 'designation', 'experience_years',
            'expertise_areas', 'linkedin_url', 'bio', 'is_approved',
            'max_mentees', 'created_at', 'updated_at'
        ]


class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    mentor_profile = MentorProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'role', 'is_verified', 'phone_number', 'avatar_url',
            'student_profile', 'mentor_profile'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=User.Role.choices, default=User.Role.STUDENT)
    college_name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    degree = serializers.CharField(required=False, allow_blank=True, write_only=True)
    organization = serializers.CharField(required=False, allow_blank=True, write_only=True)
    designation = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'first_name', 'last_name',
            'role', 'college_name', 'degree', 'organization', 'designation'
        ]

    def create(self, validated_data):
        college_name = validated_data.pop('college_name', '')
        degree = validated_data.pop('degree', '')
        organization = validated_data.pop('organization', '')
        designation = validated_data.pop('designation', '')
        password = validated_data.pop('password')

        user = User.objects.create_user(password=password, **validated_data)

        if user.role == User.Role.STUDENT:
            StudentProfile.objects.create(
                user=user,
                college_name=college_name,
                degree=degree
            )
        elif user.role == User.Role.MENTOR:
            MentorProfile.objects.create(
                user=user,
                organization=organization,
                designation=designation
            )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')

        refresh = RefreshToken.for_user(user)
        return {
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }
