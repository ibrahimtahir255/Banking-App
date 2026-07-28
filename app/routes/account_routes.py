from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.dependencies import account_service

router = APIRouter()

class CreateAccountRequest(BaseModel):
    userId: int
    accountType: str

class AmountRequest(BaseModel):
    amount: float
    
    
# The 5 route functions below, using account_service
# POST /api/accounts
@router.post("/api/accounts")
def create_account(request: CreateAccountRequest):
    account = account_service.create_account(request.userId, request.accountType)
    return account

# GET /api/accounts/{id}
@router.get("/api/accounts/{account_id}")
def get_account(account_id: int):
    try:
        account = account_service.get_account(account_id)
        return account
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# deposit
# POST /api/accounts/{id}/deposit
@router.post("/api/accounts/{account_id}/deposit")
def deposit(account_id: int, request: AmountRequest):
    try:
        account_deposit = account_service.deposit(account_id, request.amount)
        return account_deposit
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# withdraw
# POST /api/accounts/{id}/withdraw
@router.post("/api/accounts/{account_id}/withdraw")
def withdraw(account_id: int, request: AmountRequest):
    try:
        account_withdrawal = account_service.withdraw(account_id, request.amount)
        return account_withdrawal
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# transaction
# GET /api/accounts/{id}/transactions
@router.get("/api/accounts/{account_id}/transactions")
def get_transaction(account_id: int):
    try:
        current_tnx = account_service.get_transactions(account_id)
        return current_tnx
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))