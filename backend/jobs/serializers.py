from rest_framework import serializers
from .models import JobOpportunity, JobBookmark, JobApplication
from careers.models import Skill
from careers.serializers import SkillSerializer

class JobOpportunitySerializer(serializers.ModelSerializer):
    required_skills = SkillSerializer(many=True, read_only=True)
    required_skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Skill.objects.all(), write_only=True, source='required_skills', required=False
    )
    job_type_display = serializers.CharField(source='get_job_type_display', read_only=True)
    experience_level_display = serializers.CharField(source='get_experience_level_display', read_only=True)
    user_match = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()

    class Meta:
        model = JobOpportunity
        fields = [
            'id', 'title', 'company_name', 'company_logo',
            'job_type', 'job_type_display', 'experience_level', 'experience_level_display',
            'location', 'is_remote', 'salary_range', 'description',
            'responsibilities', 'career_role', 'required_skills', 'required_skill_ids',
            'apply_url', 'is_active', 'posted_at',
            'user_match', 'is_bookmarked', 'has_applied'
        ]

    def get_user_match(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return {"match_percentage": 0, "matched": [], "missing": []}

        user_skills = set(
            request.user.skills.values_list('skill__name', flat=True)
        )
        job_skills = list(obj.required_skills.values_list('name', flat=True))

        if not job_skills:
            return {"match_percentage": 100, "matched": [], "missing": []}

        matched = [s for s in job_skills if s in user_skills]
        missing = [s for s in job_skills if s not in user_skills]
        pct = round((len(matched) / len(job_skills)) * 100, 1)

        return {
            "match_percentage": pct,
            "matched_skills": matched,
            "missing_skills": missing,
            "total_required": len(job_skills)
        }

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return JobBookmark.objects.filter(user=request.user, job=obj).exists()

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return JobApplication.objects.filter(user=request.user, job=obj).exists()


class JobApplicationSerializer(serializers.ModelSerializer):
    job = JobOpportunitySerializer(read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=JobOpportunity.objects.all(), write_only=True, source='job'
    )
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    applicant_email = serializers.CharField(source='user.email', read_only=True)
    applicant_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_id', 'status', 'status_display',
            'cover_note', 'interview_date', 'notes',
            'applicant_email', 'applicant_name', 'applied_at', 'updated_at'
        ]


class JobBookmarkSerializer(serializers.ModelSerializer):
    job = JobOpportunitySerializer(read_only=True)

    class Meta:
        model = JobBookmark
        fields = ['id', 'job', 'saved_at']
