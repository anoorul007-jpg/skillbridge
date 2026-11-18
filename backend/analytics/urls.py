from django.urls import path
from .views import (
    NotificationListView, NotificationMarkReadView,
    AdminDashboardStatsView, AdminUsersManageView
)

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notifications_list'),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification_mark_read'),
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin_stats'),
    path('admin/users/', AdminUsersManageView.as_view(), name='admin_users'),
    path('admin/users/<int:pk>/', AdminUsersManageView.as_view(), name='admin_user_update'),
]
