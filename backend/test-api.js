const fetch = require('node-fetch');

const apiEndpoints = [
  'http://localhost:5000/api/finance/transactions',
  'http://localhost:5000/api/finance/bills',
  'http://localhost:5000/api/finance/budgets',
  'http://localhost:5000/api/finance/savings-goals',
  'http://localhost:5000/api/fitness/workouts',
  'http://localhost:5000/api/fitness/nutrition',
  'http://localhost:5000/api/fitness/measurements',
  'http://localhost:5000/api/fitness/goals'
];

const testEndpoints = async () => {
  for (const endpoint of apiEndpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        console.error(`Error: ${response.status} ${response.statusText}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`Response status: ${response.status}`);
      console.log(`Data count: ${Array.isArray(data) ? data.length : 'Not an array'}`);
      
      if (Array.isArray(data) && data.length > 0) {
        console.log(`First item: ${JSON.stringify(data[0], null, 2).substring(0, 200)}...`);
      } else if (Array.isArray(data) && data.length === 0) {
        console.log('Empty array returned');
      } else {
        console.log(`Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
      }
    } catch (error) {
      console.error(`Fetch error for ${endpoint}:`, error.message);
    }
    
    console.log('\n----------------------------\n');
  }
};

console.log('Starting API endpoint tests...');
testEndpoints()
  .then(() => console.log('API tests completed.'))
  .catch(err => console.error('Error in API tests:', err)); 