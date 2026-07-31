from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.dependencies import account_service
from app.auth import get_current_user

router = APIRouter()

class CreateAccountRequest(BaseModel):
    userId: str
    accountType: str

class AmountRequest(BaseModel):
    amount: float

class TransferRequest(BaseModel):
    to_account_id: str
    amount: float
    
    
# The 5 route functions below, using account_service
# POST /api/accounts
@router.post("/api/accounts")
def create_account(request: CreateAccountRequest, current_user:str = Depends(get_current_user)):
    # authorization check!
    if request.userId != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to access this account")

    account = account_service.create_account(request.userId, request.accountType)
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


@router.get("/api/users/{user_id}/accounts")
def get_accounts_by_user(user_id: str, current_user: str = Depends(get_current_user)):
    if user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to access this account")
    return account_service.get_accounts_by_user(user_id)

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

# transfer between two of your own accounts
# POST /api/accounts/{account_id}/transfer
@router.post("/api/accounts/{account_id}/transfer")
def transfer(account_id: str, request: TransferRequest, current_user:str = Depends(get_current_user)):
    try:
        # authorization check! the source account must be yours
        from_account = account_service.get_account(account_id)
        if from_account.user_id != current_user:
            raise HTTPException(status_code=403, detail="Not authorized to access this account")

        # authorization check! you can only transfer into an account you also own
        to_account = account_service.get_account(request.to_account_id)
        if to_account.user_id != current_user:
            raise HTTPException(status_code=403, detail="You can only transfer between your own accounts")

        result = account_service.transfer(account_id, request.to_account_id, request.amount)
        return result
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
