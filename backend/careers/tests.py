from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from careers.models import CareerRole, Skill, RequiredSkill, StudentSkill
from careers.services import perform_skill_gap_analysis
from assessments.models import Assessment, Question

User = get_user_model()

class SkillBridgeBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test.student@example.com',
            password='TestPassword123!',
            username='teststudent',
            role=User.Role.STUDENT
        )
        # Skills
        self.py_skill = Skill.objects.create(name='Python', category='LANGUAGE')
        self.react_skill = Skill.objects.create(name='React.js', category='FRAMEWORK')
        self.docker_skill = Skill.objects.create(name='Docker', category='CLOUD_DEVOPS')

        # Career Role
        self.role = CareerRole.objects.create(
            title='Junior Full Stack',
            slug='junior-full-stack',
            description='Test description'
        )
        RequiredSkill.objects.create(career_role=self.role, skill=self.py_skill, weight=4)
        RequiredSkill.objects.create(career_role=self.role, skill=self.react_skill, weight=4)
        RequiredSkill.objects.create(career_role=self.role, skill=self.docker_skill, weight=2)

    def test_skill_gap_analysis_math(self):
        """Tests that skill gap calculation uses matched weight / total weight * 100."""
        # Give user Python (weight 4) and React (weight 4), missing Docker (weight 2)
        # Total weight = 10, matched = 8 -> 80%
        StudentSkill.objects.create(user=self.user, skill=self.py_skill, proficiency='INTERMEDIATE')
        StudentSkill.objects.create(user=self.user, skill=self.react_skill, proficiency='INTERMEDIATE')

        analysis = perform_skill_gap_analysis(self.user, self.role)
        self.assertEqual(analysis.total_required_weight, 10)
        self.assertEqual(analysis.matched_weight, 8)
        self.assertEqual(analysis.readiness_score, 80.0)
        self.assertEqual(len(analysis.matched_skills), 2)
        self.assertEqual(len(analysis.missing_skills), 1)
        self.assertEqual(analysis.missing_skills[0]['name'], 'Docker')

    def test_auth_login_api(self):
        """Tests that login API returns JWT tokens and user profile."""
        response = self.client.post('/api/auth/login/', {
            'email': 'test.student@example.com',
            'password': 'TestPassword123!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'test.student@example.com')

    def test_career_roles_api(self):
        """Tests career roles listing endpoint."""
        response = self.client.get('/api/careers/roles/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) >= 1)
