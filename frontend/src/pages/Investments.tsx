import React, { useState, useEffect, useMemo, memo } from 'react';
import type { CSSProperties } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement
);

// Types for investment data
interface Investment {
  id: number;
  name: string;
  type: 'stock' | 'crypto' | 'gold' | 'bond' | 'real_estate' | 'etf' | 'mutual_fund' | 'other';
  amount: number;
  purchase_price: number;
  current_price: number;
  purchase_date: string;
  symbol?: string;
  notes?: string;
}

interface InvestmentHistory {
  id: number;
  investment_id: number;
  price: number;
  date: string;
}

interface AssetAllocation {
  id: number;
  stocks_percentage: number;
  crypto_percentage: number;
  gold_percentage: number;
  bonds_percentage: number;
  real_estate_percentage: number;
  cash_percentage: number;
  other_percentage: number;
  target_date: string;
}

interface ProfitLossAnalysis {
  id: number;
  name: string;
  type: string;
  symbol?: string;
  amount: number;
  purchase_price: number;
  current_price: number;
  purchase_date: string;
  price_change: number;
  percent_change: number;
  total_profit_loss: number;
}

interface InvestmentsByType {
  type: string;
  total_value: number;
  count: number;
}

// Theme hook
const useInvestmentsTheme = () => {
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
    warning: '#FFA726',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    borderRadius: '16px',
    borderRadiusSm: '10px',
    shadow: '0 8px 24px rgba(0,0,0,0.5)',
    shadowSm: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  };
};

// Colors for investment types
const typeColors = {
  stock: '#4CAF50',      // Green
  crypto: '#FF9800',     // Orange
  gold: '#FFD700',       // Gold
  bond: '#2196F3',       // Blue
  real_estate: '#9C27B0', // Purple
  etf: '#00BCD4',        // Cyan
  mutual_fund: '#3F51B5', // Indigo
  other: '#607D8B',      // Blue Grey
  cash: '#78909C'        // Light Blue Grey
};

// Create a StatCard Component
interface StatCardProps {
  id: string;
  title: string;
  value: React.ReactNode;
  description: React.ReactNode;
  theme: ReturnType<typeof useInvestmentsTheme>;
}

