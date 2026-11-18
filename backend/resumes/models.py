import os
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

def validate_resume_file(value):
    ext = os.path.splitext(value.name)[1].lower()
    valid_extensions = ['.pdf', '.docx']
    if ext not in valid_extensions:
        raise ValidationError('Unsupported file format. Please upload a PDF or DOCX file.')
    
    # 5MB limit
    if value.size > 5 * 1024 * 1024:
        raise ValidationError('File size exceeds the 5MB limit.')

def resume_upload_path(instance, filename):
    return f"resumes/user_{instance.user.id}/{filename}"

class Resume(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to=resume_upload_path, validators=[validate_resume_file])
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    file_type = models.CharField(max_length=10)
    extracted_text = models.TextField(blank=True, default='')
    parsed_data = models.JSONField(default=dict, blank=True)
    is_confirmed_by_user = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.user.email} - {self.file_name} ({self.uploaded_at.strftime('%Y-%m-%d')})"
