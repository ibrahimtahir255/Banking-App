from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.main import app
from app.routes import user_routes


class FakeUserService:
    def create_user(self, name, email, password, user_id=None):
        return SimpleNamespace(
            user_id="generated-user-id",
            name=name,
            email=email,
            password=password,
            created_at=None,
        )


def test_create_user_accepts_frontend_payload(monkeypatch):
    monkeypatch.setattr(user_routes, "user_service", FakeUserService())
    client = TestClient(app)

    response = client.post(
        "/api/users",
        json={"name": "Jane", "email": "jane@example.com", "password": "secret"},
    )

    assert response.status_code == 200
    assert response.json()["user_id"] == "generated-user-id"
