from django.db import models
from django.conf import settings
from careers.models import Skill

class Assessment(models.Model):
    DIFFICULTY_CHOICES = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    category = models.CharField(max_length=50)  # 'Python', 'SQL', 'HTML', 'CSS', 'JavaScript'
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='INTERMEDIATE')
    description = models.TextField()
    time_limit_minutes = models.PositiveIntegerField(default=15)
    passing_percentage = models.PositiveIntegerField(default=70)
    skill = models.ForeignKey(Skill, on_delete=models.SET_NULL, null=True, blank=True, related_name='assessments')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.category})"


class Question(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    code_snippet = models.TextField(blank=True, default='')
    options = models.JSONField(help_text="List of choices: [{'id': 'A', 'text': '...'}, ...]")
    correct_option = models.CharField(max_length=5)  # 'A', 'B', 'C', 'D'
    explanation = models.TextField(help_text="Educational breakdown explaining why the answer is correct")
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}..."


class AssessmentResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assessment_results')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='results')
    score_percentage = models.FloatField()
    total_questions = models.PositiveIntegerField()
    correct_answers = models.PositiveIntegerField()
    answers_submitted = models.JSONField(default=dict)  # {question_id: selected_option}
    passed = models.BooleanField(default=False)
    time_taken_seconds = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.email} - {self.assessment.title}: {self.score_percentage}%"
