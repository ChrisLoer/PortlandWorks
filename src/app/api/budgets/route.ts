import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { BudgetData } from '@/types/budget';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the absolute path to the parsed_budgets directory
    const budgetsDir = path.join(process.cwd(), 'src/data/parsed_budgets');
    
    // Read all files in the directory
    const files = await fs.readdir(budgetsDir);
    
    // Filter for JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Read and parse each JSON file
    const budgets: BudgetData[] = await Promise.all(
      jsonFiles.map(async (file) => {
        const filePath = path.join(budgetsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      })
    );
    
    // Combine all budgets into a single data structure
    const combinedBudget: BudgetData = {
      fiscalYear: budgets[0].fiscalYear, // Use the first budget's fiscal year
      lastUpdated: new Date().toISOString().split('T')[0],
      dataSource: 'Combined Budget Data',
      dataSourceUrl: '',
      departments: budgets.flatMap(budget => budget.departments)
    };
    
    return NextResponse.json(combinedBudget);
  } catch (error) {
    console.error('Error loading budget data:', error);
    return NextResponse.json(
      { error: 'Failed to load budget data' },
      { status: 500 }
    );
  }
} 
