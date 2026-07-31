class Transaction():
    def __init__(self, txn_id, account_id, txn_type, amount, created_at) -> None:
        self.txn_id = txn_id
        self.account_id = account_id
        self.txn_type = txn_type
        self.amount = amount
        self.created_at = created_at
