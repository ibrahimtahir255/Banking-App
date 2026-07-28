from app.repositories.user_repository import UserRepository
from app.repositories.account_repository import AccountRepository
from app.repositories.transaction_repository import TransactionRepository
from app.services.account_service import AccountService

from app.models.user import User

"""
dependencies.py = shared application state.

Creates single, long-lived instances of each repository and service so
that in-memory data persists across requests. Routes import these
ready-made objects instead of constructing their own repositories/services,
ensuring every request works against the same underlying data.
"""

user_repository = UserRepository()
account_repository = AccountRepository()
transaction_repository = TransactionRepository()
account_service = AccountService(account_repository, transaction_repository)

# Seed one test user since account creation currently requires an existing userId

user = User(None, "Test User", "test@example.com", None )
user_repository.create_user(user)