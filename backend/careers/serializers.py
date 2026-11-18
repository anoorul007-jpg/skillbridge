from rest_framework import serializers
from .models import (
    Skill, StudentSkill, CareerRole, RequiredSkill,
    SkillAnalysis, LearningRoadmap, RoadmapTask, ProjectRecommendation
)

class SkillSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'category_display', 'description']


class StudentSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    category = serializers.CharField(source='skill.get_category_display', read_only=True)

    class Meta:
        model = StudentSkill
        fields = ['id', 'skill', 'skill_name', 'category', 'proficiency', 'source', 'is_verified', 'created_at']
        read_only_fields = ['id', 'created_at']


class RequiredSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    category = serializers.CharField(source='skill.get_category_display', read_only=True)

    class Meta:
        model = RequiredSkill
        fields = ['id', 'skill', 'skill_name', 'category', 'weight', 'is_mandatory', 'importance_note']


class CareerRoleSerializer(serializers.ModelSerializer):
    required_skills = RequiredSkillSerializer(many=True, read_only=True)
    required_skills_count = serializers.SerializerMethodField()

    class Meta:
        model = CareerRole
        fields = [
            'id', 'title', 'slug', 'description', 'overview',
            'icon', 'demand_level', 'avg_salary_range',
            'required_skills_count', 'required_skills', 'created_at'
        ]

    def get_required_skills_count(self, obj):
        return obj.required_skills.count()


class SkillAnalysisSerializer(serializers.ModelSerializer):
    career_role_title = serializers.CharField(source='career_role.title', read_only=True)
    career_role_icon = serializers.CharField(source='career_role.icon', read_only=True)

    class Meta:
        model = SkillAnalysis
        fields = [
            'id', 'career_role', 'career_role_title', 'career_role_icon',
            'readiness_score', 'matched_skills', 'missing_skills',
            'total_required_weight', 'matched_weight',
            'recommendation_summary', 'disclaimer', 'created_at'
        ]


class RoadmapTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapTask
        fields = [
            'id', 'stage_name', 'title', 'description',
            'resources', 'exercise', 'estimated_hours',
            'is_completed', 'order', 'completed_at'
        ]


class LearningRoadmapSerializer(serializers.ModelSerializer):
    tasks = RoadmapTaskSerializer(many=True, read_only=True)
    career_role_title = serializers.CharField(source='career_role.title', read_only=True)
    total_tasks = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()

    class Meta:
        model = LearningRoadmap
        fields = [
            'id', 'career_role', 'career_role_title', 'title',
            'description', 'estimated_weeks', 'progress_percentage',
            'total_tasks', 'completed_tasks', 'tasks', 'created_at', 'updated_at'
        ]

    def get_total_tasks(self, obj):
        return obj.tasks.count()

    def get_completed_tasks(self, obj):
        return obj.tasks.filter(is_completed=True).count()


class ProjectRecommendationSerializer(serializers.ModelSerializer):
    career_role_title = serializers.CharField(source='career_role.title', read_only=True)

    class Meta:
        model = ProjectRecommendation
        fields = [
            'id', 'career_role', 'career_role_title', 'title',
            'difficulty', 'description', 'technologies',
            'features', 'implementation_steps', 'estimated_hours',
            'github_starter_url'
        ]
