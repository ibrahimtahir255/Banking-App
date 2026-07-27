class AccountRepository:
    def __init__(self) -> None:
        self.accounts = {}
        self.next_id = 1
    

    def create_account(self, account):
        account.account_id = self.next_id
        self.accounts[self.next_id] = account
        self.next_id += 1
        return account

    def get_account(self, account_id):
        return self.accounts.get(account_id)