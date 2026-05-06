"""Auth Login Tests."""
import pytest
import allure
from api.endpoints import AUTH_LOGIN
from utils.assertions import assert_success, assert_error
from utils.generators import random_email


@allure.epic("Auth")
@allure.feature("Login")
class TestLogin:

    @allure.story("Success")
    @allure.title("Login with valid credentials returns 200 and accessToken")
    def test_login_success(self, client, config):
        resp = client.post(AUTH_LOGIN, json={
            "email": config.email,
            "password": config.password,
        })
        assert_success(resp, 200)
        assert "accessToken" in resp.json()

    @allure.story("Validation")
    @allure.title("Login with wrong password returns 401")
    def test_login_wrong_password(self, client, config):
        resp = client.post(AUTH_LOGIN, json={
            "email": config.email,
            "password": "wrongpassword",
        })
        assert_error(resp, 401, "Invalid")

    @allure.story("Validation")
    @allure.title("Login with nonexistent user returns 401")
    def test_login_nonexistent_user(self, client):
        resp = client.post(AUTH_LOGIN, json={
            "email": random_email(),
            "password": "password123",
        })
        assert_error(resp, 401, "Invalid")

    @allure.story("Validation")
    @allure.title("Login without email returns 400")
    def test_login_missing_email(self, client):
        resp = client.post(AUTH_LOGIN, json={"password": "password123"})
        assert_error(resp, 400)
