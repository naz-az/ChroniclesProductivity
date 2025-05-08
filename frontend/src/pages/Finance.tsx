import React, { useState, useEffect, CSSProperties } from 'react';

// Types for finance data
interface Transaction {
  id: number;
  amount: number;
  description: string;
  category: string;
  transaction_type: 'income' | 'expense';
  date: string;
  recurring?: boolean;
}

interface Bill {
  id: number;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  is_paid: boolean;
  recurring?: boolean;
  recurrence_interval?: string;
}

interface Budget {
  id: number;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
}

interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
}

// Custom ProgressBar component
const ProgressBar: React.FC<{ value: number, isOverBudget?: boolean, className?: string }> = ({ value, isOverBudget, className }) => {
  const theme = useFinanceTheme();

  const progressBarContainerStyle: CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '4px',
    marginTop: '15px',
    overflow: 'hidden',
  };
  
  const progressBarStyle: CSSProperties = {
    width: `${Math.min(value, 100)}%`,
    height: '100%',
    backgroundColor: isOverBudget ? theme.errorText : theme.primary,
    borderRadius: '4px',
    transition: 'width 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
    boxShadow: `0 0 10px ${isOverBudget ? theme.errorText : theme.primary}90`,
  };

  return (
    <div style={progressBarContainerStyle} className={className}>
      <div style={progressBarStyle}></div>
    </div>
  );
};

// Tab Panel component
function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`finance-tabpanel-${index}`}
      aria-labelledby={`finance-tab-${index}`}
      {...other}
    >
      {value === index && <div style={{ padding: '20px' }}>{children}</div>}
    </div>
  );
}

// Theme hook
const useFinanceTheme = () => {
  return {
    bg: '#121212',
    bgLight: '#1E1E1E',
    cardBg: 'rgba(30, 30, 30, 0.85)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    glassShine: 'rgba(255, 255, 255, 0.05)',
    primary: '#BB86FC',
    primaryVariant: '#3700B3',
    secondary: '#03DAC6',
    text: '#E0E0E0',
    textSecondary: '#A0A0A0',
    textHighlight: '#FFFFFF',
    errorText: '#CF6679',
    success: '#66BB6A',
    pending: '#FFA726',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    borderRadius: '16px',
    borderRadiusSm: '10px',
    shadow: '0 8px 24px rgba(0,0,0,0.5)',
    shadowSm: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };
};

