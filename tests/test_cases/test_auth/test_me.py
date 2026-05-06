"""Auth Me Tests."""
import pytest
import allure
from api.endpoints import AUTH_ME
from utils.assertions import assert_success, assert_error


@allure.epic("Auth")
@allure.feature("Current User")
class TestMe:

    @allure.story("Success")
    @allure.title("GET /auth/me returns user info")
    def test_me_success(self, authed):
        resp = authed.get(AUTH_ME)
        assert_success(resp, 200)
        body = resp.json()
        assert "id" in body
        assert "email" in body
        assert "password" not in body

    @allure.story("Auth")
    @allure.title("GET /auth/me without token returns 401")
    def test_me_no_token(self, client):
        resp = client.get(AUTH_ME)
        assert_error(resp, 401)

    @allure.story("Auth")
    @allure.title("GET /auth/me with invalid token returns 401")
    def test_me_invalid_token(self, client):
        client.set_token("invalid-token-string")
        resp = client.get(AUTH_ME)
        assert_error(resp, 401)
        client.clear_token()
