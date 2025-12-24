import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { supabase } from '../../config/database.config';
import { CreateIncomeDto, UpdateIncomeDto } from './dto/income.dto';
import { CreateExpenseDto } from './dto/expense.dto';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  // =====================================================================
  // INCOME MANAGEMENT
  // =====================================================================

  /**
   * Create income transaction
   */
  async createIncome(createDto: CreateIncomeDto, userId: number): Promise<any> {
    try {
      // Calculate GST if applicable
      let gstAmount = 0;
      let cgst = 0;
      let sgst = 0;

      if (createDto.is_gst_applicable && createDto.gst_percentage) {
        gstAmount = (createDto.amount * createDto.gst_percentage) / 100;
        cgst = gstAmount / 2;
        sgst = gstAmount / 2;
      }

      const { data, error } = await supabase
        .from('income_transactions')
        .insert({
          ...createDto,
          gst_amount: gstAmount,
          cgst_amount: cgst,
          sgst_amount: sgst,
          created_by: userId,
        })
        .select(`
          *,
          income_categories (category_name, category_code),
          bookings (booking_code),
          companies (company_name)
        `)
        .single();

      if (error) throw new Error(`Failed to create income: ${error.message}`);

      return { success: true, message: 'Income transaction created', data };
    } catch (error) {
      this.logger.error(`Create income failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all income transactions with filters
   */
  async getIncomeTransactions(filters?: {
    from_date?: string;
    to_date?: string;
    category_id?: number;
    company_id?: number;
  }): Promise<any> {
    try {
      let query = supabase
        .from('income_transactions')
        .select(`
          *,
          income_categories (category_name, category_code),
          bookings (booking_code, customer_name),
          companies (company_name)
        `)
        .order('transaction_date', { ascending: false });

      if (filters?.from_date) query = query.gte('transaction_date', filters.from_date);
      if (filters?.to_date) query = query.lte('transaction_date', filters.to_date);
      if (filters?.category_id) query = query.eq('category_id', filters.category_id);
      if (filters?.company_id) query = query.eq('company_id', filters.company_id);

      const { data, error } = await query;
      if (error) throw new Error(`Failed to fetch income: ${error.message}`);

      const total = data.reduce((sum, item) => sum + parseFloat(item.amount), 0);

      return { success: true, count: data.length, total_amount: total, data };
    } catch (error) {
      this.logger.error(`Get income failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // =====================================================================
  // EXPENSE MANAGEMENT
  // =====================================================================

  /**
   * Create expense transaction
   */
  async createExpense(createDto: CreateExpenseDto, userId: number): Promise<any> {
    try {
      // Calculate GST if applicable
      let gstAmount = 0;
      let cgst = 0;
      let sgst = 0;

      if (createDto.is_gst_applicable && createDto.gst_percentage) {
        gstAmount = (createDto.amount * createDto.gst_percentage) / 100;
        cgst = gstAmount / 2;
        sgst = gstAmount / 2;
      }

      const { data, error } = await supabase
        .from('expense_transactions')
        .insert({
          ...createDto,
          gst_amount: gstAmount,
          cgst_amount: cgst,
          sgst_amount: sgst,
          created_by: userId,
        })
        .select(`
          *,
          expense_categories (category_name, category_code),
          vehicles (registration_number),
          drivers (full_name)
        `)
        .single();

      if (error) throw new Error(`Failed to create expense: ${error.message}`);

      return { success: true, message: 'Expense transaction created', data };
    } catch (error) {
      this.logger.error(`Create expense failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all expense transactions with filters
   */
  async getExpenseTransactions(filters?: {
    from_date?: string;
    to_date?: string;
    category_id?: number;
    vehicle_id?: number;
  }): Promise<any> {
    try {
      let query = supabase
        .from('expense_transactions')
        .select(`
          *,
          expense_categories (category_name, category_code),
          vehicles (registration_number, make, model),
          drivers (full_name, mobile_number)
        `)
        .order('transaction_date', { ascending: false });

      if (filters?.from_date) query = query.gte('transaction_date', filters.from_date);
      if (filters?.to_date) query = query.lte('transaction_date', filters.to_date);
      if (filters?.category_id) query = query.eq('category_id', filters.category_id);
      if (filters?.vehicle_id) query = query.eq('vehicle_id', filters.vehicle_id);

      const { data, error } = await query;
      if (error) throw new Error(`Failed to fetch expenses: ${error.message}`);

      const total = data.reduce((sum, item) => sum + parseFloat(item.amount), 0);

      return { success: true, count: data.length, total_amount: total, data };
    } catch (error) {
      this.logger.error(`Get expenses failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // =====================================================================
  // DAY BOOK (Combined Income + Expense)
  // =====================================================================

  /**
   * Get day book for a date range
   */
  async getDayBook(fromDate: string, toDate: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('day_book')
        .select('*')
        .gte('transaction_date', fromDate)
        .lte('transaction_date', toDate)
        .order('transaction_date', { ascending: false });

      if (error) throw new Error(`Failed to fetch day book: ${error.message}`);

      const totalIncome = data
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalExpense = data
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      return {
        success: true,
        from_date: fromDate,
        to_date: toDate,
        total_income: totalIncome,
        total_expense: totalExpense,
        net_profit: totalIncome - totalExpense,
        transactions: data,
      };
    } catch (error) {
      this.logger.error(`Get day book failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // =====================================================================
  // MONTHLY SUMMARY
  // =====================================================================

  /**
   * Get monthly summary
   */
  async getMonthlySummary(year: number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('monthly_summary')
        .select('*')
        .eq('year', year)
        .order('month', { ascending: true });

      if (error) throw new Error(`Failed to fetch monthly summary: ${error.message}`);

      const yearlyTotal = {
        total_income: data.reduce((sum, m) => sum + parseFloat(m.total_income || 0), 0),
        total_expense: data.reduce((sum, m) => sum + parseFloat(m.total_expense || 0), 0),
        net_profit: data.reduce((sum, m) => sum + parseFloat(m.net_profit || 0), 0),
      };

      return {
        success: true,
        year,
        monthly_data: data,
        yearly_summary: yearlyTotal,
      };
    } catch (error) {
      this.logger.error(`Get monthly summary failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // =====================================================================
  // BALANCE SHEET (Yearly)
  // =====================================================================

  /**
   * Generate yearly balance sheet
   */
  async getYearlyBalanceSheet(year: number): Promise<any> {
    try {
      // Get all income for the year
      const { data: incomeData } = await supabase
        .from('income_transactions')
        .select('category_id, amount, income_categories(category_name)')
        .gte('transaction_date', `${year}-01-01`)
        .lte('transaction_date', `${year}-12-31`);

      // Get all expenses for the year
      const { data: expenseData } = await supabase
        .from('expense_transactions')
        .select('category_id, amount, expense_categories(category_name)')
        .gte('transaction_date', `${year}-01-01`)
        .lte('transaction_date', `${year}-12-31`);

      // Group by category
      const incomeByCategory = this.groupByCategory(incomeData);
      const expenseByCategory = this.groupByCategory(expenseData);

      const totalIncome = Object.values(incomeByCategory).reduce((sum: number, val: any) => sum + val.total, 0) as number;
      const totalExpense = Object.values(expenseByCategory).reduce((sum: number, val: any) => sum + val.total, 0) as number;
      const netProfit = totalIncome - totalExpense;
      const profitPercentage = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : '0';

      return {
        success: true,
        year,
        income: {
          categories: incomeByCategory,
          total: totalIncome,
        },
        expense: {
          categories: expenseByCategory,
          total: totalExpense,
        },
        net_profit: netProfit,
        profit_percentage: profitPercentage,
      };
    } catch (error) {
      this.logger.error(`Get balance sheet failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // =====================================================================
  // GST REPORTS
  // =====================================================================

  /**
   * Get GST report for a month
   */
  async getGSTReport(month: number, year: number): Promise<any> {
    try {
      // Income with GST
      const { data: gstIncome } = await supabase
        .from('income_transactions')
        .select('*')
        .eq('is_gst_applicable', true)
        .gte('transaction_date', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lte('transaction_date', `${year}-${month.toString().padStart(2, '0')}-31`);

      // Expenses with GST
      const { data: gstExpense } = await supabase
        .from('expense_transactions')
        .select('*')
        .eq('is_gst_applicable', true)
        .gte('transaction_date', `${year}-${month.toString().padStart(2, '0')}-01`)
        .lte('transaction_date', `${year}-${month.toString().padStart(2, '0')}-31`);

      const totalGSTCollected = gstIncome?.reduce((sum, t) => sum + parseFloat(t.gst_amount || 0), 0) || 0;
      const totalGSTPaid = gstExpense?.reduce((sum, t) => sum + parseFloat(t.gst_amount || 0), 0) || 0;

      return {
        success: true,
        month,
        year,
        gst_collected: totalGSTCollected,
        gst_paid: totalGSTPaid,
        gst_payable: totalGSTCollected - totalGSTPaid,
        income_transactions: gstIncome?.length || 0,
        expense_transactions: gstExpense?.length || 0,
      };
    } catch (error) {
      this.logger.error(`Get GST report failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // =====================================================================
  // DASHBOARD
  // =====================================================================

  /**
   * Get accounts dashboard summary
   */
  async getDashboard(): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().slice(0, 7);

      // Today's transactions
      const todayIncome = await this.getTodayTotal('income_transactions', today);
      const todayExpense = await this.getTodayTotal('expense_transactions', today);

      // This month's transactions
      const monthIncome = await this.getMonthTotal('income_transactions', thisMonth);
      const monthExpense = await this.getMonthTotal('expense_transactions', thisMonth);

      // Pending EMIs
      const { data: pendingEMIs } = await supabase
        .from('emi_payments')
        .select('*, loans(loan_number)')
        .eq('status', 'pending')
        .lte('due_date', today)
        .order('due_date', { ascending: true })
        .limit(5);

      // Pending salaries
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const { data: pendingSalaries } = await supabase
        .from('staff_salaries')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .eq('status', 'pending');

      return {
        success: true,
        today: {
          income: todayIncome,
          expense: todayExpense,
          profit: todayIncome - todayExpense,
        },
        this_month: {
          income: monthIncome,
          expense: monthExpense,
          profit: monthIncome - monthExpense,
        },
        pending_emis: pendingEMIs?.length || 0,
        pending_salaries: pendingSalaries?.length || 0,
        upcoming_payments: {
          emis: pendingEMIs || [],
          salaries: pendingSalaries || [],
        },
      };
    } catch (error) {
      this.logger.error(`Get dashboard failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  // =====================================================================
  // HELPER METHODS
  // =====================================================================

  private async getTodayTotal(table: string, date: string): Promise<number> {
    const { data } = await supabase
      .from(table)
      .select('amount')
      .eq('transaction_date', date);

    return data?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
  }

  private async getMonthTotal(table: string, month: string): Promise<number> {
    const { data } = await supabase
      .from(table)
      .select('amount')
      .gte('transaction_date', `${month}-01`)
      .lte('transaction_date', `${month}-31`);

    return data?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
  }

  private groupByCategory(data: any[]): any {
    const grouped = {};
    data?.forEach(item => {
      const categoryName = item.income_categories?.category_name || item.expense_categories?.category_name || 'Other';
      if (!grouped[categoryName]) {
        grouped[categoryName] = { total: 0, count: 0 };
      }
      grouped[categoryName].total += parseFloat(item.amount);
      grouped[categoryName].count += 1;
    });
    return grouped;
  }
}
