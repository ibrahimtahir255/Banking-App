from passlib.context import CryptContext

"""
 passlib's CryptContext is a small utility that handles the hashing algorithm details for you.
 You configure it once, then use two simple functions: one to hash a password (during signup), 
 one to verify a plain password against a stored hash (during login).
"""

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain_password):
    return pwd_context.hash(plain_password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
