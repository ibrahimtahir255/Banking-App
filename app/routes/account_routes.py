from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.dependencies import account_service
from app.auth import get_current_user

router = APIRouter()

class CreateAccountRequest(BaseModel):
    user_id: str
    accountType: str

class AmountRequest(BaseModel):
    amount: float
    
    
# The 5 route functions below, using account_service
# POST /api/accounts
@router.post("/api/accounts")
def create_account(request: CreateAccountRequest, current_user:str = Depends(get_current_user)):
    # authorization check!
    if request.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to access this account")

    account = account_service.create_account(request.user_id, request.accountType)
    return account

# GET /api/accounts/{id}
@router.get("/api/accounts/{account_id}")
def get_account(account_id: str, current_user:str = Depends(get_current_user)):
    try:
        account = account_service.get_account(account_id)
        # authorization check!
        if account.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to access this account")
        return account
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# deposit
# POST /api/accounts/{id}/deposit
@router.post("/api/accounts/{account_id}/deposit")
def deposit(account_id: str, request: AmountRequest, current_user:str = Depends(get_current_user)):
    try:
        # authorization check!
        # fetch account first
        account = account_service.get_account(account_id)
        if account.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to access this account")
        account_deposit = account_service.deposit(account_id, request.amount)
        return account_deposit
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# withdraw
# POST /api/accounts/{id}/withdraw
@router.post("/api/accounts/{account_id}/withdraw")
def withdraw(account_id: str, request: AmountRequest, current_user:str = Depends(get_current_user)):
    try:
        # authorization check!
        # fetch account first
        account = account_service.get_account(account_id)
        if account.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to access this account")
        account_withdrawal = account_service.withdraw(account_id, request.amount)
        return account_withdrawal
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# transaction
# GET /api/accounts/{id}/transactions
@router.get("/api/accounts/{account_id}/transactions")
def get_transaction(account_id: str, current_user:str = Depends(get_current_user)):
    try:
        # authorization check!
        # fetch account first
        account = account_service.get_account(account_id)
        if account.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to access this account")

        current_tnx = account_service.get_transactions(account_id)
        return current_tnx
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# Delete account
# DELETE /api/accounts/{id}
@router.delete("/api/accounts/{account_id}")
def delete_account(account_id: str, current_user:str = Depends(get_current_user)):
    try:
        # authorization check!
        # fetch account first
        account = account_service.get_account(account_id)
        if account.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to access this account")
        account = account_service.delete_account(account_id)
        return account
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
