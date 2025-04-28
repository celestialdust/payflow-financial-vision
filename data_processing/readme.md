# Invoice Data Processing

This project processes raw invoice data from CSV format into clean, structured data ready for import into Supabase for a financial dashboard application.

## Project Overview

The data processing pipeline transforms raw invoice records into:
1. Cleaned invoice data with standardized formats
2. Company-specific metrics for dashboard visualizations
3. CSV outputs with UUID primary keys ready for Supabase import

## Data Cleaning Process

### Input Data
The source file `Data for Technical Challenge.csv` contains invoice records with the following fields:
- Date Invoiced
- Date Paid
- No. Days taken to Pay
- Client Name
- Invoice Reference
- Invoice Amount
- Paid Amount

### Cleaning Steps

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

## Data Schema

### Cleaned Invoice Data Fields
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

### Company Metrics Fields
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

### Monthly Breakdown Fields (Optional)
- id: UUID (Primary Key)
- client_name: String
- month: String (YYYY-MM)
- invoiced_amount: Float
- paid_amount: Float

## Usage

1. Install required dependencies:
   ```
   pip install pandas numpy
   ```

2. Run the data processing script:
   ```
   python process_invoice_data.py
   ```

3. Create Supabase-ready CSVs with primary keys:
   ```
   python prepare_for_supabase.py
   ```

4. Import the generated files into Supabase using the table editor's CSV import functionality
