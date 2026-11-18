from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Assessment, Question, AssessmentResult
from .serializers import (
    AssessmentListSerializer, AssessmentDetailSerializer, AssessmentResultSerializer
)
from careers.models import Skill, StudentSkill, CareerRole
from careers.services import perform_skill_gap_analysis
from analytics.models import Notification

class AssessmentListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category')
        qs = Assessment.objects.all().order_by('id')
        if category:
            qs = qs.filter(category__iexact=category)
        return Response(AssessmentListSerializer(qs, many=True).data)


class AssessmentDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        assessment = Assessment.objects.filter(pk=pk).first()
        if not assessment:
            return Response({'error': 'Assessment not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(AssessmentDetailSerializer(assessment).data)


class AssessmentSubmitView(views.APIView):
    """
    Submits user answers, calculates scores, generates educational breakdown,
    records results, and updates student's verified skills!
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        assessment = Assessment.objects.filter(pk=pk).first()
        if not assessment:
            return Response({'error': 'Assessment not found.'}, status=status.HTTP_404_NOT_FOUND)

        submitted_answers = request.data.get('answers', {})  # { question_id: 'A' }
        time_taken_seconds = request.data.get('time_taken_seconds', 0)

        questions = assessment.questions.all()
        total_questions = questions.count()

        if total_questions == 0:
            return Response({'error': 'Assessment has no questions configured.'}, status=status.HTTP_400_BAD_REQUEST)

        correct_count = 0
        detailed_breakdown = []

        for q in questions:
            user_choice = submitted_answers.get(str(q.id)) or submitted_answers.get(q.id)
            is_correct = (user_choice == q.correct_option)
            if is_correct:
                correct_count += 1

            detailed_breakdown.append({
                'question_id': q.id,
                'question_text': q.question_text,
                'code_snippet': q.code_snippet,
                'options': q.options,
                'user_choice': user_choice,
                'correct_option': q.correct_option,
                'is_correct': is_correct,
                'explanation': q.explanation
            })

        score_pct = round((correct_count / total_questions) * 100, 1)
        passed = (score_pct >= assessment.passing_percentage)

        # Record result
        result = AssessmentResult.objects.create(
            user=request.user,
            assessment=assessment,
            score_percentage=score_pct,
            total_questions=total_questions,
            correct_answers=correct_count,
            answers_submitted=submitted_answers,
            passed=passed,
            time_taken_seconds=time_taken_seconds
        )

        # If passed, verify or add corresponding Skill in student profile
        verified_skill_name = None
        if passed:
            skill_name_candidate = assessment.category
            skill_obj = Skill.objects.filter(name__iexact=skill_name_candidate).first()
            if not skill_obj:
                skill_obj, _ = Skill.objects.get_or_create(
                    name=skill_name_candidate,
                    defaults={'category': 'LANGUAGE'}
                )
            
            StudentSkill.objects.update_or_create(
                user=request.user,
                skill=skill_obj,
                defaults={
                    'proficiency': 'ADVANCED' if score_pct >= 90 else 'INTERMEDIATE',
                    'source': 'ASSESSMENT',
                    'is_verified': True
                }
            )
            verified_skill_name = skill_obj.name

            # Refresh student's skill gap score
            profile = getattr(request.user, 'student_profile', None)
            if profile and profile.target_role_id:
                role = CareerRole.objects.filter(id=profile.target_role_id).first()
                if role:
                    perform_skill_gap_analysis(request.user, role)

        # Notify user
        Notification.objects.create(
            user=request.user,
            title=f"Assessment Complete: {assessment.title}",
            message=f"You scored {score_pct}% ({'Passed ✅' if passed else 'Needs Review 🔄'}).",
            notification_type='ASSESSMENT',
            action_url='/assessments'
        )

        return Response({
            'message': 'Assessment submitted successfully.',
            'result': AssessmentResultSerializer(result).data,
            'passed': passed,
            'verified_skill': verified_skill_name,
            'breakdown': detailed_breakdown
        }, status=status.HTTP_201_CREATED)


class UserAssessmentResultsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        results = AssessmentResult.objects.filter(user=request.user).select_related('assessment')
        return Response(AssessmentResultSerializer(results, many=True).data)
