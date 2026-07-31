from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.dependencies import user_service

router = APIRouter()

class CreateUserRequest(BaseModel):
    name: str
    email: str 
    password : str

class LoginRequestModel(BaseModel):
    email: str
    password: str


# POST /api/login
@router.post("/api/login")
def login(request:LoginRequestModel):
    try:
        token = user_service.authenticate_user(request.email, request.password)
        return {"access_token": token, "token_type": "bearer"}
    except ValueError as e:
        # status code 401 for credentials rejected
        raise HTTPException(status_code=401, detail=str(e))


# POST /api/users - create_user, calling user_service, return result
@router.post("/api/users")
def create_user(request: CreateUserRequest):
    try:
        user = user_service.create_user(request.name, request.email, request.password)
        return user
    except ValueError as e:
        # 400 for bad request
        raise HTTPException(status_code=400, detail=str(e))

#  GET /api/users/{user_id} - get_user, path param user_id: str, try/except ValueError -> HTTPException 404
@router.get("/api/users/{user_id}")
def get_user(user_id: str):
    try:
        user = user_service.get_user(user_id)
        # dont return the password
        return {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "created_at": user.created_at
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


