"""Auth Registration Tests."""
import pytest
import allure
from api.endpoints import AUTH_REGISTER
from utils.assertions import assert_success, assert_error
from utils.generators import random_email


@allure.epic("Auth")
@allure.feature("Registration")
class TestRegister:

    @allure.story("Success")
    @allure.title("Register with valid data returns 201 and accessToken")
    @allure.severity(allure.severity_level.CRITICAL)
    def test_register_success(self, client):
        resp = client.post(AUTH_REGISTER, json={
            "email": random_email(),
            "password": "password123",
            "name": "Test User",
        })
        assert_success(resp, 201)
        body = resp.json()
        assert "accessToken" in body

    @allure.story("Success")
    @allure.title("Register without name (optional field)")
    def test_register_without_name(self, client):
        resp = client.post(AUTH_REGISTER, json={
            "email": random_email(),
            "password": "password123",
        })
        assert_success(resp, 201)
        assert "accessToken" in resp.json()

    @allure.story("Validation")
    @allure.title("Register with duplicate email returns 409")
    def test_register_duplicate_email(self, client, config):
        resp = client.post(AUTH_REGISTER, json={
            "email": config.email,
            "password": "password123",
        })
        assert_error(resp, 409, "already exists")

    @allure.story("Validation")
    @allure.title("Register with invalid email returns 400")
    def test_register_invalid_email(self, client):
        resp = client.post(AUTH_REGISTER, json={
            "email": "not-an-email",
            "password": "password123",
        })
        assert_error(resp, 400)

    @allure.story("Validation")
    @allure.title("Register with short password returns 400")
    def test_register_short_password(self, client):
        resp = client.post(AUTH_REGISTER, json={
            "email": random_email(),
            "password": "123",
        })
        assert_error(resp, 400)

    @allure.story("Validation")
    @allure.title("Register without email returns 400")
    def test_register_missing_email(self, client):
        resp = client.post(AUTH_REGISTER, json={"password": "password123"})
        assert_error(resp, 400)

    @allure.story("Validation")
    @allure.title("Register without password returns 400")
    def test_register_missing_password(self, client):
        resp = client.post(AUTH_REGISTER, json={"email": random_email()})
        assert_error(resp, 400)
