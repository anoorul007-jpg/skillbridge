from rest_framework import serializers
from .models import Assessment, Question, AssessmentResult

class QuestionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'code_snippet', 'options', 'order']


class AssessmentListSerializer(serializers.ModelSerializer):
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = [
            'id', 'title', 'slug', 'category', 'difficulty',
            'description', 'time_limit_minutes', 'passing_percentage',
            'questions_count', 'created_at'
        ]

    def get_questions_count(self, obj):
        return obj.questions.count()


class AssessmentDetailSerializer(serializers.ModelSerializer):
    questions = QuestionPublicSerializer(many=True, read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = [
            'id', 'title', 'slug', 'category', 'difficulty',
            'description', 'time_limit_minutes', 'passing_percentage',
            'questions_count', 'questions', 'created_at'
        ]

    def get_questions_count(self, obj):
        return obj.questions.count()


class AssessmentResultSerializer(serializers.ModelSerializer):
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    category = serializers.CharField(source='assessment.category', read_only=True)

    class Meta:
        model = AssessmentResult
        fields = [
            'id', 'assessment', 'assessment_title', 'category',
            'score_percentage', 'total_questions', 'correct_answers',
            'answers_submitted', 'passed', 'time_taken_seconds',
            'completed_at'
        ]
