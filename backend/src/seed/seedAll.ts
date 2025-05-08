import { seedFinance } from './seedFinance';
import { seedFitness } from './seedFitness';
import { seedProjects } from './seedProjects';
import { seedInvestments } from './seedInvestments';

// Run all seed functions
const runAllSeeds = async () => {
  try {
    console.log('=== Starting all seed operations ===');
    
    // Run finance seed first
    await seedFinance();
    console.log('✓ Finance data seed completed');
    
    // Run fitness seed
    await seedFitness();
    console.log('✓ Fitness data seed completed');
    
    // Run projects seed
    await seedProjects();
    console.log('✓ Projects data seed completed');
    
    // Run investments seed
    await seedInvestments();
    console.log('✓ Investments data seed completed');
    
    console.log('=== All seed operations completed successfully ===');
    process.exit(0);
  } catch (error) {
    console.error('Error during seed operations:', error);
    process.exit(1);
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  runAllSeeds();
}

export { runAllSeeds }; 