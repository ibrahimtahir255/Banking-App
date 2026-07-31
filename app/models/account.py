class Account():
    def __init__(self, account_id, user_id, balance, account_type, created_at, risk_score, is_frozen=False, verification_code=None) -> None:
        self.account_id = account_id
        self.user_id = user_id
        self.balance = balance
        self.account_type = account_type
        self.created_at = created_at
        self.risk_score = risk_score
        self.is_frozen = is_frozen
        self.verification_code = verification_code
