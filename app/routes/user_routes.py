from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.auth import create_access_token
from app.dependencies import user_service

router = APIRouter()


class CreateUserRequest(BaseModel):
    name: str
    email: str
    password: str
    user_id: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# POST /api/users - create_user, calling user_service, return result
@router.post("/api/users")
def create_user(request: CreateUserRequest):
    user_id = request.user_id or ""
    user = user_service.create_user(request.name, request.email, request.password, user_id)
    return user


@router.post("/api/login")
def login(request: LoginRequest):
    user = user_service.authenticate_user(request.email, request.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"user_id": user.user_id})

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at,
        },
    }


#  GET /api/users/{user_id} - get_user, path param user_id: str, try/except ValueError -> HTTPException 404
@router.get("/api/users/{user_id}")
def get_user(user_id: str):
    try:
        user = user_service.get_user(user_id)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
