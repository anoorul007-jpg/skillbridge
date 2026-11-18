from rest_framework import serializers
from .models import Notification, ActivityLog

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'is_read', 'action_url', 'created_at']


class ActivityLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'user_email', 'action', 'category', 'metadata', 'created_at']
