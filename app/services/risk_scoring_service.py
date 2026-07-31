import random

from app.models import account, user
from app.models.transaction import Transaction
from app.models.account import Account
from app.services.email_service import send_high_risk_email

"""
RiskScoringService — business logic layer for fraud detection and risk analysis.
Coordinates AccountRepository and TransactionRepository to evaluate potentially
suspicious account activity and update an account's risk score. This is the only
layer responsible for applying fraud detection rules and determining whether an
account's risk score should increase. Controllers call into this layer; this
layer never touches HTTP directly, and repositories never contain fraud or risk
assessment logic.

Methods:
    evaluate_deposit(deposit_amount, account)   -> None
        Evaluates a deposit for suspicious activity (e.g., large deposits or
        deposits that are unusually large relative to the current balance) and
        updates the account's risk score if necessary.

    evaluate_login_attempt(user_id)             -> list[Account]
        Evaluates a failed or suspicious login attempt by increasing the risk
        score of all accounts associated with the specified user.

    evaluate(account_id)                        -> None
        Performs a full risk evaluation for an account, recalculates its risk
        score, updates the stored score, and triggers a high-risk notification
        if the configured threshold is exceeded.
"""
#Create a seperate service for risk score increase. Have the other services
#delegate risk scoring responsibility

#According to the IRS, deposits of $10,000 must be reported to 
# the government. We'll use that deposit amount as a red flag too. 

RISK_THRESHOLD = 100

# The email feature is part of the risk-scoring workflow.
# It does not run when the service is created. It runs only when risk scoring logic
# detects that an account has crossed the RISK_THRESHOLD after a suspicious event.
class RiskScoringService:
    #Get access to account and transaction repos
    def __init__(self, account_repository, transaction_repository, user_repository=None, email_service=None) -> None:
        self.account_repository = account_repository
        self.transaction_repository = transaction_repository
        self.user_repository = user_repository
        self.email_service = email_service or send_high_risk_email

    def _send_high_risk_notification(self, account: Account, new_score: int):
        # Only send an email if we have both the user lookup and the email callback available.
        if self.user_repository is None or self.email_service is None:
            return

        # Look up the account owner so we know which email address should receive the alert.
        user = self.user_repository.get_user(account.user_id)
        if user is None:
            return

        recipient_email = getattr(user, "email", None)
        if not recipient_email:
            return

        verification_code = self._generate_verification_code()
        account.is_frozen = True
        account.verification_code = verification_code
        self.account_repository.update_account_security_state(
            account.account_id,
            is_frozen=True,
            verification_code=verification_code,
        )

        # Trigger the email notification once the account crosses the danger threshold.
        try:
            self.email_service(recipient_email, account.account_id, new_score, RISK_THRESHOLD, verification_code)
        except Exception as exc:
            print(f"Failed to send high-risk email: {exc}")

    def _generate_verification_code(self) -> str:
        return str(random.randint(100000, 999999))

    def verify_account(self, account_id, verification_code):
        account_item = self.account_repository.get_account(account_id)
        if account_item is None:
            return None

        if account_item.verification_code is None or str(verification_code) != str(account_item.verification_code):
            return False

        account_item.is_frozen = False
        account_item.verification_code = None
        account_item.risk_score = 0

        self.account_repository.update_account_security_state(
            account_id,
            is_frozen=False,
            verification_code=None,
        )
        self.account_repository.reset_risk_score(account_id, 0)
        return account_item

    def evaluate_deposit(self, deposit_amount, account: Account):
        print("Evaluating deposit now! ")
        balance_before_deposit = account.balance
        print(balance_before_deposit)

        if (deposit_amount >= 10000) or (deposit_amount > 0.9 * balance_before_deposit):
            print("MORE THAN OR EQUAL 10,000 DEPOSITED. INCREASING RISK SCORE BY 10")

            previous_score = account.risk_score
            account.risk_score += 10
            self.account_repository.update_risk_score(account.account_id, account.risk_score)

            # Send an alert only when the score crosses from below the threshold to at/above it.
            if previous_score < RISK_THRESHOLD and account.risk_score >= RISK_THRESHOLD:
                self._send_high_risk_notification(account, account.risk_score)

    def evaluate_login_attempt(self, user_id):
        if not user_id:
            return []

        accounts = self.account_repository.get_accounts_by_user(user_id)

        updated_accounts = []

        for account_item in accounts:
            print(account_item)
            previous_score = account_item.risk_score
            account_item.risk_score += 10
            self.account_repository.update_risk_score(account_item.account_id, account_item.risk_score)

            # If a login-related risk increase pushes the score over the threshold,
            # notify the account owner by email.
            if previous_score < RISK_THRESHOLD and account_item.risk_score >= RISK_THRESHOLD:
                self._send_high_risk_notification(account_item, account_item.risk_score)
            updated_accounts.append(account_item)

        return updated_accounts

    def evaluate(self, account_id):
        account_item = self.account_repository.get_account(account_id)
        if account_item is None:
            return None

        score = account_item.risk_score
        self.account_repository.update_risk_score(account_id, score)

        # A full evaluation may also trigger an alert if the stored score is already high enough.
        if score >= RISK_THRESHOLD:
            self._send_high_risk_notification(account_item, score)

        return account_item