import { 
  createFinanceTables, 
  createTransaction, 
  createBill, 
  createBudget, 
  createSavingsGoal,
  Transaction,
  Bill,
  Budget,
  SavingsGoal
} from '../models/finance';

const seedFinanceData = async () => {
  console.log('Creating finance tables...');
  await createFinanceTables();
  
  console.log('Seeding finance transactions...');
  const transactions: Transaction[] = [
    {
      amount: 2500.00,
      description: 'Monthly Salary',
      category: 'Income',
      transaction_type: 'income',
      date: '2023-10-25',
      recurring: true
    },
    {
      amount: 150.00,
      description: 'Freelance Project',
      category: 'Income',
      transaction_type: 'income',
      date: '2023-10-15',
      recurring: false
    },
    {
      amount: 85.40,
      description: 'Grocery Shopping',
      category: 'Food',
      transaction_type: 'expense',
      date: '2023-10-22',
      recurring: false
    },
    {
      amount: 45.99,
      description: 'Internet Bill',
      category: 'Utilities',
      transaction_type: 'expense',
      date: '2023-10-18',
      recurring: true
    },
    {
      amount: 1200.00,
      description: 'Rent Payment',
      category: 'Housing',
      transaction_type: 'expense',
      date: '2023-10-01',
      recurring: true
    },
    {
      amount: 29.99,
      description: 'Streaming Service',
      category: 'Entertainment',
      transaction_type: 'expense',
      date: '2023-10-10',
      recurring: true
    },
    {
      amount: 120.00,
      description: 'Dinner with Friends',
      category: 'Food',
      transaction_type: 'expense',
      date: '2023-10-14',
      recurring: false
    },
    {
      amount: 2500.00,
      description: 'Monthly Salary',
      category: 'Income',
      transaction_type: 'income',
      date: '2023-11-25',
      recurring: true
    },
    {
      amount: 200.00,
      description: 'Side Project Payment',
      category: 'Income',
      transaction_type: 'income',
      date: '2023-11-10',
      recurring: false
    },
    {
      amount: 67.50,
      description: 'Gas Bill',
      category: 'Utilities',
      transaction_type: 'expense',
      date: '2023-11-05',
      recurring: true
    }
  ];

  for (const transaction of transactions) {
    await createTransaction(transaction);
  }

  console.log('Seeding bills...');
  const bills: Bill[] = [
    {
      name: 'Rent',
      amount: 1200.00,
      due_date: '2023-12-01',
      category: 'Housing',
      is_paid: false,
      recurring: true,
      recurrence_interval: 'monthly'
    },
    {
      name: 'Electricity Bill',
      amount: 78.35,
      due_date: '2023-11-15',
      category: 'Utilities',
      is_paid: false,
      recurring: true,
      recurrence_interval: 'monthly'
    },
    {
      name: 'Internet',
      amount: 45.99,
      due_date: '2023-11-18',
      category: 'Utilities',
      is_paid: false,
      recurring: true,
      recurrence_interval: 'monthly'
    },
    {
      name: 'Phone Bill',
      amount: 55.00,
      due_date: '2023-11-20',
      category: 'Utilities',
      is_paid: false,
      recurring: true,
      recurrence_interval: 'monthly'
    },
    {
      name: 'Car Insurance',
      amount: 120.00,
      due_date: '2023-12-05',
      category: 'Insurance',
      is_paid: false,
      recurring: true,
      recurrence_interval: 'monthly'
    },
    {
      name: 'Streaming Services',
      amount: 29.99,
      due_date: '2023-11-10',
      category: 'Entertainment',
      is_paid: true,
      recurring: true,
      recurrence_interval: 'monthly'
    }
  ];

  for (const bill of bills) {
    await createBill(bill);
  }

  console.log('Seeding budgets...');
  const budgets: Budget[] = [
    {
      category: 'Food',
      allocated_amount: 400.00,
      spent_amount: 205.40,
      start_date: '2023-11-01',
      end_date: '2023-11-30'
    },
    {
      category: 'Entertainment',
      allocated_amount: 150.00,
      spent_amount: 29.99,
      start_date: '2023-11-01',
      end_date: '2023-11-30'
    },
    {
      category: 'Housing',
      allocated_amount: 1300.00,
      spent_amount: 1200.00,
      start_date: '2023-11-01',
      end_date: '2023-11-30'
    },
    {
      category: 'Utilities',
      allocated_amount: 200.00,
      spent_amount: 113.49,
      start_date: '2023-11-01',
      end_date: '2023-11-30'
    },
    {
      category: 'Transportation',
      allocated_amount: 250.00,
      spent_amount: 120.00,
      start_date: '2023-11-01',
      end_date: '2023-11-30'
    },
    {
      category: 'Shopping',
      allocated_amount: 300.00,
      spent_amount: 143.75,
      start_date: '2023-11-01',
      end_date: '2023-11-30'
    }
  ];

  for (const budget of budgets) {
    await createBudget(budget);
  }

  console.log('Seeding savings goals...');
  const savingsGoals: SavingsGoal[] = [
    {
      name: 'Emergency Fund',
      target_amount: 10000.00,
      current_amount: 4500.00,
      target_date: '2024-06-30'
    },
    {
      name: 'New Laptop',
      target_amount: 1500.00,
      current_amount: 750.00,
      target_date: '2024-01-31'
    },
    {
      name: 'Summer Vacation',
      target_amount: 3000.00,
      current_amount: 1200.00,
      target_date: '2024-07-15'
    },
    {
      name: 'Car Down Payment',
      target_amount: 5000.00,
      current_amount: 1750.00,
      target_date: '2024-08-01'
    }
  ];

  for (const goal of savingsGoals) {
    await createSavingsGoal(goal);
  }

  console.log('Finance data seeded successfully!');
};

// Execute the seed function if this file is run directly
if (require.main === module) {
  seedFinanceData()
    .then(() => {
      console.log('Finished seeding finance data');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding finance data:', error);
      process.exit(1);
    });
}

export default seedFinanceData; 