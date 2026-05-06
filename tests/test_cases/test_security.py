"""L4 Security Tests."""
import time
import pytest
import allure
from api.endpoints import AUTH_REGISTER, AUTH_LOGIN, TODOS, TODO_DETAIL, CATEGORIES, TAGS
from utils.assertions import assert_success, assert_error
from utils.generators import random_email, random_title, random_name


@allure.epic("Security")
@allure.feature("Rate Limiting")
@pytest.mark.skip(reason="Rate limit tests require production throttle config (THROTTLER_LIMIT=5)")
class TestRateLimiting:

    @allure.story("Auth rate limit")
    @allure.title("Register exceeds 5/min rate limit returns 429")
    @allure.severity(allure.severity_level.NORMAL)
    def test_register_rate_limit(self, client):
        for i in range(5):
            client.post(AUTH_REGISTER, json={
                "email": random_email(),
                "password": "password123",
            })
        # 6th request should be rate limited
        resp = client.post(AUTH_REGISTER, json={
            "email": random_email(),
            "password": "password123",
        })
        assert_error(resp, 429)

    @allure.story("Auth rate limit")
    @allure.title("Login exceeds 5/min rate limit returns 429")
    def test_login_rate_limit(self, client, config):
        for i in range(5):
            client.post(AUTH_LOGIN, json={
                "email": f"fake{i}@test.com",
                "password": "wrongpassword",
            })
        resp = client.post(AUTH_LOGIN, json={
            "email": "fake@test.com",
            "password": "wrongpassword",
        })
        assert_error(resp, 429)


@allure.epic("Security")
@allure.feature("Information Leakage")
class TestInfoLeakage:

    @allure.story("Response filtering")
    @allure.title("Todo response does not contain userId")
    def test_todo_no_user_id(self, authed, sample_todo):
        resp = authed.get(TODO_DETAIL.format(id=sample_todo["id"]))
        assert_success(resp, 200)
        body = resp.json()
        assert "userId" not in body

    @allure.story("Response filtering")
    @allure.title("Todo response does not contain categoryId")
    def test_todo_no_category_id(self, authed, sample_todo):
        resp = authed.get(TODO_DETAIL.format(id=sample_todo["id"]))
        assert_success(resp, 200)
        body = resp.json()
        assert "categoryId" not in body

    @allure.story("Response filtering")
    @allure.title("Auth/me response does not contain password")
    def test_me_no_password(self, authed):
        resp = authed.get("/auth/me")
        assert_success(resp, 200)
        assert "password" not in resp.json()


@allure.epic("Security")
@allure.feature("Input Validation")
class TestInputValidation:

    @allure.story("SQL injection")
    @allure.title("Search with SQL injection attempt returns normal results")
    @allure.severity(allure.severity_level.NORMAL)
    def test_sql_injection_search(self, authed):
        resp = authed.get(TODOS, params={"search": "' OR 1=1 --"})
        assert_success(resp, 200)
        # Should return empty or normal results, not all rows
        assert isinstance(resp.json()["data"], list)

    @allure.story("XSS")
    @allure.title("Todo title with script tag stored as-is")
    def test_xss_title(self, authed):
        title = "<script>alert(1)</script>"
        resp = authed.post(TODOS, json={"title": title})
        assert_success(resp, 201)
        assert resp.json()["title"] == title
        authed.delete(f"/todos/{resp.json()['id']}")


@allure.epic("Security")
@allure.feature("Cross-User Access")
class TestCrossUserAccess:

    @allure.story("Authorization")
    @allure.title("User B cannot update User A's todo")
    def test_cross_user_update(self, authed, second_user_token, sample_todo):
        authed.set_token(second_user_token)
        resp = authed.patch(TODO_DETAIL.format(id=sample_todo["id"]), json={"title": "Hacked"})
        assert_error(resp, 403)
        authed.clear_token()

    @allure.story("Authorization")
    @allure.title("User B cannot delete User A's todo")
    def test_cross_user_delete(self, authed, second_user_token, sample_todo):
        authed.set_token(second_user_token)
        resp = authed.delete(TODO_DETAIL.format(id=sample_todo["id"]))
        assert_error(resp, 403)
        authed.clear_token()

    @allure.story("Authorization")
    @allure.title("User B cannot access User A's category")
    def test_cross_user_category(self, authed, second_user_token, sample_category):
        authed.set_token(second_user_token)
        resp = authed.get(f"/categories/{sample_category['id']}")
        assert_error(resp, 403)
        authed.clear_token()
