from app.models import account, user
from app.models.transaction import Transaction
from app.models.account import Account

"""
AccountService — business logic layer for accounts.
Coordinates AccountRepository and TransactionRepository to implement
account operations. This is the only layer that enforces business rules
(e.g., deposit must be positive, withdrawal can't exceed balance).
Controllers call into this layer; this layer never touches HTTP directly,
and repositories never contain business rules.

Methods:
    get_account(account_id)          -> Account
    deposit(account_id, amount)      -> Account   (raises ValueError if amount <= 0)
    withdraw(account_id, amount)     -> Account   (raises ValueError if amount > balance)
    get_transactions(account_id)     -> list[Transaction]
"""


class AccountService:
    def __init__(self, account_repository, transaction_repository) -> None:
        self.account_repository = account_repository
        self.transaction_repository = transaction_repository

    def get_account(self, account_id):
        account = self.account_repository.get_account(account_id)
        if account is None:
            raise ValueError("Account not found")

        return account

    def deposit(self, account_id, amount):
        if amount <= 0:
            raise ValueError("Deposit amount must be positive")

        # fetch the accoutn object
        account = self.account_repository.get_account(account_id)
        if account is None:
            raise ValueError("Account not found")

        # increase the account's balance by amount
        account.balance += amount

        # record this by creating a new transaction object
        new_txn = Transaction(txn_id=None, account_id = account_id, txn_type="DEPOSIT", amount=amount, created_at=None)

        # save that transaction
        self.transaction_repository.create_transaction(new_txn)

        # return updated account
        return account

    def withdraw(self, account_id, amount):

        # fetch the account object
        account = self.account_repository.get_account(account_id)
        if account is None:
            raise ValueError("Account not found")
        current_balance = account.balance

        if amount <= 0:
            raise ValueError("Withdraw amount must be positive")

        if amount > current_balance:
            raise ValueError("Withdraw amount must be less than the account balance")


        # decrease the account's balance by amount
        account.balance -= amount

        # record this by creating a new transaction object
        new_txn = Transaction(txn_id=None, account_id = account_id, txn_type="WITHDRAW", amount=amount, created_at=None)

        # save that transaction
        self.transaction_repository.create_transaction(new_txn)

        # return updated account
        return account

    def get_transactions(self, account_id):
        return self.transaction_repository.get_transactions_by_account(account_id)
    
    def create_account(self, user_id, account_type):
        account = Account(account_id=None, user_id=user_id, balance=0,account_type=account_type, created_at=None)
        account = self.account_repository.create_account(account)
        return account
