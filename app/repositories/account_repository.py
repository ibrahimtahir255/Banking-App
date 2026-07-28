from bson.objectid import ObjectId
from app.models.account import Account
from app.mongo_db import db

class AccountRepository:
    def __init__(self) -> None:
        self.collection = db["accounts"]
    

    def create_account(self, account):
        document = {
            "user_id": account.user_id,
            "balance": account.balance,
            "account_type": account.account_type,
            "created_at": account.created_at
        }

        result = self.collection.insert_one(document)
        account.account_id = str(result.inserted_id)
        return account 

    def get_account(self, account_id):
        doc = self.collection.find_one({"_id": ObjectId(account_id)})
        if doc is None:
            return None
        return Account(
            account_id=str(doc["_id"]),
            user_id=doc["user_id"],
            balance=doc["balance"],
            account_type=doc["account_type"],
            created_at=doc["created_at"]
        )

    def delete_account(self, account_id):
        doc = self.collection.find_one_and_delete({"_id": ObjectId(account_id)})
        if doc is None:
            return None
        return Account(
            account_id=str(doc["_id"]),
            user_id=doc["user_id"],
            balance=doc["balance"],
            account_type=doc["account_type"],
            created_at=doc["created_at"]
        )

    def update_balance(self, account_id, new_balance):
        self.collection.update_one(
            {"_id": ObjectId(account_id)},
            {"$set": {"balance": new_balance}}
        )
