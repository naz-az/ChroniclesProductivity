const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, 'task.db'));

const moduleType = process.argv[2];

if (!moduleType) {
  console.error('Please specify a module to check: finance, fitness, or investments');
  process.exit(1);
}

console.log(`Checking data for ${moduleType} module...\n`);

switch (moduleType.toLowerCase()) {
  case 'finance':
    // Check finance data
    db.all('SELECT COUNT(*) as count FROM finance_transactions', (err, transactionCount) => {
      if (err) {
        console.error('Error checking transactions:', err.message);
      } else {
        console.log(`Transactions: ${transactionCount[0].count}`);
      }
      
      db.all('SELECT COUNT(*) as count FROM finance_bills', (err, billsCount) => {
        if (err) {
          console.error('Error checking bills:', err.message);
        } else {
          console.log(`Bills: ${billsCount[0].count}`);
        }
        
        db.all('SELECT COUNT(*) as count FROM finance_budgets', (err, budgetsCount) => {
          if (err) {
            console.error('Error checking budgets:', err.message);
          } else {
            console.log(`Budgets: ${budgetsCount[0].count}`);
          }
          
          db.all('SELECT COUNT(*) as count FROM finance_savings_goals', (err, savingsCount) => {
            if (err) {
              console.error('Error checking savings goals:', err.message);
            } else {
              console.log(`Savings Goals: ${savingsCount[0].count}`);
              db.close();
            }
          });
        });
      });
    });
    break;
    
  case 'fitness':
    // Check fitness data
    db.all('SELECT COUNT(*) as count FROM fitness_workouts', (err, workoutsCount) => {
      if (err) {
        console.error('Error checking workouts:', err.message);
      } else {
        console.log(`Workouts: ${workoutsCount[0].count}`);
      }
      
      db.all('SELECT COUNT(*) as count FROM fitness_exercises', (err, exercisesCount) => {
        if (err) {
          console.error('Error checking exercises:', err.message);
        } else {
          console.log(`Exercises: ${exercisesCount[0].count}`);
        }
        
        db.all('SELECT COUNT(*) as count FROM fitness_nutrition', (err, nutritionCount) => {
          if (err) {
            console.error('Error checking nutrition entries:', err.message);
          } else {
            console.log(`Nutrition Entries: ${nutritionCount[0].count}`);
          }
          
          db.all('SELECT COUNT(*) as count FROM fitness_measurements', (err, measurementsCount) => {
            if (err) {
              console.error('Error checking measurements:', err.message);
            } else {
              console.log(`Measurements: ${measurementsCount[0].count}`);
            }
            
            db.all('SELECT COUNT(*) as count FROM fitness_goals', (err, goalsCount) => {
              if (err) {
                console.error('Error checking fitness goals:', err.message);
              } else {
                console.log(`Fitness Goals: ${goalsCount[0].count}`);
                db.close();
              }
            });
          });
        });
      });
    });
    break;

  case 'investments':
    // Check investments data
    db.all('SELECT COUNT(*) as count FROM investments', (err, investmentsCount) => {
      if (err) {
        console.error('Error checking investments:', err.message);
      } else {
        console.log(`Investments: ${investmentsCount[0].count}`);
      }
      
      db.all('SELECT COUNT(*) as count FROM investment_history', (err, historyCount) => {
        if (err) {
          console.error('Error checking investment history:', err.message);
        } else {
          console.log(`Investment History Entries: ${historyCount[0].count}`);
        }
        
        db.all('SELECT COUNT(*) as count FROM asset_allocation', (err, allocationCount) => {
          if (err) {
            console.error('Error checking asset allocation:', err.message);
          } else {
            console.log(`Asset Allocation Entries: ${allocationCount[0].count}`);
            
            // Get total value of investments
            db.get('SELECT SUM(amount * current_price) as total FROM investments', (err, total) => {
              if (err) {
                console.error('Error calculating total investment value:', err.message);
              } else {
                console.log(`Total Investment Portfolio Value: $${total.total ? total.total.toFixed(2) : 0}`);
                
                // Show investments by type
                db.all(`SELECT type, COUNT(*) as count, SUM(amount * current_price) as value 
                       FROM investments GROUP BY type ORDER BY value DESC`, (err, types) => {
                  if (err) {
                    console.error('Error aggregating investment types:', err.message);
                  } else {
                    console.log('\nInvestment Types:');
                    types.forEach(type => {
                      console.log(`- ${type.type}: ${type.count} investments, $${type.value.toFixed(2)}`);
                    });
                    db.close();
                  }
                });
              }
            });
          }
        });
      });
    });
    break;
    
  default:
    console.error('Unknown module. Please specify finance, fitness, or investments');
    db.close();
} 