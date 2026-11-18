from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import MentorshipRelationship, MentoringSession, MentorFeedback
from .serializers import (
    MentorshipRelationshipSerializer, MentoringSessionSerializer, MentorFeedbackSerializer
)
from analytics.models import Notification

User = get_user_model()

class MentorDashboardView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == User.Role.MENTOR:
            relationships = MentorshipRelationship.objects.filter(mentor=user).select_related('student', 'mentor')
            sessions = MentoringSession.objects.filter(relationship__mentor=user).order_by('scheduled_at')
            feedbacks = MentorFeedback.objects.filter(relationship__mentor=user).order_by('-created_at')

            # Aggregate stats
            total_students = relationships.count()
            avg_readiness = 0.0
            if total_students > 0:
                scores = [r.student.student_profile.readiness_score for r in relationships if hasattr(r.student, 'student_profile')]
                avg_readiness = round(sum(scores) / len(scores), 1) if scores else 0.0

            return Response({
                'role': 'MENTOR',
                'stats': {
                    'total_students': total_students,
                    'average_readiness': avg_readiness,
                    'upcoming_sessions': sessions.filter(status='SCHEDULED').count(),
                    'feedbacks_given': feedbacks.count(),
                },
                'relationships': MentorshipRelationshipSerializer(relationships, many=True).data,
                'upcoming_sessions': MentoringSessionSerializer(sessions.filter(status='SCHEDULED')[:5], many=True).data,
                'recent_feedbacks': MentorFeedbackSerializer(feedbacks[:5], many=True).data
            })
        else:
            # Student perspective
            relationships = MentorshipRelationship.objects.filter(student=user).select_related('mentor')
            sessions = MentoringSession.objects.filter(relationship__student=user).order_by('scheduled_at')
            feedbacks = MentorFeedback.objects.filter(relationship__student=user).order_by('-created_at')

            return Response({
                'role': 'STUDENT',
                'relationships': MentorshipRelationshipSerializer(relationships, many=True).data,
                'upcoming_sessions': MentoringSessionSerializer(sessions.filter(status='SCHEDULED')[:5], many=True).data,
                'feedbacks_received': MentorFeedbackSerializer(feedbacks, many=True).data
            })


class RequestMentorshipView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        mentor_id = request.data.get('mentor_id')
        notes = request.data.get('notes', 'I would love guidance on my career roadmap and project architecture.')

        if not mentor_id:
            return Response({'error': 'mentor_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        mentor = User.objects.filter(id=mentor_id, role=User.Role.MENTOR).first()
        if not mentor:
            return Response({'error': 'Mentor not found.'}, status=status.HTTP_404_NOT_FOUND)

        rel, created = MentorshipRelationship.objects.get_or_create(
            mentor=mentor,
            student=request.user,
            defaults={'status': 'ACTIVE', 'notes': notes}
        )

        Notification.objects.create(
            user=mentor,
            title="New Mentee Assigned",
            message=f"{request.user.get_full_name() or request.user.email} joined your mentorship roster.",
            notification_type='MENTORSHIP',
            action_url='/mentor-dashboard'
        )

        return Response(MentorshipRelationshipSerializer(rel).data, status=status.HTTP_201_CREATED)


class ScheduleSessionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        relationship_id = request.data.get('relationship_id')
        title = request.data.get('title', 'SkillBridge 1-on-1 Mentorship Session')
        agenda = request.data.get('agenda', '')
        scheduled_at = request.data.get('scheduled_at')
        duration = request.data.get('duration_minutes', 45)
        meeting_link = request.data.get('meeting_link', 'https://meet.google.com/sb-session')

        if not relationship_id or not scheduled_at:
            return Response({'error': 'relationship_id and scheduled_at are required.'}, status=status.HTTP_400_BAD_REQUEST)

        rel = MentorshipRelationship.objects.filter(id=relationship_id).first()
        if not rel or (rel.mentor != request.user and rel.student != request.user):
            return Response({'error': 'Relationship not found or access denied.'}, status=status.HTTP_403_FORBIDDEN)

        session = MentoringSession.objects.create(
            relationship=rel,
            title=title,
            agenda=agenda,
            scheduled_at=scheduled_at,
            duration_minutes=duration,
            meeting_link=meeting_link,
            status='SCHEDULED'
        )

        # Notify the other party
        recipient = rel.student if request.user == rel.mentor else rel.mentor
        Notification.objects.create(
            user=recipient,
            title=f"Mentorship Session Scheduled: {title}",
            message=f"Session scheduled for {scheduled_at}.",
            notification_type='MENTORSHIP',
            action_url='/mentor-dashboard'
        )

        return Response(MentoringSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class SubmitFeedbackView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != User.Role.MENTOR:
            return Response({'error': 'Only mentors can submit student evaluations.'}, status=status.HTTP_403_FORBIDDEN)

        relationship_id = request.data.get('relationship_id')
        session_id = request.data.get('session_id')
        feedback_text = request.data.get('feedback_text')
        project_suggestions = request.data.get('project_suggestions', '')
        rating = request.data.get('rating', 5)

        if not relationship_id or not feedback_text:
            return Response({'error': 'relationship_id and feedback_text are required.'}, status=status.HTTP_400_BAD_REQUEST)

        rel = MentorshipRelationship.objects.filter(id=relationship_id, mentor=request.user).first()
        if not rel:
            return Response({'error': 'Mentorship relationship not found.'}, status=status.HTTP_404_NOT_FOUND)

        session = None
        if session_id:
            session = MentoringSession.objects.filter(id=session_id, relationship=rel).first()
            if session:
                session.status = 'COMPLETED'
                session.save()

        feedback = MentorFeedback.objects.create(
            relationship=rel,
            session=session,
            feedback_text=feedback_text,
            project_suggestions=project_suggestions,
            rating=rating
        )

        # Notify student
        Notification.objects.create(
            user=rel.student,
            title="New Mentor Feedback Received",
            message=f"Mentor {request.user.get_full_name() or request.user.email} reviewed your progress.",
            notification_type='MENTORSHIP',
            action_url='/mentor-dashboard'
        )

        return Response(MentorFeedbackSerializer(feedback).data, status=status.HTTP_201_CREATED)
