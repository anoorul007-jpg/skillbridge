from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import JobOpportunity, JobBookmark, JobApplication
from .serializers import JobOpportunitySerializer, JobApplicationSerializer, JobBookmarkSerializer
from analytics.models import Notification

class JobOpportunityListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = JobOpportunity.objects.filter(is_active=True).prefetch_related('required_skills')
        
        # Filtering
        job_type = request.query_params.get('job_type')
        if job_type:
            qs = qs.filter(job_type=job_type.upper())
            
        experience = request.query_params.get('experience')
        if experience:
            qs = qs.filter(experience_level=experience.upper())
            
        is_remote = request.query_params.get('is_remote')
        if is_remote is not None:
            qs = qs.filter(is_remote=(is_remote.lower() == 'true'))
            
        role_id = request.query_params.get('career_role')
        if role_id:
            qs = qs.filter(career_role_id=role_id)
            
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search) | qs.filter(company_name__icontains=search)

        serializer = JobOpportunitySerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated or request.user.role != 'ADMIN':
            return Response({'error': 'Admin authorization required to post jobs.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = JobOpportunitySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            job = serializer.save()
            return Response(JobOpportunitySerializer(job, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobOpportunityDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        job = JobOpportunity.objects.filter(pk=pk).first()
        if not job:
            return Response({'error': 'Job opportunity not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(JobOpportunitySerializer(job, context={'request': request}).data)


class BookmarkToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        job = JobOpportunity.objects.filter(pk=pk).first()
        if not job:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        bookmark = JobBookmark.objects.filter(user=request.user, job=job).first()
        if bookmark:
            bookmark.delete()
            return Response({'is_bookmarked': False, 'message': 'Job removed from bookmarks.'})
        else:
            JobBookmark.objects.create(user=request.user, job=job)
            return Response({'is_bookmarked': True, 'message': 'Job saved to bookmarks.'})


class UserBookmarksView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bookmarks = JobBookmark.objects.filter(user=request.user).select_related('job')
        return Response(JobBookmarkSerializer(bookmarks, many=True, context={'request': request}).data)


class ApplyJobView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        job = JobOpportunity.objects.filter(pk=pk).first()
        if not job:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        existing = JobApplication.objects.filter(user=request.user, job=job).first()
        if existing:
            return Response({'error': 'You have already submitted an application for this position.'}, status=status.HTTP_400_BAD_REQUEST)

        cover_note = request.data.get('cover_note', '')
        resume_id = request.data.get('resume_id')
        resume = request.user.resumes.filter(id=resume_id).first() if resume_id else request.user.resumes.first()

        app = JobApplication.objects.create(
            user=request.user,
            job=job,
            resume=resume,
            cover_note=cover_note,
            status='APPLIED'
        )

        Notification.objects.create(
            user=request.user,
            title=f"Application Sent: {job.title}",
            message=f"Your application for {job.title} at {job.company_name} was recorded successfully.",
            notification_type='APPLICATION',
            action_url='/applications'
        )

        return Response(JobApplicationSerializer(app, context={'request': request}).data, status=status.HTTP_201_CREATED)


class UserApplicationsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        apps = JobApplication.objects.filter(user=request.user).select_related('job')
        return Response(JobApplicationSerializer(apps, many=True, context={'request': request}).data)


class ApplicationDetailUpdateView(views.APIView):
    """
    Update application status (Admin or applicant notes)
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        app = JobApplication.objects.filter(pk=pk).first()
        if not app:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        if 'notes' in request.data:
            app.notes = request.data['notes']

        # Status update allowed by admin or for mock tracking
        if 'status' in request.data:
            app.status = request.data['status']
            if 'interview_date' in request.data:
                app.interview_date = request.data['interview_date']

            Notification.objects.create(
                user=app.user,
                title=f"Application Update: {app.job.title}",
                message=f"Status changed to: {app.get_status_display()}.",
                notification_type='APPLICATION',
                action_url='/applications'
            )

        app.save()
        return Response(JobApplicationSerializer(app, context={'request': request}).data)
