# World Bank International Debt Dashboard

## Project Overview
A collaborative data science project featuring a World Bank International Debt Statistics dashboard built with vanilla JavaScript, HTML5, and CSS3.

## Student 1 Contribution — Data Engine (feature/data-engine)

### Tasks Implemented

#### TASK A: loadDataset() ✅ COMPLETE
- Copies allData into window.DS using spread operator
- Calls renderTable() to display data
- Calls renderSummaryCards() to show statistics
- Triggers onDataReady() callback for Student 2
- Updates row count display
- IMPLEMENTED in script.js line 524-532
- Hooked into loadWorldBankData() for automatic initialization

#### TASK B: renderTable(data) ✅ COMPLETE
- Clears and renders table rows
- Applies 'num' CSS class for right-aligned numbers
- Shows "No results" message when empty
- Properly formats floating-point values
- IMPLEMENTED in script.js line 541-577
- Handles missing data gracefully with '-' placeholder

#### TASK C: applyFilterSort()
- Filters by country name (case-insensitive)
- Sorts by: Country (A-Z), Value (High-Low), Year (Recent-First)
- Updates table and row count in real-time

#### TASK D: resetTable()
- Clears filter and sort inputs
- Restores original dataset view

#### TASK E: renderSummaryCards(data)
- Displays mean value across all records
- Shows country with highest value
- Counts unique countries in dataset
- Calculates average year represented

## Files
- `index.html` - Main dashboard with Data Engine section
- `data.html` - Detailed data page with filter controls
- `script.js` - All JavaScript implementations
- `style.css` - Responsive styling with neon theme

## How to Run
1. Open `index.html` or `data.html` in a web browser
2. Data loads automatically from CSV files
3. Use filter and sort controls to explore the data
4. View summary statistics in the cards above

## Data Source
World Bank International Debt Statistics (Kaggle)
- Countries: 200+
- Records: 100,000+
- Years: 1970-2023

## Git Workflow
- Created `feature/data-engine` branch for Student 1
- Implemented 5 core functions with full test coverage
- Ready for Student 2's visualization layer
