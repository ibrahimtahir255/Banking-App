from datetime import datetime, timezone
from app.models.user import User
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.services.risk_scoring_service import RiskScoringService

class UserService:
    def __init__(self, user_repository) -> None:
        self.user_repository = user_repository

    def login(self, email, password):
        # fetch user by email
        user = self.user_repository.get_user_by_email(email)
        if user is None:
            raise ValueError("Invalid email or password")

        # verify password
        if not verify_password(password, user.password):
            raise ValueError("Invalid email or password")

        # create JWT token
        token = create_access_token({"sub": str(user.user_id)})
        return {
                "access_token": token,
                "token_type": "bearer",
                "user_id": user.user_id,
                "email": user.email
            }


    def create_user(self, name, email, password):
        # take the password and hash it
        hashed = hash_password(password)
        # build a User (user_id=None, created_at=None)
        user = User(user_id=None, name=name, email=email, password=hashed, created_at=datetime.now(timezone.utc))
        # save it via self.user_repository.create_user(...)
        user = self.user_repository.create_user(user)
        # return it
        return user
    
    def get_user(self, user_id):
        user = self.user_repository.get_user(user_id)
        if user is None:
            raise ValueError("User not found")

        return user