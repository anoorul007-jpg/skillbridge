from django.db import models
from django.conf import settings

class Skill(models.Model):
    CATEGORY_CHOICES = [
        ('LANGUAGE', 'Programming Language'),
        ('FRAMEWORK', 'Framework & Library'),
        ('DATABASE', 'Database & Storage'),
        ('CLOUD_DEVOPS', 'Cloud & DevOps'),
        ('DATA_AI', 'Data & AI'),
        ('CYBERSECURITY', 'Cybersecurity'),
        ('TOOLS', 'Tools & Platforms'),
        ('SOFT_SKILLS', 'Soft Skills'),
    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='LANGUAGE')
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class StudentSkill(models.Model):
    PROFICIENCY_CHOICES = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    ]
    SOURCE_CHOICES = [
        ('RESUME', 'Resume Extraction'),
        ('MANUAL', 'Self Added'),
        ('ASSESSMENT', 'Skill Assessment'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='student_skills')
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES, default='INTERMEDIATE')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='MANUAL')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'skill')

    def __str__(self):
        return f"{self.user.email} - {self.skill.name} ({self.proficiency})"


class CareerRole(models.Model):
    title = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=150, unique=True)
    description = models.TextField()
    overview = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=50, default='Code')
    demand_level = models.CharField(max_length=50, default='High Demand')
    avg_salary_range = models.CharField(max_length=100, default='$70,000 - $120,000 / yr')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class RequiredSkill(models.Model):
    career_role = models.ForeignKey(CareerRole, on_delete=models.CASCADE, related_name='required_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='career_requirements')
    weight = models.PositiveSmallIntegerField(default=3, help_text="Weight from 1 (nice-to-have) to 5 (critical core)")
    is_mandatory = models.BooleanField(default=True)
    importance_note = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        unique_together = ('career_role', 'skill')

    def __str__(self):
        return f"{self.career_role.title} requires {self.skill.name} (weight: {self.weight})"


class SkillAnalysis(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skill_analyses')
    career_role = models.ForeignKey(CareerRole, on_delete=models.CASCADE, related_name='analyses')
    readiness_score = models.FloatField(default=0.0)
    matched_skills = models.JSONField(default=list)  # list of {name, category, weight, proficiency}
    missing_skills = models.JSONField(default=list)  # list of {name, category, weight, importance_note}
    total_required_weight = models.IntegerField(default=0)
    matched_weight = models.IntegerField(default=0)
    disclaimer = models.TextField(
        default="This readiness score represents technical alignment with typical job specifications and should be used as guidance, not an employment guarantee."
    )
    recommendation_summary = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis: {self.user.email} for {self.career_role.title} ({self.readiness_score}%)"


class LearningRoadmap(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='roadmaps')
    career_role = models.ForeignKey(CareerRole, on_delete=models.CASCADE, related_name='roadmaps')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    estimated_weeks = models.PositiveIntegerField(default=12)
    progress_percentage = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Roadmap for {self.user.email} - {self.career_role.title}"

    def update_progress(self):
        total = self.tasks.count()
        if total == 0:
            self.progress_percentage = 0.0
        else:
            completed = self.tasks.filter(is_completed=True).count()
            self.progress_percentage = round((completed / total) * 100, 1)
        self.save()


class RoadmapTask(models.Model):
    roadmap = models.ForeignKey(LearningRoadmap, on_delete=models.CASCADE, related_name='tasks')
    stage_name = models.CharField(max_length=150, default='Stage 1: Fundamentals')
    title = models.CharField(max_length=255)
    description = models.TextField()
    resources = models.JSONField(default=list)  # list of {title, url, type: 'article'|'video'|'docs'}
    exercise = models.TextField(blank=True, default='')
    estimated_hours = models.PositiveIntegerField(default=6)
    is_completed = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=1)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"[{'X' if self.is_completed else ' '}] {self.stage_name} - {self.title}"


class ProjectRecommendation(models.Model):
    DIFFICULTY_CHOICES = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    ]

    career_role = models.ForeignKey(CareerRole, on_delete=models.CASCADE, related_name='recommended_projects')
    target_skills = models.ManyToManyField(Skill, blank=True, related_name='projects')
    title = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='INTERMEDIATE')
    description = models.TextField()
    technologies = models.JSONField(default=list)
    features = models.JSONField(default=list)
    implementation_steps = models.JSONField(default=list)
    estimated_hours = models.PositiveIntegerField(default=20)
    github_starter_url = models.URLField(blank=True, default='')

    def __str__(self):
        return f"{self.title} ({self.difficulty}) - {self.career_role.title}"
