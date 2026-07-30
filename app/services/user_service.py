from app.models.user import User
from app.auth import create_access_token, hash_password, verify_password


class UserService:
    def __init__(self, user_repository) -> None:
        self.user_repository = user_repository

    def create_user(self, name, email, password):
        existing_email = self.user_repository.get_user_by_email(email)
        if existing_email is not None:
            raise ValueError("Email already registered")
        
        # take the password and hash it
        hashed = hash_password(password)
        # build a User (user_id=None, created_at=None)
        user = User(user_id=None, name=name, email=email, password=hashed, created_at=None)
        # save it via self.user_repository.create_user(...)
        user = self.user_repository.create_user(user)
        # return it
        return user
    
    def get_user(self, user_id):
        user = self.user_repository.get_user(user_id)
        if user is None:
            raise ValueError("User not found")

        return user

    # this ties together get_user_by_email, verify_password, and create_access_token into actual login logic
    def authenticate_user(self, email, password):
        user = self.user_repository.get_user_by_email(email)

        # both failure cases raise the exact same error message since we do not to give nay info out
        if user is None:
            raise ValueError("Invalid email or password")
        if not verify_password(password, user.password):
            raise ValueError("Invalid email or password")
        
        token = create_access_token({"user_id": user.user_id})
        return token 
