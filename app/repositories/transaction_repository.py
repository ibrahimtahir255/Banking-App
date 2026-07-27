class TransactionRepository:
    def __init__(self) -> None:
        self.transaction = {}
        self.txn_id = 1
    
    def create_transaction(self, transaction):
        transaction.txn_id = self.txn_id
        self.transaction[transaction.txn_id] = transaction
        self.txn_id += 1
        return transaction

    def get_transactions_by_account(self, account_id):
        result = []
        for txn in self.transaction.values():
            if txn.account_id == account_id:
                result.append(txn)
        return result

