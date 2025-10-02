from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase


class ImageGenerationApiTests(APITestCase):
    def test_authenticated_user_can_create_mock_generation_job(self):
        user = User.objects.create_user(username="studio", password="strongpass123")
        token, _ = Token.objects.get_or_create(user=user)

        response = self.client.post(
            "/api/v1/generation/jobs/",
            {
                "prompt": "Futuristic city print",
                "style": "futuristic",
                "product_intent": "tshirt",
                "aspect_ratio": "1:1",
            },
            HTTP_AUTHORIZATION=f"Token {token.key}",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], "completed")
        self.assertEqual(response.data["provider"], "mock")
        self.assertTrue(response.data["output_image_url"])

# Create your tests here.
