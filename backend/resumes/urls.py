from django.urls import path
from .views import ResumeUploadView, ResumeListView, ResumeDetailView, ResumeConfirmView

urlpatterns = [
    path('upload/', ResumeUploadView.as_view(), name='resume_upload'),
    path('', ResumeListView.as_view(), name='resume_list'),
    path('<int:pk>/', ResumeDetailView.as_view(), name='resume_detail'),
    path('<int:pk>/confirm/', ResumeConfirmView.as_view(), name='resume_confirm'),
]
