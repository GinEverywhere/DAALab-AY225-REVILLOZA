# World Bank International Debt Analysis Dashboard

## Project Overview
An interactive data visualization and analysis dashboard exploring World Bank International Debt Statistics. The project analyzes global debt patterns across countries and years, providing insights through dynamic charts, statistical analysis, and detailed data exploration tools.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Data Source](#data-source)
- [How to Run](#how-to-run)
- [Usage Guide](#usage-guide)
- [Technologies](#technologies)

---

## Features

### 📊 Data Exploration
- Browse World Bank debt statistics with interactive tables
- Filter by country (case-insensitive search)
- Sort by multiple criteria (Country, Value, Year)
- View summary statistics (mean, highest debtor, unique countries)

### 📈 Visualizations
- Bar charts for top debt holders
- Scatter plots showing correlations
- Distribution analysis across countries
- Statistical trend analysis

### 🔍 Statistical Analysis
- Variance and standard deviation calculations
- Pearson correlation analysis
- Linear regression modeling
- R-squared value computation
- Narrative insights generation

---

## Project Structure

```
Finals/DAA/
│
├── index.html              # Main dashboard landing page
├── data.html               # Data exploration interface
├── analysis.html           # Statistical analysis view
├── val.html                # Validation & test results
│
├── script.js               # Core functionality & visualizations
├── style.css               # Responsive styling
│
├── IDSCountry.csv          # Country metadata
├── IDSData.csv             # Main debt dataset
│
└── README.md               # This file
```

---

## Data Source

**World Bank International Debt Statistics**

| Attribute | Value |
|-----------|-------|
| Coverage | 200+ countries |
| Records | 100,000+ entries |
| Time Period | 1970–2023 |
| Metrics | External debt, PPG debt, short-term debt, etc. |
| Format | CSV (processed from Kaggle WB Debt dataset) |

---

## How to Run

### Quick Start
1. Open any HTML file in your browser:
   - `index.html` - Start here for the main dashboard
   - `data.html` - Direct data exploration
   - `analysis.html` - Statistical analysis view

2. Data loads automatically from CSV files in the same directory

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required — runs entirely in the browser
- JavaScript enabled

---

## Usage Guide

### 📱 Main Dashboard (`index.html`)
- View summary statistics cards (mean, top country, count)
- Navigate to detailed data view
- See data loading status

### 🗂️ Data Exploration (`data.html`)
1. **Filter Data**: Enter country name → Click "Apply" (or press Enter)
2. **Sort Data**: Select from dropdown → Results update automatically
3. **Reset**: Clear all filters with "Reset" button
4. **Table**: Displays records with formatted numeric values

### 📊 Analysis View (`analysis.html`)
- Statistical metrics (variance, std dev, correlation)
- Regression analysis results
- Generated insights paragraphs
- Trend interpretation

---

## Team Contributions

### 👤 Student 1 — Data Engine & Table Management

**Core Functions Implemented:**

| Function | Purpose |
|----------|---------|
| `loadDataset()` | Load CSV data into memory; initialize summary cards |
| `renderTable(data)` | Display filtered/sorted data in interactive table |
| `applyFilterSort()` | Filter by country name; sort by multiple criteria |
| `resetTable()` | Clear filters and restore original dataset |
| `renderSummaryCards(data)` | Display statistical summary cards |

**Features:**
- Data loading and initialization
- Real-time table rendering with formatting
- Case-insensitive country filtering
- Multi-criterion sorting (Country, Value, Year)
- Summary statistics (mean, top country, unique count)

---

### 👤 Student 2 — Visualizations & Statistical Analysis

#### Part A: Visualization Layer

| Chart Type | Function | Features |
|-----------|----------|----------|
| **Bar Chart** | `drawBarChart()` | Top 10 debt holders; horizontal layout; coral styling |
| **Scatter Plot** | `drawScatterPlot()` | Correlation visualization; regression overlay; tooltips |
| **Doughnut Chart** | `drawDoughnut()` | Distribution analysis; color-coded by category |

#### Part B: Analysis Engine

**Statistical Functions:**

| Function | Formula | Purpose |
|----------|---------|---------|
| `variance(arr)` | σ² = Σ(xᵢ−μ)² / n | Data spread measurement |
| `stdDev(arr)` | σ = √variance(arr) | Standard deviation |
| `pearsonCorr(x, y)` | r = Σ((xᵢ−x̄)(yᵢ−ȳ)) / √(...) | Correlation coefficient |
| `linearRegression(x, y)` | Computes slope, intercept, R² | Trend modeling |

**Rendering Functions:**
- `renderAnalysis(data)` — Update DOM with statistical metrics
- `renderInsights(data)` — Generate narrative interpretations

---

## Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Charting**: Chart.js (for visualizations)
- **Data Format**: CSV
- **Styling**: Custom CSS with responsive design

---

## Key Files Description

| File | Purpose |
|------|---------|
| `index.html` | Entry point; displays dashboard overview |
| `data.html` | Main data exploration interface |
| `analysis.html` | Statistical analysis and insights |
| `script.js` | Data processing, filtering, visualization functions |
| `style.css` | Responsive styling with neon theme |
| `IDSCountry.csv` | Country reference data |
| `IDSData.csv` | Complete debt statistics dataset |

---

## Notes

- All data is loaded into memory on page load
- Filter/sort operations are performed client-side (no server calls)
- Charts are regenerated on each data update
- Empty results show a "No results" message

---

*Last Updated: April 2026*
