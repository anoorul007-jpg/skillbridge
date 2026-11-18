from rest_framework import serializers
from .models import MentorshipRelationship, MentoringSession, MentorFeedback
from accounts.serializers import UserSerializer

class MentoringSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentoringSession
        fields = [
            'id', 'relationship', 'title', 'agenda',
            'scheduled_at', 'duration_minutes', 'meeting_link',
            'status', 'created_at'
        ]


class MentorFeedbackSerializer(serializers.ModelSerializer):
    mentor_email = serializers.CharField(source='relationship.mentor.email', read_only=True)
    mentor_name = serializers.CharField(source='relationship.mentor.get_full_name', read_only=True)

    class Meta:
        model = MentorFeedback
        fields = [
            'id', 'relationship', 'session', 'feedback_text',
            'project_suggestions', 'rating', 'mentor_email',
            'mentor_name', 'created_at'
        ]


class MentorshipRelationshipSerializer(serializers.ModelSerializer):
    mentor = UserSerializer(read_only=True)
    student = UserSerializer(read_only=True)
    sessions = MentoringSessionSerializer(many=True, read_only=True)
    feedbacks = MentorFeedbackSerializer(many=True, read_only=True)
    student_stats = serializers.SerializerMethodField()

    class Meta:
        model = MentorshipRelationship
        fields = [
            'id', 'mentor', 'student', 'status', 'notes',
            'sessions', 'feedbacks', 'student_stats', 'created_at'
        ]

    def get_student_stats(self, obj):
        student = obj.student
        profile = getattr(student, 'student_profile', None)
        roadmap = student.roadmaps.first()
        results = student.assessment_results.count()
        return {
            'readiness_score': profile.readiness_score if profile else 0.0,
            'college': profile.college_name if profile else '',
            'degree': profile.degree if profile else '',
            'roadmap_progress': roadmap.progress_percentage if roadmap else 0.0,
            'assessments_taken': results
        }
