from app.mongo_db import db
from bson.objectid import ObjectId
from app.models.user import User


class UserRepository:
    def __init__(self) -> None:
        self.collection = db["users"]

    def create_user(self, user):
        document = {
            "name": user.name,
            "email": user.email,
            "password": user.password,
            "created_at": user.created_at,
        }

        result = self.collection.insert_one(document)
        user.user_id = str(result.inserted_id)
        return user

    def get_user(self, user_id):
        doc = self.collection.find_one({"_id": ObjectId(user_id)})
        if doc is None:
            return None
        return User(
            user_id=str(doc["_id"]),
            name=doc["name"],
            email=doc["email"],
            password=doc["password"],
            created_at=doc["created_at"],
        )

    def get_user_by_email(self, email):
        doc = self.collection.find_one({"email": email})
        if doc is None:
            return None
        return User(
            user_id=str(doc["_id"]),
            name=doc["name"],
            email=doc["email"],
            password=doc["password"],
            created_at=doc["created_at"],
        )