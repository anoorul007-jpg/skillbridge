from django.urls import path
from .views import (
    AllSkillsListView, CareerRoleListView, CareerRoleDetailView,
    SelectCareerRoleView, SkillGapAnalysisView, StudentSkillsView,
    LearningRoadmapView, RoadmapTaskToggleView, ProjectRecommendationListView
)

urlpatterns = [
    path('skills/', AllSkillsListView.as_view(), name='all_skills'),
    path('student-skills/', StudentSkillsView.as_view(), name='student_skills'),
    path('roles/', CareerRoleListView.as_view(), name='career_roles'),
    path('roles/<int:pk>/', CareerRoleDetailView.as_view(), name='career_role_detail'),
    path('roles/<int:pk>/select/', SelectCareerRoleView.as_view(), name='select_career_role'),
    path('analysis/', SkillGapAnalysisView.as_view(), name='skill_gap_analysis'),
    path('roadmap/', LearningRoadmapView.as_view(), name='learning_roadmap'),
    path('roadmap/tasks/<int:pk>/toggle/', RoadmapTaskToggleView.as_view(), name='roadmap_task_toggle'),
    path('projects/', ProjectRecommendationListView.as_view(), name='project_recommendations'),
]
