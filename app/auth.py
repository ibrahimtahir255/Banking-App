from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt, JWTError
import os

from app.models import user

load_dotenv()

security = HTTPBearer()

"""
 passlib's CryptContext is a small utility that handles the hashing algorithm details for you.
 You configure it once, then use two simple functions: one to hash a password (during signup), 
 one to verify a plain password against a stored hash (during login).
"""

# using the bcrypt algorithm 
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# returns hash
def hash_password(plain_password):
    return pwd_context.hash(plain_password)

# returns True if match, Flase otherwise
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


# creating token using secret key
SECRET_KEY= os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# data:dict -> whatever info you want embedded in the token (like {"user_id": ... } from login)
def create_access_token(data: dict):
    # make a copy so you dont modify the original dict passed in
    to_encode = data.copy()
    # expire after 30 mins from right now
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # add this expiration as field inside the token itself
    to_encode.update({"exp": expire})
    # produces final token using all the info
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Task: given a string, tell me if it's real, and if so, whose it is?
# token: str = Depends(oauth2_scheme) - this is the dependency injection: before you can call this function, first go 
# get me a token by running this other helper (oauth2_scheme, and put whatever it hands back into the token slot.
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    # try to decode the token, pull out user_id and return it we raise 401
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except JWTError as e:
        raise HTTPException(status_code=401, detail="Invalid or expired token") 