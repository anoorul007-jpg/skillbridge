from django.urls import path
from .views import (
    MentorDashboardView, RequestMentorshipView,
    ScheduleSessionView, SubmitFeedbackView
)

urlpatterns = [
    path('dashboard/', MentorDashboardView.as_view(), name='mentor_dashboard'),
    path('request/', RequestMentorshipView.as_view(), name='request_mentorship'),
    path('sessions/schedule/', ScheduleSessionView.as_view(), name='schedule_session'),
    path('feedback/submit/', SubmitFeedbackView.as_view(), name='submit_feedback'),
]
