from django.db import models
from django.conf import settings

class MentorshipRelationship(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('PAUSED', 'Paused'),
    ]

    mentor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mentorship_mentees')
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mentorship_mentors')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('mentor', 'student')

    def __str__(self):
        return f"Mentor: {self.mentor.email} -> Student: {self.student.email} ({self.status})"


class MentoringSession(models.Model):
    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    relationship = models.ForeignKey(MentorshipRelationship, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=200)
    agenda = models.TextField(blank=True, default='')
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=45)
    meeting_link = models.URLField(blank=True, default='https://meet.google.com/sb-mentor-session')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['scheduled_at']

    def __str__(self):
        return f"{self.title} on {self.scheduled_at.strftime('%Y-%m-%d %H:%M')}"


class MentorFeedback(models.Model):
    relationship = models.ForeignKey(MentorshipRelationship, on_delete=models.CASCADE, related_name='feedbacks')
    session = models.ForeignKey(MentoringSession, on_delete=models.SET_NULL, null=True, blank=True, related_name='feedbacks')
    feedback_text = models.TextField()
    project_suggestions = models.TextField(blank=True, default='')
    rating = models.PositiveSmallIntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback for {self.relationship.student.email} by {self.relationship.mentor.email}"