// Main Finance component
const Finance: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState({
    transactions: true,
    bills: true,
    budgets: true,
    savingsGoals: true,
  });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const theme = useFinanceTheme();

  // Handle tab change
  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  // Fetch data from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/finance/transactions');
        const data = await response.json();
        setTransactions(data);
        setLoading(prev => ({ ...prev, transactions: false }));
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(prev => ({ ...prev, transactions: false }));
      }
    };

    const fetchBills = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/finance/bills');
        const data = await response.json();
        setBills(data);
        setLoading(prev => ({ ...prev, bills: false }));
      } catch (error) {
        console.error('Error fetching bills:', error);
        setLoading(prev => ({ ...prev, bills: false }));
      }
    };

    const fetchBudgets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/finance/budgets');
        const data = await response.json();
        setBudgets(data);
        setLoading(prev => ({ ...prev, budgets: false }));
      } catch (error) {
        console.error('Error fetching budgets:', error);
        setLoading(prev => ({ ...prev, budgets: false }));
      }
    };

    const fetchSavingsGoals = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/finance/savings-goals');
        const data = await response.json();
        setSavingsGoals(data);
        setLoading(prev => ({ ...prev, savingsGoals: false }));
      } catch (error) {
        console.error('Error fetching savings goals:', error);
        setLoading(prev => ({ ...prev, savingsGoals: false }));
      }
    };

    fetchTransactions();
    fetchBills();
    fetchBudgets();
    fetchSavingsGoals();
  }, []);

  // Style definitions
  const pageStyle: CSSProperties = {
    background: theme.bg,
    color: theme.text,
    fontFamily: theme.fontFamily,
    padding: '30px 40px',
    minHeight: '100vh',
    transition: theme.transition,
  };

  const headerContainerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: `1px solid ${theme.cardBorder}`,
  };

  const mainTitleStyle: CSSProperties = {
    margin: 0,
    fontSize: '2.8rem',
    fontWeight: 700,
    background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: `0 0 15px ${theme.primary}30`,
  };

  const tabContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '8px',
    background: theme.bgLight,
    padding: '6px',
    borderRadius: theme.borderRadiusSm,
    boxShadow: `inset 0 1px 3px rgba(0,0,0,0.3), ${theme.shadowSm}`,
  };

  const tabButtonStyle = (isActive: boolean): CSSProperties => ({
    background: isActive ? theme.primary : 'transparent',
    color: isActive ? '#FFFFFF' : theme.textSecondary,
    fontWeight: isActive ? 600 : 500,
    boxShadow: isActive ? `0 2px 8px ${theme.primary}50` : 'none',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: theme.transition,
    outline: 'none',
    letterSpacing: '0.5px',
  });

  const sectionStyle: CSSProperties = {
    background: theme.cardBg,
    color: theme.text,
    padding: '30px',
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: theme.shadow,
    marginBottom: '30px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const cardStyle = (id: string): CSSProperties => ({
    background: theme.cardBg,
    color: theme.text,
    padding: '25px',
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: hoveredCard === id ? `0 12px 28px rgba(0,0,0,0.6)` : theme.shadow,
    position: 'relative',
    overflow: 'hidden',
    transition: theme.transition,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transform: hoveredCard === id ? 'translateY(-5px)' : 'none',
    borderColor: hoveredCard === id ? theme.primary : theme.cardBorder,
  });

  const gridContainerStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '25px',
    marginBottom: '30px',
  };

  const sectionHeaderStyle: CSSProperties = {
    margin: '0 0 20px 0',
    fontSize: '1.6rem',
    fontWeight: 600,
    color: theme.text,
  };

  const itemTitleStyle: CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 600,
    margin: '0 0 8px 0',
    color: theme.text,
  };

  const itemSubtitleStyle: CSSProperties = {
    fontSize: '0.9rem',
    color: theme.textSecondary,
    margin: '0 0 4px 0',
  };

  const flexBetweenStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  };

  const badgeStyle = (type: string): CSSProperties => {
    const colors = {
      income: theme.success,
      expense: theme.errorText,
      primary: theme.primary,
      success: theme.success,
      warning: theme.pending,
      error: theme.errorText,
    };
    const color = colors[type as keyof typeof colors] || theme.primary;
    
    return {
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '0.8rem',
      color: 'white',
      backgroundColor: color,
      fontWeight: 500,
    };
  };

  const headerButtonStyle: CSSProperties = {
    background: theme.primary,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: theme.transition,
    boxShadow: `0 2px 8px ${theme.primary}50`,
  };

  const listItemStyle: CSSProperties = {
    padding: '16px',
    marginBottom: '16px',
    borderRadius: theme.borderRadiusSm,
    background: theme.bgLight,
    border: `1px solid ${theme.cardBorder}`,
    transition: theme.transition,
  };

  const loadingTextStyle: CSSProperties = {
    padding: '20px',
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: '1rem',
  };

  const emptyStateStyle: CSSProperties = {
    padding: '30px',
    textAlign: 'center',
    color: theme.textSecondary,
    fontSize: '1rem',
    background: `${theme.bgLight}80`,
    borderRadius: theme.borderRadiusSm,
    border: `1px dashed ${theme.cardBorder}`,
  };

  // Transactions Tab
  const TransactionsTab = () => (
    <div>
      <div style={flexBetweenStyle}>
        <h2 style={sectionHeaderStyle}>Transactions</h2>
        <button style={headerButtonStyle} onClick={() => console.log('Add new transaction')}>
          <span style={{ marginRight: '8px' }}>+</span>
          Add Transaction
        </button>
      </div>

      {loading.transactions ? (
        <p style={loadingTextStyle}>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <div style={emptyStateStyle}>No transactions found. Add your first transaction!</div>
      ) : (
        <div>
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              style={listItemStyle}
              onMouseEnter={() => setHoveredCard(`transaction-${transaction.id}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={itemTitleStyle}>{transaction.description}</h3>
                  <p style={itemSubtitleStyle}>{transaction.category}</p>
                  <p style={itemSubtitleStyle}>{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ 
                    ...itemTitleStyle, 
                    color: transaction.transaction_type === 'income' ? theme.success : theme.errorText 
                  }}>
                    {transaction.transaction_type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </h3>
                  {transaction.recurring && (
                    <span style={badgeStyle('primary')}>
                      Recurring
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Bills Tab
  const BillsTab = () => (
    <div>
      <div style={flexBetweenStyle}>
        <h2 style={sectionHeaderStyle}>Bills</h2>
        <button style={headerButtonStyle} onClick={() => console.log('Add new bill')}>
          <span style={{ marginRight: '8px' }}>+</span>
          Add Bill
        </button>
      </div>

      {loading.bills ? (
        <p style={loadingTextStyle}>Loading bills...</p>
      ) : bills.length === 0 ? (
        <div style={emptyStateStyle}>No bills found. Add your first bill!</div>
      ) : (
        <div>
          {bills.map((bill) => (
            <div 
              key={bill.id} 
              style={listItemStyle}
              onMouseEnter={() => setHoveredCard(`bill-${bill.id}`)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={itemTitleStyle}>{bill.name}</h3>
                  <p style={itemSubtitleStyle}>{bill.category}</p>
                  <p style={itemSubtitleStyle}>Due: {new Date(bill.due_date).toLocaleDateString()}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h3 style={itemTitleStyle}>${bill.amount.toFixed(2)}</h3>
                  <span style={badgeStyle(bill.is_paid ? 'success' : 'warning')}>
                    {bill.is_paid ? 'Paid' : 'Unpaid'}
                  </span>
                  {bill.recurring && (
                    <span style={{ 
                      ...badgeStyle('primary'), 
                      marginLeft: '8px' 
                    }}>
                      {bill.recurrence_interval}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Budgets Tab
  const BudgetsTab = () => (
    <div>
      <div style={flexBetweenStyle}>
        <h2 style={sectionHeaderStyle}>Budgets</h2>
        <button style={headerButtonStyle} onClick={() => console.log('Add new budget')}>
          <span style={{ marginRight: '8px' }}>+</span>
          Add Budget
        </button>
      </div>

      {loading.budgets ? (
        <p style={loadingTextStyle}>Loading budgets...</p>
      ) : budgets.length === 0 ? (
        <div style={emptyStateStyle}>No budgets found. Add your first budget!</div>
      ) : (
        <div>
          {budgets.map((budget) => {
            const percentage = (budget.spent_amount / budget.allocated_amount) * 100;
            const isOverBudget = percentage > 100;

            return (
              <div 
                key={budget.id} 
                style={listItemStyle}
                onMouseEnter={() => setHoveredCard(`budget-${budget.id}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <h3 style={itemTitleStyle}>{budget.category}</h3>
                <div style={flexBetweenStyle}>
                  <p style={itemSubtitleStyle}>
                    {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                  </p>
                  <p style={{ 
                    ...itemSubtitleStyle, 
                    color: isOverBudget ? theme.errorText : theme.textSecondary 
                  }}>
                    ${budget.spent_amount.toFixed(2)} / ${budget.allocated_amount.toFixed(2)}
                  </p>
                </div>
                <ProgressBar value={percentage} isOverBudget={isOverBudget} />
                {isOverBudget && (
                  <p style={{ 
                    color: theme.errorText, 
                    fontSize: '0.8rem', 
                    marginTop: '8px' 
                  }}>
                    Over budget by ${(budget.spent_amount - budget.allocated_amount).toFixed(2)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Savings Goals Tab
  const SavingsGoalsTab = () => (
    <div>
      <div style={flexBetweenStyle}>
        <h2 style={sectionHeaderStyle}>Savings Goals</h2>
        <button style={headerButtonStyle} onClick={() => console.log('Add new savings goal')}>
          <span style={{ marginRight: '8px' }}>+</span>
          Add Goal
        </button>
      </div>

      {loading.savingsGoals ? (
        <p style={loadingTextStyle}>Loading savings goals...</p>
      ) : savingsGoals.length === 0 ? (
        <div style={emptyStateStyle}>No savings goals found. Add your first goal!</div>
      ) : (
        <div style={gridContainerStyle}>
          {savingsGoals.map((goal) => {
            const percentage = (goal.current_amount / goal.target_amount) * 100;
            const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div 
                key={goal.id}
                style={cardStyle(`goal-${goal.id}`)}
                onMouseEnter={() => setHoveredCard(`goal-${goal.id}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <h3 style={itemTitleStyle}>{goal.name}</h3>
                <div style={flexBetweenStyle}>
                  <p style={itemSubtitleStyle}>
                    Target: ${goal.target_amount.toFixed(2)}
                  </p>
                  <p style={{ ...itemSubtitleStyle, color: theme.primary }}>
                    Saved: ${goal.current_amount.toFixed(2)}
                  </p>
                </div>
                <ProgressBar value={percentage} />
                <div style={{ 
                  ...flexBetweenStyle, 
                  marginTop: '10px' 
                }}>
                  <p style={itemSubtitleStyle}>
                    {percentage.toFixed(0)}% complete
                  </p>
                  <p style={{ 
                    ...itemSubtitleStyle, 
                    color: daysLeft < 30 ? theme.pending : theme.textSecondary 
                  }}>
                    {daysLeft > 0 ? `${daysLeft} days left` : 'Past due date'}
                  </p>
                </div>
                <p style={{ ...itemSubtitleStyle, marginTop: '8px' }}>
                  Target Date: {new Date(goal.target_date).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={pageStyle} className="animate-fadeIn">
      <div style={headerContainerStyle}>
        <h1 style={mainTitleStyle}>Personal Finance</h1>
        
        <div style={tabContainerStyle}>
          <button 
            style={tabButtonStyle(tabValue === 0)} 
            onClick={() => handleTabChange(0)}
          >
            Transactions
          </button>
          <button 
            style={tabButtonStyle(tabValue === 1)} 
            onClick={() => handleTabChange(1)}
          >
            Bills
          </button>
          <button 
            style={tabButtonStyle(tabValue === 2)} 
            onClick={() => handleTabChange(2)}
          >
            Budgets
          </button>
          <button 
            style={tabButtonStyle(tabValue === 3)} 
            onClick={() => handleTabChange(3)}
          >
            Savings Goals
          </button>
        </div>
      </div>
      
      <div style={sectionStyle}>
        <TabPanel value={tabValue} index={0}>
          <TransactionsTab />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <BillsTab />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <BudgetsTab />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <SavingsGoalsTab />
        </TabPanel>
      </div>

      <style>
        {`
          @keyframes animate-fadeIn { 
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
             animation: animate-fadeIn 0.6s ease-out forwards;
          }
          
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background: ${theme.bgLight};
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb {
            background: ${theme.primary}90;
            border-radius: 10px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: ${theme.primary};
          }
        `}
      </style>
    </div>
  );
};

export default Finance; 