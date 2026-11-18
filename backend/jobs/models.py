from django.db import models
from django.conf import settings
from careers.models import Skill, CareerRole
from resumes.models import Resume

class JobOpportunity(models.Model):
    JOB_TYPE_CHOICES = [
        ('INTERNSHIP', 'Internship'),
        ('FULL_TIME', 'Full-Time'),
        ('PART_TIME', 'Part-Time'),
        ('CONTRACT', 'Contract'),
    ]
    EXPERIENCE_CHOICES = [
        ('INTERN', 'Internship / Student'),
        ('ENTRY', 'Entry Level (0-2 yrs)'),
        ('MID', 'Mid Level (2-4 yrs)'),
    ]

    title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=200)
    company_logo = models.CharField(max_length=255, blank=True, default='')
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='INTERNSHIP')
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES, default='INTERN')
    location = models.CharField(max_length=150, default='Remote / Hybrid')
    is_remote = models.BooleanField(default=True)
    salary_range = models.CharField(max_length=100, default='Competitive Stipend')
    description = models.TextField()
    responsibilities = models.JSONField(default=list)
    career_role = models.ForeignKey(CareerRole, on_delete=models.SET_NULL, null=True, blank=True, related_name='job_postings')
    required_skills = models.ManyToManyField(Skill, related_name='associated_jobs')
    apply_url = models.URLField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    posted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-posted_at']

    def __str__(self):
        return f"{self.title} at {self.company_name} ({self.get_job_type_display()})"


class JobBookmark(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_bookmarks')
    job = models.ForeignKey(JobOpportunity, on_delete=models.CASCADE, related_name='bookmarked_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'job')

    def __str__(self):
        return f"{self.user.email} saved {self.job.title}"


class JobApplication(models.Model):
    STATUS_CHOICES = [
        ('APPLIED', 'Application Submitted'),
        ('REVIEWING', 'Under Review'),
        ('INTERVIEW_SCHEDULED', 'Interview Scheduled'),
        ('OFFER_EXTENDED', 'Offer Extended'),
        ('REJECTED', 'Not Selected'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='job_applications')
    job = models.ForeignKey(JobOpportunity, on_delete=models.CASCADE, related_name='applications')
    resume = models.ForeignKey(Resume, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='APPLIED')
    cover_note = models.TextField(blank=True, default='')
    interview_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'job')
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.user.email} -> {self.job.title} ({self.status})"
