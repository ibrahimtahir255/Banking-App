from types import SimpleNamespace

from app.services.risk_scoring_service import RiskScoringService


class FakeAccountRepository:
    def __init__(self, account):
        self.account = account

    def update_risk_score(self, account_id, new_score):
        self.account.risk_score = new_score

    def get_account(self, account_id):
        return self.account

    def get_accounts_by_user(self, user_id):
        return [self.account]


class FakeTransactionRepository:
    pass


class FakeUserRepository:
    def __init__(self, user):
        self.user = user

    def get_user(self, user_id):
        return self.user


def test_email_is_sent_when_risk_threshold_is_exceeded():
    account = SimpleNamespace(
        account_id="acc-1",
        user_id="user-1",
        balance=1000,
        account_type="checking",
        created_at=None,
        risk_score=90,
    )
    user = SimpleNamespace(
        user_id="user-1",
        name="Jane",
        email="jane@example.com",
        password="secret",
        created_at=None,
    )

    notifications = []

    def fake_email_service(recipient_email, account_id, risk_score, threshold):
        notifications.append((recipient_email, account_id, risk_score, threshold))

    service = RiskScoringService(
        FakeAccountRepository(account),
        FakeTransactionRepository(),
        user_repository=FakeUserRepository(user),
        email_service=fake_email_service,
    )

    service.evaluate_deposit(10000, account)

    assert account.risk_score == 100
    assert notifications == [("jane@example.com", "acc-1", 100, 100)]
