
# Financial Dashboard & Invoice Data Processing

A comprehensive financial dashboard application that visualizes invoice data with analytics and reporting features. This project includes both the data processing pipeline for preparing raw invoice data and the React web application for visualization.

## Project Overview

This system consists of two main components:

1. **Data Processing Pipeline** - Transforms raw CSV invoice data into clean, structured formats for Supabase
2. **Web Dashboard Application** - React application that provides visualizations and insights based on the processed data

## Data Processing Pipeline

The data pipeline transforms raw invoice records into:
- Cleaned invoice data with standardized formats
- Company-specific metrics for dashboard visualizations
- CSV outputs with UUID primary keys ready for Supabase import

### Data Cleaning Process

#### Input Data
The source file `Data for Technical Challenge.csv` contains invoice records with the following fields:
- Date Invoiced
- Date Paid
- No. Days taken to Pay
- Client Name
- Invoice Reference
- Invoice Amount
- Paid Amount

#### Cleaning Steps

1. **Data Loading & Exploration**
   - Load CSV data using pandas
   - Analyze data structure, types, and missing values
   - Identify data quality issues

2. **Data Cleaning**
   - Convert date fields to proper datetime format
   - Standardize Invoice Reference format to YEAR-REFERENCE NUMBER
   - Handle missing values with appropriate defaults
   - Validate and recalculate "Days to Pay" where needed
   - Add payment status classification (Fully Paid, Partially Paid, Unpaid, Overpaid)
   - Define late payments (>30 days threshold)

3. **Derived Metrics**
   - Add month/year columns for time-based analysis
   - Add Outstanding Invoice flags
   - Calculate Amount Due (Invoice Amount - Paid Amount)

4. **Company-Specific Metrics**
   - Total invoices and amounts per company
   - Average days to pay
   - Late invoice statistics
   - Monthly totals for visualization
   - Payment status breakdowns

5. **Export Preparation**
   - Format data for Supabase compatibility
   - Convert NumPy types to Python native types for JSON serialization
   - Generate CSV files with UUID primary keys for direct Supabase import

### Output Files

1. **supabase_invoices.csv**
   - Complete cleaned dataset with all invoice records and UUID primary keys

2. **supabase_company_metrics.csv**
   - Pre-calculated metrics for each company with UUID primary keys

3. **supabase_monthly_breakdown.csv**
   - Monthly aggregations for time-series analysis with UUID primary keys

### Data Schema

#### Cleaned Invoice Data Fields
- id: UUID (Primary Key)
- Date Invoiced: Date (YYYY-MM-DD)
- Date Paid: Date (YYYY-MM-DD)
- No. Days taken to Pay: Integer
- Client Name: String
- Invoice Reference: String (YYYY-NNNN format)
- Invoice Amount: Float
- Paid Amount: Float
- Payment Status: String (Fully Paid, Partially Paid, Unpaid, Overpaid)
- Is Late: Boolean (true if payment took >30 days)
- Is Outstanding: Boolean
- Amount Due: Float
- Invoice Month/Year: String/Integer
- Payment Month/Year: String/Integer

#### Company Metrics Fields
- id: UUID (Primary Key)
- client_name: String
- total_invoices: Integer
- total_invoiced: Float
- total_paid: Float
- average_days_to_pay: Float
- late_invoices_count: Integer
- late_invoices_percentage: Float
- outstanding_invoices: Integer
- outstanding_amount: Float
- monthly_data: JSON Object containing:
  - monthly_invoiced: Object (Month -> Amount)
  - monthly_paid: Object (Month -> Amount)
- payment_status_breakdown: Object (Status -> Count)

#### Monthly Breakdown Fields
- id: UUID (Primary Key)
- client_name: String
- month: String (YYYY-MM)
- invoiced_amount: Float
- paid_amount: Float

## Web Dashboard Application

The web application provides a user-friendly interface to visualize and analyze the processed invoice data through interactive charts, tables, and reports.

### Features

- **Dashboard Overview**: Summary of key metrics and KPIs
- **Company Selection**: Filter data by company/client
- **Interactive Charts**:
  - Revenue trends (invoiced vs. paid amounts)
  - Payment status distribution
  - Late invoice percentages
  - Monthly payment status breakdown
- **Detailed Tables**:
  - Invoice listing with filtering and sorting
  - Monthly breakdown analysis
  - Late invoice analysis
- **Analytics**: Deep dive into payment trends and patterns

### Technologies Used

- **Frontend**:
  - React with TypeScript
  - Vite for fast development
  - Tailwind CSS for styling
  - shadcn/ui component library
  - recharts for data visualization
  - React Router for navigation
  - React Query for data fetching and state management

- **Backend**:
  - Supabase for database and authentication
  - PostgreSQL for data storage
  - Row-Level Security for data protection

### Database Structure

The application connects to a Supabase database with the following tables:

1. **invoices** - Stores individual invoice records
2. **company_metrics** - Contains pre-calculated metrics per company
3. **monthly_breakdown** - Provides monthly aggregated data

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Access to a Supabase project with the proper tables configured

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Data Import Process

1. Run the data processing scripts (Python):
   ```
   pip install pandas numpy
   python process_invoice_data.py
   python prepare_for_supabase.py
   ```

2. Import the generated CSV files into your Supabase project:
   - Navigate to the Supabase Table Editor
   - Create tables with matching schemas
   - Import the corresponding CSV files

## Project Structure

```
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── charts/       # Data visualization components
│   │   ├── dashboard/    # Dashboard-specific components
│   │   ├── layout/       # Layout components
│   │   ├── tables/       # Table components 
│   │   └── ui/           # UI components from shadcn
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # Integration with external services
│   │   └── supabase/     # Supabase client and types
│   ├── lib/              # Utility functions and helpers
│   ├── pages/            # Application pages
│   └── App.tsx           # Main application component
├── supabase/             # Supabase configuration
└── data-processing/      # Data processing scripts (Python)
```

## Deployment

The application can be deployed via the Lovable platform or transferred to a custom hosting solution:

1. Via Lovable:
   - Navigate to Project > Settings > Publish
   - Click "Publish" to deploy the application

2. With custom domain:
   - Navigate to Project > Settings > Domains
   - Connect your custom domain

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [recharts](https://recharts.org/) for the chart visualizations
- [Lovable](https://lovable.dev/) for the development platform
