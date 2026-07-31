from datetime import datetime, timezone
from app.models.user import User
from app.auth import hash_password, verify_password
from app.services.risk_scoring_service import RiskScoringService


class UserService:
    def __init__(self, user_repository, risk_scoring_service: RiskScoringService | None = None) -> None:
        self.user_repository = user_repository
        self.risk_scoring_service = risk_scoring_service

    def create_user(self, name, email, password, user_id=None):
        hashed = hash_password(password)
        user = User(
            user_id=user_id or "",
            name=name,
            email=email,
            created_at=datetime.now(timezone.utc),
            password=hashed,
        )
        user = self.user_repository.create_user(user)
        return user

    def get_user(self, user_id):
        user = self.user_repository.get_user(user_id)
        if user is None:
            raise ValueError("User not found")

        return user

    def authenticate_user(self, email, password):
        user = self.user_repository.get_user_by_email(email)
        if user is None:
            return None
        print(password)
        print(user.password)
        if verify_password(password, user.password):
            return user

        if self.risk_scoring_service is not None:
            self.risk_scoring_service.evaluate_login_attempt(user.user_id)
        return None