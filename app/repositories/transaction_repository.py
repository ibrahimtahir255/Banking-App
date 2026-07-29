from app.mongo_db import db
from bson.objectid import ObjectId
from app.models.transaction import Transaction

class TransactionRepository:
    def __init__(self) -> None:
        self.collection = db["transactions"]
    
    def create_transaction(self, transaction):
        document = {
            "account_id": transaction.account_id,
            "txn_type": transaction.txn_type,
            "amount": transaction.amount,
            "created_at": transaction.created_at
        }

        result = self.collection.insert_one(document)
        transaction.txn_id = str(result.inserted_id)
        return transaction
    
    def get_transactions_by_account(self, account_id):
        docs = self.collection.find({"account_id": account_id})
        if docs is None:
            return None
        results = []
        for doc in docs:
            results.append(
                Transaction(
                txn_id=str(doc["_id"]),
                account_id= doc["account_id"],
                txn_type= doc["txn_type"],
                amount= doc["amount"],
                created_at= doc["created_at"]
                )
            )
        return results

    def _to_transaction(self, doc):
        return Transaction(
            txn_id=str(doc["_id"]),
            account_id=doc["account_id"],
            txn_type=doc["txn_type"],
            amount=doc["amount"],
            created_at=doc.get("created_at"),
        )