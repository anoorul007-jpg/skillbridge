from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.utils import timezone
from .models import (
    Skill, StudentSkill, CareerRole,
    SkillAnalysis, LearningRoadmap, RoadmapTask, ProjectRecommendation
)
from .serializers import (
    SkillSerializer, StudentSkillSerializer, CareerRoleSerializer,
    SkillAnalysisSerializer, LearningRoadmapSerializer,
    RoadmapTaskSerializer, ProjectRecommendationSerializer
)
from .services import perform_skill_gap_analysis, generate_or_update_roadmap
from accounts.models import StudentProfile

class AllSkillsListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        qs = Skill.objects.all().order_by('name')
        if category:
            qs = qs.filter(category=category)
        if search:
            qs = qs.filter(name__icontains=search)
        return Response(SkillSerializer(qs, many=True).data)


class CareerRoleListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        roles = CareerRole.objects.all().order_by('id')
        return Response(CareerRoleSerializer(roles, many=True).data)


class CareerRoleDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        role = CareerRole.objects.filter(pk=pk).first()
        if not role:
            return Response({'error': 'Career role not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(CareerRoleSerializer(role).data)


class SelectCareerRoleView(views.APIView):
    """
    Selects or switches student's target career role.
    Runs skill gap analysis and generates tailored roadmap.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        role = CareerRole.objects.filter(pk=pk).first()
        if not role:
            return Response({'error': 'Career role not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        profile.target_role_id = role.id
        profile.save()

        analysis = perform_skill_gap_analysis(request.user, role)
        roadmap = generate_or_update_roadmap(request.user, role)

        return Response({
            'message': f"Selected {role.title} as your target career path.",
            'analysis': SkillAnalysisSerializer(analysis).data,
            'roadmap': LearningRoadmapSerializer(roadmap).data
        })


class SkillGapAnalysisView(views.APIView):
    """
    Performs/fetches gap analysis for a given career role or the student's selected target role.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        role_id = request.query_params.get('role_id')
        role = None

        if role_id:
            role = CareerRole.objects.filter(id=role_id).first()
        else:
            profile = getattr(request.user, 'student_profile', None)
            if profile and profile.target_role_id:
                role = CareerRole.objects.filter(id=profile.target_role_id).first()
            if not role:
                role = CareerRole.objects.first()

        if not role:
            return Response({'error': 'No career role found.'}, status=status.HTTP_404_NOT_FOUND)

        analysis = perform_skill_gap_analysis(request.user, role)
        return Response(SkillAnalysisSerializer(analysis).data)


class StudentSkillsView(views.APIView):
    """
    Manage student's registered skills.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        skills = StudentSkill.objects.filter(user=request.user).select_related('skill').order_by('-created_at')
        return Response(StudentSkillSerializer(skills, many=True).data)

    def post(self, request):
        skill_name = request.data.get('skill_name', '').strip()
        skill_id = request.data.get('skill_id')
        proficiency = request.data.get('proficiency', 'INTERMEDIATE')

        if not skill_name and not skill_id:
            return Response({'error': 'Skill name or skill ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if skill_id:
            skill = Skill.objects.filter(id=skill_id).first()
            if not skill:
                return Response({'error': 'Skill not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            category = request.data.get('category', 'LANGUAGE')
            skill, _ = Skill.objects.get_or_create(
                name=skill_name,
                defaults={'category': category}
            )

        student_skill, created = StudentSkill.objects.update_or_create(
            user=request.user,
            skill=skill,
            defaults={
                'proficiency': proficiency,
                'source': 'MANUAL',
                'is_verified': False
            }
        )

        # Refresh analysis if user has a target role
        profile = getattr(request.user, 'student_profile', None)
        if profile and profile.target_role_id:
            role = CareerRole.objects.filter(id=profile.target_role_id).first()
            if role:
                perform_skill_gap_analysis(request.user, role)

        return Response(StudentSkillSerializer(student_skill).data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        skill_id = request.data.get('skill_id')
        if not skill_id:
            return Response({'error': 'skill_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        StudentSkill.objects.filter(user=request.user, skill_id=skill_id).delete()

        # Refresh analysis
        profile = getattr(request.user, 'student_profile', None)
        if profile and profile.target_role_id:
            role = CareerRole.objects.filter(id=profile.target_role_id).first()
            if role:
                perform_skill_gap_analysis(request.user, role)

        return Response({'message': 'Skill removed successfully.'})


class LearningRoadmapView(views.APIView):
    """
    Get user's personalized learning roadmap for target career role.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        role_id = request.query_params.get('role_id')
        role = None

        if role_id:
            role = CareerRole.objects.filter(id=role_id).first()
        else:
            profile = getattr(request.user, 'student_profile', None)
            if profile and profile.target_role_id:
                role = CareerRole.objects.filter(id=profile.target_role_id).first()
            if not role:
                role = CareerRole.objects.first()

        if not role:
            return Response({'error': 'No career role available.'}, status=status.HTTP_404_NOT_FOUND)

        roadmap = generate_or_update_roadmap(request.user, role)
        return Response(LearningRoadmapSerializer(roadmap).data)


class RoadmapTaskToggleView(views.APIView):
    """
    Toggle task completion status and recalculate roadmap progress.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        task = RoadmapTask.objects.filter(pk=pk, roadmap__user=request.user).first()
        if not task:
            return Response({'error': 'Task not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)

        task.is_completed = not task.is_completed
        task.completed_at = timezone.now() if task.is_completed else None
        task.save()

        roadmap = task.roadmap
        roadmap.update_progress()

        return Response({
            'message': f"Task marked as {'completed' if task.is_completed else 'pending'}.",
            'task': RoadmapTaskSerializer(task).data,
            'roadmap_progress_percentage': roadmap.progress_percentage
        })


class ProjectRecommendationListView(views.APIView):
    """
    Returns practical projects matching user's target career role or query params.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        role_id = request.query_params.get('role_id')
        difficulty = request.query_params.get('difficulty')

        qs = ProjectRecommendation.objects.all().select_related('career_role')
        if role_id:
            qs = qs.filter(career_role_id=role_id)
        elif request.user.is_authenticated:
            profile = getattr(request.user, 'student_profile', None)
            if profile and profile.target_role_id:
                qs = qs.filter(career_role_id=profile.target_role_id)

        if difficulty:
            qs = qs.filter(difficulty=difficulty.upper())

        return Response(ProjectRecommendationSerializer(qs, many=True).data)
