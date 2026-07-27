class Account():
    def __init__(self, account_id, user_id, balance, account_type, created_at) -> None:
        self.account_id = account_id
        self.user_id = user_id
        self.balance = balance
        self.account_type = account_type
        self.created_at = created_at
