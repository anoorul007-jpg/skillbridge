from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from .models import Notification, ActivityLog
from .serializers import NotificationSerializer, ActivityLogSerializer
from accounts.models import StudentProfile, MentorProfile
from accounts.serializers import UserSerializer
from careers.models import CareerRole, Skill, SkillAnalysis, LearningRoadmap, ProjectRecommendation
from assessments.models import Assessment, AssessmentResult
from jobs.models import JobOpportunity, JobApplication

User = get_user_model()

class NotificationListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)
        unread_count = notifications.filter(is_read=False).count()
        return Response({
            'unread_count': unread_count,
            'notifications': NotificationSerializer(notifications[:30], many=True).data
        })

    def post(self, request):
        # Mark all as read
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'message': 'All notifications marked as read.'})


class NotificationMarkReadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        notif = Notification.objects.filter(pk=pk, user=request.user).first()
        if not notif:
            return Response({'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)
        notif.is_read = True
        notif.save()
        return Response(NotificationSerializer(notif).data)


class AdminDashboardStatsView(views.APIView):
    """
    Comprehensive platform metrics, user distribution, and activity reporting for Administrators.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Verify admin access or allow demo viewing if admin
        is_admin = (request.user.role == User.Role.ADMIN or request.user.is_staff)
        
        total_users = User.objects.count()
        total_students = User.objects.filter(role=User.Role.STUDENT).count()
        total_mentors = User.objects.filter(role=User.Role.MENTOR).count()
        total_careers = CareerRole.objects.count()
        total_skills = Skill.objects.count()
        total_jobs = JobOpportunity.objects.count()
        total_applications = JobApplication.objects.count()
        total_assessments_taken = AssessmentResult.objects.count()

        # Avg readiness score
        avg_score_res = StudentProfile.objects.aggregate(Avg('readiness_score'))
        avg_readiness = round(avg_score_res['readiness_score__avg'] or 0.0, 1)

        # Career track distribution
        career_distribution = []
        for role in CareerRole.objects.all():
            count = StudentProfile.objects.filter(target_role_id=role.id).count()
            career_distribution.append({
                'role': role.title,
                'students_enrolled': count
            })

        # Application statuses
        app_status_counts = JobApplication.objects.values('status').annotate(count=Count('status'))
        status_map = {item['status']: item['count'] for item in app_status_counts}

        # Assessment performance
        passed_tests = AssessmentResult.objects.filter(passed=True).count()
        pass_rate = round((passed_tests / total_assessments_taken * 100), 1) if total_assessments_taken > 0 else 0

        # Recent activities
        recent_logs = ActivityLog.objects.all()[:10]

        return Response({
            'is_admin': is_admin,
            'summary': {
                'total_users': total_users,
                'total_students': total_students,
                'total_mentors': total_mentors,
                'total_career_roles': total_careers,
                'total_skills_indexed': total_skills,
                'total_jobs_posted': total_jobs,
                'total_job_applications': total_applications,
                'total_assessments_taken': total_assessments_taken,
                'average_readiness_score': avg_readiness,
                'assessment_pass_rate': pass_rate,
            },
            'career_distribution': career_distribution,
            'application_status_breakdown': status_map,
            'recent_activities': ActivityLogSerializer(recent_logs, many=True).data
        })


class AdminUsersManageView(views.APIView):
    """
    Admin management for listing and updating platform users.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != User.Role.ADMIN and not request.user.is_staff:
            return Response({'error': 'Admin permissions required.'}, status=status.HTTP_403_FORBIDDEN)
        
        role = request.query_params.get('role')
        users = User.objects.all().order_by('-date_joined')
        if role:
            users = users.filter(role=role.upper())
        return Response(UserSerializer(users, many=True).data)

    def patch(self, request, pk):
        if request.user.role != User.Role.ADMIN and not request.user.is_staff:
            return Response({'error': 'Admin permissions required.'}, status=status.HTTP_403_FORBIDDEN)

        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        if 'role' in request.data:
            user.role = request.data['role']
        user.save()

        return Response(UserSerializer(user).data)
