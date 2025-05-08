import * as investmentsModel from '../models/investments';

// Sample investment data
const sampleInvestments = [
  // Stocks
  {
    name: 'Apple Inc.',
    type: 'stock',
    amount: 10,
    purchase_price: 150.75,
    current_price: 191.24,
    purchase_date: '2022-01-15',
    symbol: 'AAPL',
    notes: 'Long-term hold for tech exposure'
  },
  {
    name: 'Microsoft Corporation',
    type: 'stock',
    amount: 5,
    purchase_price: 280.50,
    current_price: 330.15,
    purchase_date: '2022-02-20',
    symbol: 'MSFT',
    notes: 'Cloud computing and AI growth'
  },
  {
    name: 'Tesla Inc.',
    type: 'stock',
    amount: 4,
    purchase_price: 650.00,
    current_price: 245.60,
    purchase_date: '2021-11-10',
    symbol: 'TSLA',
    notes: 'EV market leader'
  },
  {
    name: 'Amazon.com Inc.',
    type: 'stock',
    amount: 2,
    purchase_price: 3100.50,
    current_price: 175.35,
    purchase_date: '2022-03-05',
    symbol: 'AMZN',
    notes: 'E-commerce and cloud services'
  },
  
  // Cryptocurrencies
  {
    name: 'Bitcoin',
    type: 'crypto',
    amount: 0.5,
    purchase_price: 32000.00,
    current_price: 64250.75,
    purchase_date: '2021-07-20',
    symbol: 'BTC',
    notes: 'Holding as digital gold'
  },
  {
    name: 'Ethereum',
    type: 'crypto',
    amount: 4.0,
    purchase_price: 1800.00,
    current_price: 3450.25,
    purchase_date: '2021-08-15',
    symbol: 'ETH',
    notes: 'Smart contract platform investment'
  },
  {
    name: 'Cardano',
    type: 'crypto',
    amount: 1000,
    purchase_price: 1.20,
    current_price: 0.45,
    purchase_date: '2021-09-10',
    symbol: 'ADA',
    notes: 'Proof-of-stake blockchain platform'
  },
  
  // Gold and precious metals
  {
    name: 'Gold Bullion',
    type: 'gold',
    amount: 2,
    purchase_price: 1750.00,
    current_price: 2032.50,
    purchase_date: '2020-05-15',
    symbol: 'XAU',
    notes: 'Physical gold in oz for inflation hedge'
  },
  {
    name: 'Silver Coins',
    type: 'gold',
    amount: 50,
    purchase_price: 22.80,
    current_price: 28.45,
    purchase_date: '2020-06-20',
    symbol: 'XAG',
    notes: 'American Silver Eagles collection'
  },
  
  // ETFs
  {
    name: 'Vanguard S&P 500 ETF',
    type: 'etf',
    amount: 15,
    purchase_price: 350.25,
    current_price: 432.15,
    purchase_date: '2021-01-10',
    symbol: 'VOO',
    notes: 'Core U.S. market exposure'
  },
  {
    name: 'iShares MSCI Emerging Markets ETF',
    type: 'etf',
    amount: 30,
    purchase_price: 42.50,
    current_price: 40.25,
    purchase_date: '2021-02-15',
    symbol: 'EEM',
    notes: 'Emerging markets diversification'
  },
  
  // Real Estate
  {
    name: 'Rental Property - 123 Main St',
    type: 'real_estate',
    amount: 1,
    purchase_price: 250000.00,
    current_price: 320000.00,
    purchase_date: '2018-05-20',
    notes: 'Single family home, rented at $1,800/month'
  },
  
  // Bonds
  {
    name: 'U.S. Treasury Bond',
    type: 'bond',
    amount: 10000,
    purchase_price: 0.98,
    current_price: 1.00,
    purchase_date: '2022-01-05',
    symbol: 'USTB',
    notes: '10-year Treasury, 4.5% yield'
  },
  
  // Mutual Funds
  {
    name: 'Fidelity Growth Fund',
    type: 'mutual_fund',
    amount: 100,
    purchase_price: 45.75,
    current_price: 52.30,
    purchase_date: '2021-04-15',
    symbol: 'FDGRX',
    notes: 'Large-cap growth focus'
  }
];

// Sample investment history (for Bitcoin price history)
const sampleInvestmentHistory = [
  { investment_id: 5, price: 32000.00, date: '2021-07-20' },
  { investment_id: 5, price: 38500.00, date: '2021-09-01' },
  { investment_id: 5, price: 42000.00, date: '2021-11-15' },
  { investment_id: 5, price: 35600.00, date: '2022-01-22' },
  { investment_id: 5, price: 29800.00, date: '2022-05-10' },
  { investment_id: 5, price: 19450.00, date: '2022-07-03' },
  { investment_id: 5, price: 23700.00, date: '2022-11-28' },
  { investment_id: 5, price: 28900.00, date: '2023-03-15' },
  { investment_id: 5, price: 42800.00, date: '2023-07-20' },
  { investment_id: 5, price: 64250.75, date: '2024-04-01' }
];

// Sample asset allocation
const sampleAssetAllocation = {
  stocks_percentage: 45,
  crypto_percentage: 20,
  gold_percentage: 10,
  bonds_percentage: 10,
  real_estate_percentage: 10,
  cash_percentage: 5,
  other_percentage: 0,
  target_date: '2024-12-31'
};

// Seed investments data
export const seedInvestments = async (): Promise<void> => {
  console.log('Starting to seed investments data...');
  
  try {
    // First, create the investment tables if they don't exist
    await investmentsModel.createInvestmentTables();
    
    // Add sample investments
    for (const investment of sampleInvestments) {
      await investmentsModel.createInvestment(investment as investmentsModel.Investment);
      console.log(`Added investment: ${investment.name}`);
    }
    
    // Add sample investment history for Bitcoin
    for (const history of sampleInvestmentHistory) {
      await investmentsModel.addInvestmentHistory(history as investmentsModel.InvestmentHistory);
    }
    console.log('Added investment history for Bitcoin');
    
    // Add sample asset allocation
    await investmentsModel.updateAssetAllocation(sampleAssetAllocation as investmentsModel.AssetAllocation);
    console.log('Added sample asset allocation');
    
    console.log('Successfully seeded investments data');
  } catch (error) {
    console.error('Error seeding investments data:', error);
    throw error;
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedInvestments()
    .then(() => {
      console.log('Investments seed completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error during investments seed:', error);
      process.exit(1);
    });
} 