from django.urls import path
from .views import (
    AssessmentListView, AssessmentDetailView,
    AssessmentSubmitView, UserAssessmentResultsView
)

urlpatterns = [
    path('', AssessmentListView.as_view(), name='assessment_list'),
    path('<int:pk>/', AssessmentDetailView.as_view(), name='assessment_detail'),
    path('<int:pk>/submit/', AssessmentSubmitView.as_view(), name='assessment_submit'),
    path('history/', UserAssessmentResultsView.as_view(), name='user_assessment_results'),
]
