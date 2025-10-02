from rest_framework.test import APITestCase


class AuthApiTests(APITestCase):
    def test_user_can_register_and_receive_token(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "username": "demo",
                "email": "demo@studio.local",
                "password": "strongpass123",
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["username"], "demo")

# Create your tests here.
