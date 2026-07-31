from app.services.account_service import AccountService


class FakeAccountRepository:
    def __init__(self):
        self.created_accounts = []

    def create_account(self, account):
        self.created_accounts.append(account)
        account.account_id = "acct-1"
        return account

    def get_accounts_by_user(self, user_id):
        return [account for account in self.created_accounts if account.user_id == user_id]


class FakeTransactionRepository:
    def create_transaction(self, transaction):
        return transaction

    def get_transactions_by_account(self, account_id):
        return []


class FakeRiskScoringService:
    def evaluate_deposit(self, amount, account):
        return 0


def test_create_account_assigns_user_id_and_returns_user_accounts():
    repo = FakeAccountRepository()
    service = AccountService(repo, FakeTransactionRepository(), FakeRiskScoringService())

    account = service.create_account("user-42", "checking")
    accounts_for_user = service.get_accounts_by_user("user-42")

    assert account.user_id == "user-42"
    assert len(accounts_for_user) == 1
    assert accounts_for_user[0].account_id == "acct-1"
