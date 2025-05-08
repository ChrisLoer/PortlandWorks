const fs = require('fs').promises;
const path = require('path');

async function generateStaticData() {
  try {
    // Create the public/api directory if it doesn't exist
    const apiDir = path.join(process.cwd(), 'public/api');
    await fs.mkdir(apiDir, { recursive: true });

    // Generate combined budget data
    const budgetsDir = path.join(process.cwd(), 'src/data/parsed_budgets');
    const files = await fs.readdir(budgetsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const budgets = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(budgetsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      })
    );
    
    const combinedBudget = {
      fiscalYear: budgets[0].fiscalYear,
      lastUpdated: new Date().toISOString().split('T')[0],
      dataSource: 'Combined Budget Data',
      dataSourceUrl: '',
      departments: budgets.flatMap(budget => budget.departments)
    };
    
    // Copy administrative units data
    const adminUnitsPath = path.join(process.cwd(), 'src/data/administrative-units.json');
    const adminUnitsContent = await fs.readFile(adminUnitsPath, 'utf-8');
    
    // Copy capital vs operating data
    const capitalVsOperatingPath = path.join(process.cwd(), 'src/data/capital-vs-operating.json');
    const capitalVsOperatingContent = await fs.readFile(capitalVsOperatingPath, 'utf-8');
    
    // Write all files to the public/api directory
    await Promise.all([
      fs.writeFile(path.join(apiDir, 'budgets.json'), JSON.stringify(combinedBudget, null, 2)),
      fs.writeFile(path.join(apiDir, 'administrative-units.json'), adminUnitsContent),
      fs.writeFile(path.join(apiDir, 'capital-vs-operating.json'), capitalVsOperatingContent)
    ]);
    
    console.log('Successfully generated all static data files');
  } catch (error) {
    console.error('Error generating static data:', error);
    process.exit(1);
  }
}

generateStaticData(); 
