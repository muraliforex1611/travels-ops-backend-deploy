-- Accounts Module - Financial Schema
-- Migration: 007_accounts_financial_schema

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create income_transactions table
CREATE TABLE IF NOT EXISTS income_transactions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  booking_id INTEGER REFERENCES bookings(booking_id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create expense_transactions table
CREATE TABLE IF NOT EXISTS expense_transactions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id INTEGER,
  transaction_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  vendor_name VARCHAR(255),
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  created_by INTEGER REFERENCES users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create expense_categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES expense_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key for expense categories
ALTER TABLE expense_transactions
DROP CONSTRAINT IF EXISTS expense_transactions_category_id_fkey;

ALTER TABLE expense_transactions
ADD CONSTRAINT expense_transactions_category_id_fkey
FOREIGN KEY (category_id) REFERENCES expense_categories(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_income_company ON income_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_income_booking ON income_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_income_date ON income_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_expense_company ON expense_transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_expense_category ON expense_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_expense_date ON expense_transactions(transaction_date);

-- Create views for financial summaries
CREATE OR REPLACE VIEW day_book AS
SELECT
  'INCOME' as type,
  it.transaction_date as date,
  c.name as company,
  it.description,
  it.amount,
  it.payment_method,
  it.reference_number
FROM income_transactions it
JOIN companies c ON it.company_id = c.id
UNION ALL
SELECT
  'EXPENSE' as type,
  et.transaction_date as date,
  c.name as company,
  et.description,
  et.amount,
  et.payment_method,
  et.reference_number
FROM expense_transactions et
JOIN companies c ON et.company_id = c.id
ORDER BY date DESC;

CREATE OR REPLACE VIEW monthly_summary AS
SELECT
  c.id as company_id,
  c.name as company_name,
  DATE_TRUNC('month', it.transaction_date) as month,
  COALESCE(SUM(it.amount), 0) as total_income,
  COALESCE(SUM(et.amount), 0) as total_expense,
  COALESCE(SUM(it.amount), 0) - COALESCE(SUM(et.amount), 0) as net_profit
FROM companies c
LEFT JOIN income_transactions it ON c.id = it.company_id
LEFT JOIN expense_transactions et ON c.id = et.company_id
GROUP BY c.id, c.name, DATE_TRUNC('month', it.transaction_date)
ORDER BY month DESC, c.name;

-- Insert default expense categories
INSERT INTO expense_categories (name, description) VALUES
('Accommodation', 'Hotel and lodging expenses'),
('Transportation', 'Vehicle and travel expenses'),
('Food & Beverage', 'Meal and refreshment costs'),
('Activities', 'Tour and activity fees'),
('Commission', 'Agent and partner commissions'),
('Salary', 'Staff salary payments'),
('Office Supplies', 'Office materials and supplies'),
('Utilities', 'Electricity, water, internet, etc.'),
('Marketing', 'Advertising and promotion costs'),
('Other', 'Miscellaneous expenses')
ON CONFLICT (name) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_income_updated_at BEFORE UPDATE ON income_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_updated_at BEFORE UPDATE ON expense_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
