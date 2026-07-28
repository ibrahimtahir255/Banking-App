USE citi;

-- ==========================
-- USERS
-- ==========================
INSERT INTO users (name, email) VALUES
('John Smith', 'john.smith@email.com'),
('Alice Johnson', 'alice.johnson@email.com'),
('Michael Brown', 'michael.brown@email.com'),
('Sarah Davis', 'sarah.davis@email.com'),
('David Wilson', 'david.wilson@email.com');

-- ==========================
-- ACCOUNTS
-- ==========================
INSERT INTO accounts (user_id, balance, account_type) VALUES
(1, 2500.00, 'Checking'),
(1, 10000.00, 'Savings'),

(2, 1500.50, 'Checking'),

(3, 7800.25, 'Savings'),
(3, 500.00, 'Checking'),

(4, 22000.00, 'Savings'),

(5, 50.75, 'Checking');

-- ==========================
-- TRANSACTIONS
-- ==========================
INSERT INTO transactions (account_id, txn_type, amount) VALUES
-- John's Checking
(1, 'DEPOSIT', 3000.00),
(1, 'WITHDRAW', 500.00),

-- John's Savings
(2, 'DEPOSIT', 10000.00),

-- Alice's Checking
(3, 'DEPOSIT', 2000.00),
(3, 'WITHDRAW', 499.50),

-- Michael's Savings
(4, 'DEPOSIT', 8000.00),
(4, 'WITHDRAW', 199.75),

-- Michael's Checking
(5, 'DEPOSIT', 500.00),

-- Sarah's Savings
(6, 'DEPOSIT', 22000.00),

-- David's Checking
(7, 'DEPOSIT', 100.75),
(7, 'WITHDRAW', 50.00);