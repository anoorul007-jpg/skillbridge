from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        username = extra_fields.pop('username', email.split('@')[0])
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        MENTOR = 'MENTOR', 'Mentor'
        ADMIN = 'ADMIN', 'Administrator'

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)
    is_verified = models.BooleanField(default=True)  # Auto-verified for seamless testing
    verification_code = models.CharField(max_length=64, blank=True, null=True)
    reset_token = models.CharField(max_length=64, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    avatar_url = models.CharField(max_length=255, blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    college_name = models.CharField(max_length=255, blank=True, default='')
    degree = models.CharField(max_length=255, blank=True, default='')
    field_of_study = models.CharField(max_length=255, blank=True, default='')
    graduation_year = models.IntegerField(null=True, blank=True)
    bio = models.TextField(blank=True, default='')
    interests = models.JSONField(default=list, blank=True)
    target_role_id = models.IntegerField(null=True, blank=True)  # References CareerRole
    linkedin_url = models.URLField(blank=True, default='')
    github_url = models.URLField(blank=True, default='')
    readiness_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Student: {self.user.email}"


class MentorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentor_profile')
    organization = models.CharField(max_length=255, blank=True, default='')
    designation = models.CharField(max_length=255, blank=True, default='')
    experience_years = models.IntegerField(default=1)
    expertise_areas = models.JSONField(default=list, blank=True)
    linkedin_url = models.URLField(blank=True, default='')
    bio = models.TextField(blank=True, default='')
    is_approved = models.BooleanField(default=True)
    max_mentees = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Mentor: {self.user.email} - {self.designation}"
