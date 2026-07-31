from app.models import account, user
from app.models.transaction import Transaction
from app.models.account import Account
from app.services.risk_scoring_service import RiskScoringService
"""
AccountService — business logic layer for accounts.
Coordinates AccountRepository and TransactionRepository to implement
account operations. This is the only layer that enforces business rules
(e.g., deposit must be positive, withdrawal can't exceed balance).
Controllers call into this layer; this layer never touches HTTP directly,
and repositories never contain business rules.

Methods:
    get_account(adeccount_id)          -> Account
    deposit(account_id, amount)      -> Account   (raises ValueError if amount <= 0)
    withdraw(account_id, amount)     -> Account   (raises ValueError if amount > balance)
    get_transactions(account_id)     -> list[Transaction]
"""


class AccountService:
    def __init__(self, account_repository, transaction_repository, risk_scoring_service) -> None:
        self.account_repository = account_repository
        self.transaction_repository = transaction_repository

        #Account object depends on the risk scoring service as well 
        self.risk_scoring_service = risk_scoring_service
        

    def get_account(self, account_id):
        return self.account_repository.get_account(account_id)

    def deposit(self, account_id, amount):
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")

        # fetch the accoutn object
        account = self.account_repository.get_account(account_id)

        #Evaluate risk score of deposit amount
        a = self.risk_scoring_service.evaluate_deposit(amount,account)

        # increase the account's balance by amount
        #Due to the repository not adding the amount into the Mongo document itself,
        #the balance in the document remains 0. You're only adding to the balance of the
        #Account object
        account.balance += amount

        #Add amount to the document
        self.account_repository.update_balance(account_id,account.balance)

        # record this by creating a new transaction object
        new_txn = Transaction(txn_id=None, account_id = account_id, txn_type="DEPOSIT", amount=amount, created_at=None)

        # save that transaction
        self.transaction_repository.create_transaction(new_txn)

        # return updated account
        return account

    def withdraw(self, account_id, amount):

        # fetch the account object
        account = self.account_repository.get_account(account_id)
        current_balance = account.balance

        if amount <= 0:
            raise ValueError("Withdraw amount must be positive")

        if amount > current_balance:
            raise ValueError("Withdraw amount must be less than the account balance")


        # decrease the account's balance by amount
        account.balance -= amount

        #Remove amount from document
        self.account_repository.update_balance(account_id,account.balance)

        # record this by creating a new transaction object
        new_txn = Transaction(txn_id=None, account_id = account_id, txn_type="WITHDRAW", amount=amount, created_at=None)

        # save that transaction
        self.transaction_repository.create_transaction(new_txn)

        # return updated account
        return account

    def get_transactions(self, account_id):
        return self.transaction_repository.get_transactions_by_account(account_id)

    def transfer(self, from_account_id, to_account_id, amount):
        if amount <= 0:
            raise ValueError("Transfer amount must be positive")

        if from_account_id == to_account_id:
            raise ValueError("Cannot transfer to the same account")

        from_account = self.account_repository.get_account(from_account_id)
        to_account = self.account_repository.get_account(to_account_id)

        if amount > from_account.balance:
            raise ValueError("Transfer amount must be less than the account balance")

        # Move the balance between the two accounts.
        from_account.balance -= amount
        self.account_repository.update_balance(from_account_id, from_account.balance)

        to_account.balance += amount
        self.account_repository.update_balance(to_account_id, to_account.balance)

        # Record both legs, linked to each other via related_account_id, so the
        # frontend can show these as a single "Transfer" instead of a plain
        # deposit/withdrawal pair.
        out_txn = Transaction(
            txn_id=None, account_id=from_account_id, txn_type="TRANSFER_OUT",
            amount=amount, created_at=None, related_account_id=to_account_id,
        )
        self.transaction_repository.create_transaction(out_txn)

        in_txn = Transaction(
            txn_id=None, account_id=to_account_id, txn_type="TRANSFER_IN",
            amount=amount, created_at=None, related_account_id=from_account_id,
        )
        self.transaction_repository.create_transaction(in_txn)

        # Money landing in the destination account is still worth a risk look,
        # same as it would be for a regular deposit.
        self.risk_scoring_service.evaluate_deposit(amount, to_account)

        return {"from_account": from_account, "to_account": to_account}
    
    def create_account(self, user_id, account_type):
        if not user_id:
            raise ValueError("user_id is required")

        account = Account(
            account_id=None,
            user_id=user_id,
            balance=0,
            account_type=account_type,
            created_at=None,
            risk_score=0,
        )
        account = self.account_repository.create_account(account)
        return account

    def get_accounts_by_user(self, user_id):
        return self.account_repository.get_accounts_by_user(user_id)

    def delete_account(self, account_id):
        account = self.account_repository.delete_account(account_id)
        if account is None:
            raise ValueError("Account not found")
            
        return account
