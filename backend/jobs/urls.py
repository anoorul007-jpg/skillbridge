from django.urls import path
from .views import (
    JobOpportunityListView, JobOpportunityDetailView,
    BookmarkToggleView, UserBookmarksView,
    ApplyJobView, UserApplicationsView, ApplicationDetailUpdateView
)

urlpatterns = [
    path('', JobOpportunityListView.as_view(), name='job_list'),
    path('<int:pk>/', JobOpportunityDetailView.as_view(), name='job_detail'),
    path('<int:pk>/bookmark/', BookmarkToggleView.as_view(), name='job_bookmark_toggle'),
    path('<int:pk>/apply/', ApplyJobView.as_view(), name='job_apply'),
    path('bookmarks/', UserBookmarksView.as_view(), name='user_bookmarks'),
    path('applications/', UserApplicationsView.as_view(), name='user_applications'),
    path('applications/<int:pk>/', ApplicationDetailUpdateView.as_view(), name='application_update'),
]
