from types import SimpleNamespace
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()


class ChatbotViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='aiuser',
            email='aiuser@example.com',
            password='testpass123',
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_empty_message_returns_validation_error(self):
        response = self.client.post('/api/chatbot/message/', {'message': '   '}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Please enter a message', response.json()['error'])

    @patch.object(settings, 'OPENAI_API_KEY', 'test-key')
    @patch('chatbot.views.OpenAI')
    def test_ai_reply_is_generated_via_openai(self, mock_openai_cls):
        mock_client = mock_openai_cls.return_value
        mock_client.chat.completions.create.return_value = SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content='Tomato early blight is a fungal disease. Remove the infected leaves and improve airflow.'))]
        )

        response = self.client.post(
            '/api/chatbot/message/',
            {'message': 'What is early blight in tomato?', 'context': {'weather_summary': 'humid conditions'}},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('early blight', response.json()['reply'].lower())
        mock_client.chat.completions.create.assert_called_once()
