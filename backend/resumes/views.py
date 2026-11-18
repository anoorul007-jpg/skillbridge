import os
from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Resume
from .serializers import ResumeSerializer
from .parser import extract_text_from_pdf, extract_text_from_docx, parse_resume_content
from careers.models import Skill, StudentSkill, CareerRole
from careers.services import perform_skill_gap_analysis

class ResumeUploadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file was provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Security check: Extension & Size
        ext = os.path.splitext(uploaded_file.name)[1].lower()
        if ext not in ['.pdf', '.docx']:
            return Response({'error': 'Only PDF (.pdf) and Microsoft Word (.docx) files are supported.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if uploaded_file.size > 5 * 1024 * 1024:
            return Response({'error': 'File exceeds the 5MB size limit.'}, status=status.HTTP_400_BAD_REQUEST)

        # Save record
        resume = Resume.objects.create(
            user=request.user,
            file=uploaded_file,
            file_name=uploaded_file.name,
            file_size=uploaded_file.size,
            file_type=ext.replace('.', '')
        )

        # Parse text based on format
        file_path = resume.file.path
        raw_text = ""
        if ext == '.pdf':
            raw_text = extract_text_from_pdf(file_path)
        elif ext == '.docx':
            raw_text = extract_text_from_docx(file_path)

        resume.extracted_text = raw_text
        parsed_result = parse_resume_content(raw_text)
        resume.parsed_data = parsed_result
        resume.save()

        return Response({
            'message': 'Resume uploaded and analyzed successfully. Please review and confirm your details.',
            'resume': ResumeSerializer(resume).data
        }, status=status.HTTP_201_CREATED)


class ResumeListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        resumes = Resume.objects.filter(user=request.user)
        serializer = ResumeSerializer(resumes, many=True)
        return Response(serializer.data)


class ResumeDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        resume = Resume.objects.filter(user=request.user, pk=pk).first()
        if not resume:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ResumeSerializer(resume).data)

    def delete(self, request, pk):
        resume = Resume.objects.filter(user=request.user, pk=pk).first()
        if not resume:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)
        resume.delete()
        return Response({'message': 'Resume deleted successfully.'}, status=status.HTTP_200_OK)


class ResumeConfirmView(views.APIView):
    """
    User reviews and confirms parsed skills and profile details.
    Synced verified skills to StudentSkill and refreshes gap analysis.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        resume = Resume.objects.filter(user=request.user, pk=pk).first()
        if not resume:
            return Response({'error': 'Resume not found.'}, status=status.HTTP_404_NOT_FOUND)

        confirmed_skills = request.data.get('skills', [])
        confirmed_education = request.data.get('education', [])
        confirmed_projects = request.data.get('projects', [])
        candidate_name = request.data.get('candidate_name', '')

        # Update parsed_data with confirmed info
        resume.parsed_data.update({
            'skills': confirmed_skills,
            'education': confirmed_education,
            'projects': confirmed_projects,
            'candidate_name': candidate_name
        })
        resume.is_confirmed_by_user = True
        resume.save()

        # Update user profile names if empty
        if candidate_name and not (request.user.first_name or request.user.last_name):
            parts = candidate_name.split()
            request.user.first_name = parts[0]
            if len(parts) > 1:
                request.user.last_name = " ".join(parts[1:])
            request.user.save()

        # Sync skills to StudentSkill
        added_count = 0
        for skill_name in confirmed_skills:
            skill_obj, _ = Skill.objects.get_or_create(
                name=skill_name.strip(),
                defaults={'category': 'LANGUAGE'}
            )
            _, created = StudentSkill.objects.update_or_create(
                user=request.user,
                skill=skill_obj,
                defaults={
                    'proficiency': 'INTERMEDIATE',
                    'source': 'RESUME',
                    'is_verified': True
                }
            )
            if created:
                added_count += 1

        # Re-run gap analysis if student has target role
        profile = getattr(request.user, 'student_profile', None)
        analysis_data = None
        if profile and profile.target_role_id:
            role = CareerRole.objects.filter(id=profile.target_role_id).first()
            if role:
                analysis = perform_skill_gap_analysis(request.user, role)
                analysis_data = {
                    'readiness_score': analysis.readiness_score,
                    'matched_skills_count': len(analysis.matched_skills),
                    'missing_skills_count': len(analysis.missing_skills),
                }

        return Response({
            'message': f'Confirmed {len(confirmed_skills)} skills ({added_count} new skills added to profile).',
            'analysis_update': analysis_data,
            'resume': ResumeSerializer(resume).data
        })
