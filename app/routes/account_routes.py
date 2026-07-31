from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.dependencies import account_service

router = APIRouter()

class CreateAccountRequest(BaseModel):
    userId: str
    accountType: str

class AmountRequest(BaseModel):
    amount: float


class VerificationRequest(BaseModel):
    verificationCode: str
    
    
# The 5 route functions below, using account_service
# POST /api/accounts
@router.post("/api/accounts")
def create_account(request: CreateAccountRequest):
    account = account_service.create_account(request.userId, request.accountType)
    return account

# GET /api/accounts/{id}
@router.get("/api/accounts/{account_id}")
def get_account(account_id: str):
    try:
        account = account_service.get_account(account_id)
        return account
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/users/{user_id}/accounts")
def get_accounts_by_user(user_id: str):
    return account_service.get_accounts_by_user(user_id)

# deposit
# POST /api/accounts/{id}/deposit
@router.post("/api/accounts/{account_id}/deposit")
def deposit(account_id: str, request: AmountRequest):
    try:
        account_deposit = account_service.deposit(account_id, request.amount)
        return account_deposit
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# withdraw
# POST /api/accounts/{id}/withdraw
@router.post("/api/accounts/{account_id}/withdraw")
def withdraw(account_id: str, request: AmountRequest):
    try:
        account_withdrawal = account_service.withdraw(account_id, request.amount)
        return account_withdrawal
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/api/accounts/{account_id}/verify")
def verify_account(account_id: str, request: VerificationRequest):
    try:
        verified_account = account_service.verify_account(account_id, request.verificationCode)
        if verified_account is False:
            raise HTTPException(status_code=400, detail="Invalid verification code")
        return verified_account
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# transaction
# GET /api/accounts/{id}/transactions
@router.get("/api/accounts/{account_id}/transactions")
def get_transaction(account_id: str):
    try:
        current_tnx = account_service.get_transactions(account_id)
        return current_tnx
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# Delete account
# DELETE /api/accounts/{id}
@router.delete("/api/accounts/{account_id}")
def delete_account(account_id: str):
    try:
        account = account_service.delete_account(account_id)
        return account
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
