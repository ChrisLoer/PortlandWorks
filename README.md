# Portland Metro Budget Explorer

A web application for exploring and analyzing the budget data of the Portland Metro area. This project aims to provide an interactive and user-friendly way to understand how public funds are allocated and spent across different departments.

## Features

- Interactive budget visualization using Chart.js
- Responsive design built with Tailwind CSS
- Type-safe development with TypeScript
- Easy to maintain and extend data structure
- Per capita expense comparisons
- Funding source analysis
- Parent-child relationship tracking for budget items

## Data Model

The application uses a structured JSON data model to represent budget information:

```typescript
interface BudgetItem {
  id: string;                  // Unique identifier
  name: string;                // Department or program name
  administrativeUnit: string;  // City, County, Metro
  cityName: string;            // City name for comparison
  totalExpense: number;        // Total expense in dollars
  totalRevenue: number;        // Total revenue in dollars
  perCapitaExpense: number;    // Per capita expense for comparison
  year: number;                // Fiscal year
  grouping: string;            // Category grouping
  parentId: string | null;     // Parent department ID
  children: string[];          // Child department IDs
  fundingSources: string[];    // Sources of funding
  notes: string;               // Additional notes
  references: Reference[];     // Data sources and references
  allocation: number;          // Percentage of total budget
  description: string;         // Brief description
}
```

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd portland_works
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/app` - Next.js app router pages and layouts
- `/src/components` - Reusable React components
- `/src/components/charts` - Chart components using Chart.js
- `/src/data` - JSON data files containing budget information
- `/src/types` - TypeScript type definitions

## Deployment

This project is configured for deployment to GitHub Pages using GitHub Actions. The deployment process is automated:

1. Push your changes to the main branch
2. GitHub Actions will automatically build and deploy the site
3. The site will be available at `https://[your-username].github.io/portland_works`

### Manual Deployment

If you need to deploy manually:

1. Build the project:
```bash
npm run build
```

2. Push to your GitHub repository:
```bash
git push origin main
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