// Create a memoized StatCard component that won't re-render when parent renders
const StatCard = memo(({ id, title, value, description, theme }: StatCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const statCardStyle: CSSProperties = {
    background: theme.cardBg,
    color: theme.text,
    padding: '20px',
    borderRadius: theme.borderRadiusSm,
    border: `1px solid ${isHovered ? theme.primary : theme.cardBorder}`,
    boxShadow: isHovered ? `0 10px 30px rgba(0,0,0,0.4), 0 0 10px ${theme.primary}30` : theme.shadowSm,
    transition: theme.transition,
    position: 'relative',
    overflow: 'hidden',
    transform: isHovered ? 'translateY(-5px)' : 'none',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const statCardTitleStyle: CSSProperties = {
    fontSize: '1rem',
    fontWeight: 500,
    color: theme.textSecondary,
    marginTop: 0,
    marginBottom: '5px',
  };

  const statCardValueStyle: CSSProperties = {
    fontSize: '1.8rem',
    fontWeight: 700,
    marginTop: 0,
    marginBottom: '5px',
  };

  const statCardDescStyle: CSSProperties = {
    fontSize: '0.9rem',
    color: theme.textSecondary,
    margin: 0,
  };

  return (
    <div 
      style={statCardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 style={statCardTitleStyle}>{title}</h3>
      <p style={statCardValueStyle}>{value}</p>
      <p style={statCardDescStyle}>{description}</p>
    </div>
  );
});

StatCard.displayName = 'StatCard';

// Create chart components that are completely isolated from stat cards
const AllocationChart = memo(({ 
  data, 
  options, 
  theme 
}: { 
  data: any; 
  options: any; 
  theme: ReturnType<typeof useInvestmentsTheme> 
}) => {
  const sectionStyle: CSSProperties = {
    background: theme.cardBg,
    color: theme.text,
    padding: '25px',
    borderRadius: theme.borderRadius,
    marginBottom: '30px',
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: theme.shadow,
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1,
  };

  const sectionTitleHighlightStyle: CSSProperties = {
    color: theme.primary,
  };

  const chartContainerStyle: CSSProperties = {
    position: 'relative',
    height: '300px',
    marginTop: '20px',
  };

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Asset <span style={sectionTitleHighlightStyle}>Allocation</span></h2>
      <div style={chartContainerStyle}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
});

const InvestmentTypeChart = memo(({ 
  data, 
  options, 
  theme 
}: { 
  data: any; 
  options: any; 
  theme: ReturnType<typeof useInvestmentsTheme> 
}) => {
  const sectionStyle: CSSProperties = {
    background: theme.cardBg,
    color: theme.text,
    padding: '25px',
    borderRadius: theme.borderRadius,
    marginBottom: '30px',
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: theme.shadow,
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1,
  };

  const sectionTitleHighlightStyle: CSSProperties = {
    color: theme.primary,
  };

  const chartContainerStyle: CSSProperties = {
    position: 'relative',
    height: '300px',
    marginTop: '20px',
  };

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Investments by <span style={sectionTitleHighlightStyle}>Type</span></h2>
      <div style={chartContainerStyle}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
});

const BitcoinHistoryChart = memo(({ 
  data, 
  options, 
  theme 
}: { 
  data: any; 
  options: any; 
  theme: ReturnType<typeof useInvestmentsTheme> 
}) => {
  const sectionStyle: CSSProperties = {
    background: theme.cardBg,
    color: theme.text,
    padding: '25px',
    borderRadius: theme.borderRadius,
    marginBottom: '30px',
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: theme.shadow,
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1,
  };

  const sectionTitleHighlightStyle: CSSProperties = {
    color: theme.primary,
  };

  const chartContainerStyle: CSSProperties = {
    position: 'relative',
    height: '300px',
    marginTop: '20px',
  };

  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Bitcoin <span style={sectionTitleHighlightStyle}>Price History</span></h2>
      <div style={chartContainerStyle}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
});

// Add display names
AllocationChart.displayName = 'AllocationChart';
InvestmentTypeChart.displayName = 'InvestmentTypeChart';
BitcoinHistoryChart.displayName = 'BitcoinHistoryChart';

// Main Investments component
const Investments: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [bitcoinHistory, setBitcoinHistory] = useState<InvestmentHistory[]>([]);
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation | null>(null);
  const [profitLossAnalysis, setProfitLossAnalysis] = useState<ProfitLossAnalysis[]>([]);
  const [investmentsByType, setInvestmentsByType] = useState<InvestmentsByType[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [loading, setLoading] = useState({
    investments: true,
    history: true,
    allocation: true,
    analytics: true,
  });
  
  const theme = useInvestmentsTheme();

  // Handle tab change
  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  // Create formatter functions that don't change between renders
  const formatCurrencyFn = useMemo(() => (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }, []);

  const formatPercentageFn = useMemo(() => (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  }, []);

  const formatDateFn = useMemo(() => (dateStr: string): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }, []);

  const formatShortDateFn = useMemo(() => (dateStr: string): string => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  }, []);

  const capitalizeTypeFn = useMemo(() => (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }, []);

  // Calculate the average return - moved from PortfolioTab to prevent re-calculation
  const avgReturn = useMemo(() => {
    if (profitLossAnalysis.length === 0) return '0%';
    return formatPercentageFn(
      profitLossAnalysis.reduce((sum, item) => sum + item.percent_change, 0) / 
      profitLossAnalysis.length
    );
  }, [profitLossAnalysis, formatPercentageFn]);

  // Fetch data from API
  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/investments/investments');
        const data = await response.json();
        setInvestments(data);
        setLoading(prev => ({ ...prev, investments: false }));
      } catch (error) {
        console.error('Error fetching investments:', error);
        setLoading(prev => ({ ...prev, investments: false }));
      }
    };

    const fetchBitcoinHistory = async () => {
      try {
        // Assuming Bitcoin has ID 5 from the seed data
        const response = await fetch('http://localhost:5000/api/investments/investments/5/history');
        const data = await response.json();
        setBitcoinHistory(data);
        setLoading(prev => ({ ...prev, history: false }));
      } catch (error) {
        console.error('Error fetching Bitcoin history:', error);
        setLoading(prev => ({ ...prev, history: false }));
      }
    };

    const fetchAssetAllocation = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/investments/asset-allocation');
        const data = await response.json();
        setAssetAllocation(data);
        setLoading(prev => ({ ...prev, allocation: false }));
      } catch (error) {
        console.error('Error fetching asset allocation:', error);
        setLoading(prev => ({ ...prev, allocation: false }));
      }
    };

    const fetchAnalytics = async () => {
      try {
        // Fetch total value
        const totalResponse = await fetch('http://localhost:5000/api/investments/analytics/total-value');
        const totalData = await totalResponse.json();
        setTotalValue(totalData.totalValue);

        // Fetch investments by type
        const byTypeResponse = await fetch('http://localhost:5000/api/investments/analytics/by-type');
        const byTypeData = await byTypeResponse.json();
        setInvestmentsByType(byTypeData);

        // Fetch profit/loss analysis
        const profitLossResponse = await fetch('http://localhost:5000/api/investments/analytics/profit-loss');
        const profitLossData = await profitLossResponse.json();
        setProfitLossAnalysis(profitLossData);

        setLoading(prev => ({ ...prev, analytics: false }));
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(prev => ({ ...prev, analytics: false }));
      }
    };

    fetchInvestments();
    fetchBitcoinHistory();
    fetchAssetAllocation();
    fetchAnalytics();
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
    padding: '25px',
    borderRadius: theme.borderRadius,
    marginBottom: '30px',
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: theme.shadow,
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginTop: 0,
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1,
  };

  const sectionTitleHighlightStyle: CSSProperties = {
    color: theme.primary,
  };

  const statsGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  };

  const tableContainerStyle: CSSProperties = {
    overflow: 'auto',
    maxHeight: '400px',
    borderRadius: theme.borderRadiusSm,
    border: `1px solid ${theme.cardBorder}`,
  };

  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    color: theme.text,
  };

  const tableHeaderStyle: CSSProperties = {
    background: theme.bgLight,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  };

  const tableHeaderCellStyle: CSSProperties = {
    padding: '12px 15px',
    fontWeight: 600,
    borderBottom: `1px solid ${theme.cardBorder}`,
    fontSize: '0.9rem',
    color: theme.textSecondary,
  };

  const tableCellStyle: CSSProperties = {
    padding: '12px 15px',
    borderBottom: `1px solid ${theme.cardBorder}`,
    fontSize: '0.9rem',
  };

  const tagStyle = (type: string): CSSProperties => {
    const tagColor = typeColors[type as keyof typeof typeColors] || theme.primary;
    
    return {
      backgroundColor: `${tagColor}20`,
      color: tagColor,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.8rem',
      fontWeight: 500,
      display: 'inline-block',
    };
  };

  const profitStyle = (value: number): CSSProperties => ({
    color: value >= 0 ? theme.success : theme.errorText,
    fontWeight: 500,
  });

  const chartContainerStyle: CSSProperties = {
    position: 'relative',
    height: '300px',
    marginTop: '20px',
  };

  const flexContainerStyle: CSSProperties = {
    display: 'flex',
    gap: '30px',
    marginBottom: '30px',
  };

  const cardContainerStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  // Memoize chart data and options to prevent recreation on hover state changes
  const pieChartData = useMemo(() => ({
    labels: assetAllocation ? [
      'Stocks',
      'Crypto',
      'Gold',
      'Bonds',
      'Real Estate',
      'Cash',
      'Other'
    ] : [],
    datasets: [
      {
        data: assetAllocation ? [
          assetAllocation.stocks_percentage,
          assetAllocation.crypto_percentage,
          assetAllocation.gold_percentage,
          assetAllocation.bonds_percentage,
          assetAllocation.real_estate_percentage,
          assetAllocation.cash_percentage,
          assetAllocation.other_percentage
        ] : [],
        backgroundColor: [
          typeColors.stock,
          typeColors.crypto,
          typeColors.gold,
          typeColors.bond,
          typeColors.real_estate,
          typeColors.cash,
          typeColors.other
        ],
        borderColor: Array(7).fill('rgba(255, 255, 255, 0.1)'),
        borderWidth: 1,
      },
    ],
  }), [assetAllocation]);

  const pieChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: theme.text,
          font: {
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: {label?: string; raw?: number}) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    },
  }), [theme.text]);

  const investmentsByTypeChartData = useMemo(() => ({
    labels: investmentsByType.map(item => capitalizeTypeFn(item.type)),
    datasets: [
      {
        label: 'Value ($)',
        data: investmentsByType.map(item => item.total_value),
        backgroundColor: investmentsByType.map(item => 
          typeColors[item.type as keyof typeof typeColors] + '80' || theme.primary
        ),
        borderColor: investmentsByType.map(item => 
          typeColors[item.type as keyof typeof typeColors] || theme.primary
        ),
        borderWidth: 1,
      },
    ],
  }), [investmentsByType, capitalizeTypeFn]);

  const barChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: theme.textSecondary,
          callback: function(value: number) {
            return '$' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.textSecondary,
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: {dataset: {label?: string}; raw?: number}) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${formatCurrencyFn(value)}`;
          }
        }
      }
    }
  }), [theme.textSecondary, formatCurrencyFn]);

  const bitcoinChartData = useMemo(() => ({
    labels: bitcoinHistory.map(history => formatShortDateFn(history.date)),
    datasets: [
      {
        label: 'Bitcoin Price',
        data: bitcoinHistory.map(history => history.price),
        fill: 'start',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        borderColor: typeColors.crypto,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: typeColors.crypto,
        pointBorderColor: 'rgba(255, 255, 255, 0.8)',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
      },
    ],
  }), [bitcoinHistory, formatShortDateFn]);

  const lineChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: theme.textSecondary,
          callback: function(value: number) {
            return '$' + value.toLocaleString();
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.textSecondary,
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: {dataset: {label?: string}; raw?: number}) {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${formatCurrencyFn(value)}`;
          }
        }
      }
    }
  }), [theme.textSecondary, formatCurrencyFn]);

  // Portfolio tab content
  const PortfolioTab = () => {
    return (
      <div>
        <div style={statsGridStyle}>
          <StatCard 
            id="total-value"
            title="Total Portfolio Value"
            value={formatCurrencyFn(totalValue)}
            description={`Across ${investments.length} investments`}
            theme={theme}
          />
          
          <StatCard 
            id="avg-return"
            title="Average Return"
            value={avgReturn}
            description="Weighted by investment value"
            theme={theme}
          />
          
          {profitLossAnalysis.length > 0 && (
            <StatCard 
              id="top-performer"
              title="Top Performer"
              value={profitLossAnalysis[0].name}
              description={
                <span style={profitStyle(profitLossAnalysis[0].percent_change)}>
                  {formatPercentageFn(profitLossAnalysis[0].percent_change)}
                </span>
              }
              theme={theme}
            />
          )}
          
          {profitLossAnalysis.length > 0 && (
            <StatCard 
              id="worst-performer"
              title="Worst Performer"
              value={profitLossAnalysis[profitLossAnalysis.length - 1].name}
              description={
                <span style={profitStyle(profitLossAnalysis[profitLossAnalysis.length - 1].percent_change)}>
                  {formatPercentageFn(profitLossAnalysis[profitLossAnalysis.length - 1].percent_change)}
                </span>
              }
              theme={theme}
            />
          )}
        </div>
        
        <div style={flexContainerStyle}>
          <div style={{ ...cardContainerStyle, flex: 1 }}>
            {assetAllocation && (
              <AllocationChart 
                data={pieChartData} 
                options={pieChartOptions}
                theme={theme}
              />
            )}
          </div>
          
          <div style={{ ...cardContainerStyle, flex: 1 }}>
            {investmentsByType.length > 0 && (
              <InvestmentTypeChart 
                data={investmentsByTypeChartData} 
                options={barChartOptions}
                theme={theme}
              />
            )}
          </div>
        </div>
        
        {bitcoinHistory.length > 0 && (
          <BitcoinHistoryChart 
            data={bitcoinChartData} 
            options={lineChartOptions}
            theme={theme}
          />
        )}
      </div>
    );
  };

  // Investments tab content
  const InvestmentsTab = () => (
    <div>
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>My <span style={sectionTitleHighlightStyle}>Investments</span></h2>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead style={tableHeaderStyle}>
              <tr>
                <th style={tableHeaderCellStyle}>Name</th>
                <th style={tableHeaderCellStyle}>Type</th>
                <th style={tableHeaderCellStyle}>Symbol</th>
                <th style={tableHeaderCellStyle}>Amount</th>
                <th style={tableHeaderCellStyle}>Purchase Price</th>
                <th style={tableHeaderCellStyle}>Current Price</th>
                <th style={tableHeaderCellStyle}>Total Value</th>
                <th style={tableHeaderCellStyle}>Profit/Loss</th>
                <th style={tableHeaderCellStyle}>% Change</th>
                <th style={tableHeaderCellStyle}>Purchase Date</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(investment => {
                const totalValue = investment.amount * investment.current_price;
                const profitLoss = totalValue - (investment.amount * investment.purchase_price);
                const percentChange = ((investment.current_price - investment.purchase_price) / investment.purchase_price) * 100;
                
                return (
                  <tr key={investment.id}>
                    <td style={tableCellStyle}>{investment.name}</td>
                    <td style={tableCellStyle}>
                      <span style={tagStyle(investment.type)}>
                        {capitalizeTypeFn(investment.type)}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{investment.symbol || '—'}</td>
                    <td style={tableCellStyle}>{investment.amount}</td>
                    <td style={tableCellStyle}>{formatCurrencyFn(investment.purchase_price)}</td>
                    <td style={tableCellStyle}>{formatCurrencyFn(investment.current_price)}</td>
                    <td style={tableCellStyle}>{formatCurrencyFn(totalValue)}</td>
                    <td style={tableCellStyle}>
                      <span style={profitStyle(profitLoss)}>
                        {formatCurrencyFn(profitLoss)}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={profitStyle(percentChange)}>
                        {formatPercentageFn(percentChange)}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{formatDateFn(investment.purchase_date)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Performance tab content
  const PerformanceTab = () => (
    <div>
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Performance <span style={sectionTitleHighlightStyle}>Analysis</span></h2>
        <div style={tableContainerStyle}>
          <table style={tableStyle}>
            <thead style={tableHeaderStyle}>
              <tr>
                <th style={tableHeaderCellStyle}>Name</th>
                <th style={tableHeaderCellStyle}>Type</th>
                <th style={tableHeaderCellStyle}>Total Investment</th>
                <th style={tableHeaderCellStyle}>Current Value</th>
                <th style={tableHeaderCellStyle}>Total P/L</th>
                <th style={tableHeaderCellStyle}>% Change</th>
                <th style={tableHeaderCellStyle}>Purchase Date</th>
                <th style={tableHeaderCellStyle}>Holding Period</th>
              </tr>
            </thead>
            <tbody>
              {profitLossAnalysis.map(investment => {
                const initialInvestment = investment.amount * investment.purchase_price;
                const currentValue = investment.amount * investment.current_price;
                const purchaseDate = new Date(investment.purchase_date);
                const today = new Date();
                const holdingPeriod = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
                
                return (
                  <tr key={investment.id}>
                    <td style={tableCellStyle}>{investment.name}</td>
                    <td style={tableCellStyle}>
                      <span style={tagStyle(investment.type)}>
                        {capitalizeTypeFn(investment.type)}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{formatCurrencyFn(initialInvestment)}</td>
                    <td style={tableCellStyle}>{formatCurrencyFn(currentValue)}</td>
                    <td style={tableCellStyle}>
                      <span style={profitStyle(investment.total_profit_loss)}>
                        {formatCurrencyFn(investment.total_profit_loss)}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={profitStyle(investment.percent_change)}>
                        {formatPercentageFn(investment.percent_change)}
                      </span>
                    </td>
                    <td style={tableCellStyle}>{formatDateFn(investment.purchase_date)}</td>
                    <td style={tableCellStyle}>{holdingPeriod} months</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <div style={headerContainerStyle}>
        <h1 style={mainTitleStyle}>Investments</h1>
        <div style={tabContainerStyle}>
          <button 
            style={tabButtonStyle(tabValue === 0)} 
            onClick={() => handleTabChange(0)}
          >
            Portfolio
          </button>
          <button 
            style={tabButtonStyle(tabValue === 1)} 
            onClick={() => handleTabChange(1)}
          >
            Investments
          </button>
          <button 
            style={tabButtonStyle(tabValue === 2)} 
            onClick={() => handleTabChange(2)}
          >
            Performance
          </button>
        </div>
      </div>
      
      {loading.investments || loading.history || loading.allocation || loading.analytics ? (
        <div style={sectionStyle}>
          <p>Loading investment data...</p>
        </div>
      ) : (
        <>
          {tabValue === 0 && <PortfolioTab />}
          {tabValue === 1 && <InvestmentsTab />}
          {tabValue === 2 && <PerformanceTab />}
        </>
      )}
    </div>
  );
};

export default Investments; 