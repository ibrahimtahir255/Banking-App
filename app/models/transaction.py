class Transaction():
    def __init__(self, txn_id, account_id, txn_type, amount, created_at, related_account_id=None) -> None:
        self.txn_id = txn_id
        self.account_id = account_id
        self.txn_type = txn_type
        self.amount = amount
        self.created_at = created_at
        # For TRANSFER_IN / TRANSFER_OUT transactions, this points at the
        # other account on the other side of the transfer. None for a
        # plain deposit/withdrawal.
        self.related_account_id = related_account_id
