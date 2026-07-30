from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.dependencies import user_service

router = APIRouter()

class CreateUserRequest(BaseModel):
    name: str
    email: str 
    password : str

# POST /api/users - create_user, calling user_service, return result
@router.post("/api/users")
def create_user(request: CreateUserRequest):
    user = user_service.create_user(request.name, request.email, request.password)
    return user

#  GET /api/users/{user_id} - get_user, path param user_id: str, try/except ValueError -> HTTPException 404
@router.get("/api/users/{user_id}")
def get_user(user_id: str):
    try:
        user = user_service.get_user(user_id)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
