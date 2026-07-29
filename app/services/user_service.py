from datetime import datetime, timezone
from app.models.user import User


class UserService:
    def __init__(self, user_repository) -> None:
        self.user_repository = user_repository

    def create_user(self, name, email):
        # build a User (user_id=None, created_at=None)
        user = User(user_id=None, name=name, email=email,created_at=datetime.now(timezone.utc))
        # save it via self.user_repository.create_user(...)
        user = self.user_repository.create_user(user)
        # return it
        return user
    
    def get_user(self, user_id):
        user = self.user_repository.get_user(user_id)
        if user is None:
            raise ValueError("User not found")

        return user