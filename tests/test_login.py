from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.auth import hash_password
from app.main import app
from app.models.user import User
from app.routes import user_routes
from app.services.user_service import UserService


class FakeUserRepository:
    def __init__(self, user=None):
        self.user = user
        self.lookup_email = None

    def get_user_by_email(self, email):
        self.lookup_email = email
        return self.user


def test_authenticate_user_returns_user_for_valid_credentials():
    hashed_password = hash_password("secret123")
    user = User(
        user_id="user-1",
        name="Jane",
        email="jane@example.com",
        password=hashed_password,
        created_at=datetime.now(timezone.utc),
    )
    repository = FakeUserRepository(user)
    service = UserService(repository)

    authenticated_user = service.authenticate_user("jane@example.com", "secret123")

    assert authenticated_user is not None
    assert authenticated_user.email == "jane@example.com"
    assert repository.lookup_email == "jane@example.com"


def test_authenticate_user_returns_none_for_invalid_password():
    hashed_password = hash_password("secret123")
    user = User(
        user_id="user-2",
        name="John",
        email="john@example.com",
        password=hashed_password,
        created_at=datetime.now(timezone.utc),
    )
    repository = FakeUserRepository(user)
    service = UserService(repository)

    authenticated_user = service.authenticate_user("john@example.com", "wrong-password")

    assert authenticated_user is None


def test_login_returns_access_token(monkeypatch):
    class FakeUserService:
        def authenticate_user(self, email, password):
            return SimpleNamespace(
                user_id="user-3",
                name="Jane",
                email=email,
                password=password,
                created_at=None,
            )

    monkeypatch.setattr(user_routes, "user_service", FakeUserService())
    client = TestClient(app)

    response = client.post(
        "/api/login",
        json={"email": "jane@example.com", "password": "secret123"},
    )

    assert response.status_code == 200
    assert response.json()["access_token"]
    assert response.json()["token_type"] == "bearer"
