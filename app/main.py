from fastapi import FastAPI
from app.routes.account_routes import router as account_router
from app.routes.user_routes import router as user_router

app = FastAPI()
app.include_router(account_router)
app.include_router(user_router)

@app.get("/")
def check_app():
    return {"message" : "Bank API is running"}

