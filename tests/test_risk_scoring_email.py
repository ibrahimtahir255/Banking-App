from types import SimpleNamespace

from app.services.account_service import AccountService
from app.services.risk_scoring_service import RiskScoringService


class FakeAccountRepository:
    def __init__(self, account):
        self.account = account

    def update_risk_score(self, account_id, new_score):
        self.account.risk_score = new_score

    def update_account_security_state(self, account_id, *, is_frozen, verification_code):
        self.account.is_frozen = is_frozen
        self.account.verification_code = verification_code

    def reset_risk_score(self, account_id, new_score):
        self.account.risk_score = new_score

    def get_account(self, account_id):
        return self.account

    def get_accounts_by_user(self, user_id):
        return [self.account]


class FakeTransactionRepository:
    def __init__(self):
        self.transactions = []

    def create_transaction(self, transaction):
        self.transactions.append(transaction)


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
        is_frozen=False,
        verification_code=None,
    )
    user = SimpleNamespace(
        user_id="user-1",
        name="Jane",
        email="jane@example.com",
        password="secret",
        created_at=None,
    )

    notifications = []

    def fake_email_service(recipient_email, account_id, risk_score, threshold, verification_code=None):
        notifications.append((recipient_email, account_id, risk_score, threshold, verification_code))

    service = RiskScoringService(
        FakeAccountRepository(account),
        FakeTransactionRepository(),
        user_repository=FakeUserRepository(user),
        email_service=fake_email_service,
    )

    service.evaluate_deposit(10000, account)

    assert account.risk_score == 100
    assert account.is_frozen is True
    assert account.verification_code is not None
    assert notifications[0][0] == "jane@example.com"
    assert notifications[0][1] == "acc-1"
    assert notifications[0][2] == 100
    assert notifications[0][3] == 100
    assert notifications[0][4] == account.verification_code


def test_frozen_account_blocks_deposit_until_verification_code_is_used():
    account = SimpleNamespace(
        account_id="acc-1",
        user_id="user-1",
        balance=1000,
        account_type="checking",
        created_at=None,
        risk_score=100,
        is_frozen=True,
        verification_code="123456",
    )
    transaction_repository = FakeTransactionRepository()
    account_repository = FakeAccountRepository(account)
    service = AccountService(account_repository, transaction_repository, risk_scoring_service=None)

    try:
        service.deposit("acc-1", 500)
    except ValueError as exc:
        assert "frozen" in str(exc).lower()
    else:
        raise AssertionError("deposit should be blocked for a frozen account")


def test_verification_resets_risk_score_and_unfreezes_account():
    account = SimpleNamespace(
        account_id="acc-1",
        user_id="user-1",
        balance=1000,
        account_type="checking",
        created_at=None,
        risk_score=100,
        is_frozen=True,
        verification_code="123456",
    )
    repository = FakeAccountRepository(account)
    service = RiskScoringService(
        repository,
        FakeTransactionRepository(),
        user_repository=None,
        email_service=None,
    )

    verified_account = service.verify_account("acc-1", "123456")

    assert verified_account is not False
    assert verified_account.is_frozen is False
    assert verified_account.verification_code is None
    assert verified_account.risk_score == 0
