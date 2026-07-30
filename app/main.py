from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.account_routes import router as account_router
from app.routes.user_routes import router as user_router

app = FastAPI()
app.include_router(account_router)
app.include_router(user_router)

@app.get("/")
def check_app():
    return {"message" : "Bank API is running"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# repl users gonna use to communicate with the service via sevice file
# service file basically translates 


# bottom to top approach:
# look into rpel first
# package into services
# then controllers