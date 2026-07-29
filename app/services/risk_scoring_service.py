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
    get_account(adeccount_id)          -> Account
    deposit(account_id, amount)      -> Account   (raises ValueError if amount <= 0)
    withdraw(account_id, amount)     -> Account   (raises ValueError if amount > balance)
    get_transactions(account_id)     -> list[Transaction]
"""
#Create a seperate service for risk score increase. Have the other services
#delegate risk scoring responsibility

#According to the IRS, deposits of $10,000 must be reported to 
# the government. We'll use that deposit amount as a red flag too. 

class RiskScoringService:
    #Get access to account and transaction repos
    def __init__(self, account_repository, transaction_repository) -> None:
        self.account_repository = account_repository
        self.transaction_repository = transaction_repository

    def evaluate_deposit(self,deposit_amount,account:Account ):
        print("Evaluating deposit now! ")
        balance_before_deposit = account.balance
        print(balance_before_deposit)

        if (deposit_amount >= 10000) or (deposit_amount > 0.9 * balance_before_deposit):
            print("MORE THAN OR EQUAL 10,000 DEPOSITED THAT'S SUS")
            #Incrase risk score by 10

            #Update risk score by adding 10 to the account's risk score
            account.risk_score += 10
            self.account_repository.update_risk_score(account.account_id, account.risk_score)
            
        
        
