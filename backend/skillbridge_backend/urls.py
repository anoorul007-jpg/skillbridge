"""
URL configuration for SkillBridge - AI-Powered Skill Development & Career Guidance Platform
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # SkillBridge API Endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/resumes/', include('resumes.urls')),
    path('api/careers/', include('careers.urls')),
    path('api/assessments/', include('assessments.urls')),
    path('api/mentorship/', include('mentorship.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/analytics/', include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
