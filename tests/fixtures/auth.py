import pytest
import allure
from api.client import TodoAPIClient
from api.endpoints import AUTH_REGISTER, AUTH_LOGIN
from utils.generators import random_email


@pytest.fixture(scope="session")
def config():
    from config.settings import get_config
    return get_config()


@pytest.fixture(scope="session")
def client(config) -> TodoAPIClient:
    c = TodoAPIClient(config.base_url)
    yield c
    c.close()


@pytest.fixture(scope="session")
def auth_token(client, config) -> str:
    """Register and login, return JWT token."""
    email = config.email
    password = config.password

    with allure.step(f"Register user {email}"):
        client.post(AUTH_REGISTER, json={
            "email": email,
            "password": password,
            "name": getattr(config, "name", "Test User"),
        })
        # Ignore 409 if already registered

    with allure.step("Login"):
        resp = client.post(AUTH_LOGIN, json={
            "email": email,
            "password": password,
        })
        assert resp.status_code == 200, f"Login failed: {resp.text}"
        return resp.json()["accessToken"]


@pytest.fixture
def authed(client, auth_token) -> TodoAPIClient:
    """Client with authentication token set."""
    client.set_token(auth_token)
    yield client
    client.clear_token()


@pytest.fixture
def second_user_token(client, config) -> str:
    """Create a second user for cross-user tests."""
    email = random_email()
    password = "otherpassword123"

    client.post(AUTH_REGISTER, json={
        "email": email,
        "password": password,
    })
    resp = client.post(AUTH_LOGIN, json={
        "email": email,
        "password": password,
    })
    return resp.json()["accessToken"]
