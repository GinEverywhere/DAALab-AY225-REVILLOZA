// Global Variables
let allData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 10;
let topCountriesChart = null;
let debtTypeChart = null;
let trendsChart = null;
let regionalChart = null;
let barChart = null;

// STUDENT 2 Chart instances
let barChart = null;
let scatterChart = null;
let doughnutChart = null;

// STUDENT 1 CONTRIBUTION: Data Engine namespace
window.DS = [];

// Callback for Student 2's code
function onDataReady() {
    console.log("✓ Data Engine ready! Student 2 can initialize their code.");
    // Student 2: Initialize visualizations and analysis
    if (filteredData.length > 0) {
        drawBarChart('barChart', filteredData);
        drawScatterPlot('scatterChart', filteredData);
        drawDoughnut('doughnutChart', filteredData);
        renderAnalysis(filteredData);
        renderInsights(filteredData);
        console.log('✓ Student 2 visualizations initialized');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized');
    loadWorldBankData();
});

// Load World Bank data from CSV files
function loadWorldBankData() {
    fetch('IDSData.csv')
        .then(r => r.text())
        .then(dataCSV => {
            try {
                parseWorldBankData(dataCSV);
                updateDashboard();
                // TASK A: Initialize Data Engine with loaded data
                loadDataset();
            } catch (error) {
                console.error('Error loading data:', error);
                loadSampleData();
                loadDataset();
            }
        })
        .catch(err => {
            console.warn('Could not load CSV file, using sample data:', err);
            loadSampleData();
            loadDataset();
        });
}

// Parse World Bank CSV format
function parseWorldBankData(dataCSV) {
    const lines = dataCSV.split('\n');
    const headers = parseCSVLine(lines[0]);
    
    // Store year columns
    const yearColumns = headers.filter(h => /^\d{4}$/.test(h)).sort();
    
    console.log('Headers:', headers.length);
    console.log('Year columns:', yearColumns);
    
    // Process each row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const values = parseCSVLine(line);
        if (values.length < 4) continue;
        
        const countryName = values[0]?.trim();
        const countryCode = values[1]?.trim();
        const indicatorName = values[2]?.trim();
        const indicatorCode = values[3]?.trim();
        
        if (!countryName || !countryCode || !indicatorName) continue;
        
        // Process each year
        for (let j = 0; j < yearColumns.length; j++) {
            const year = yearColumns[j];
            const headerIdx = headers.indexOf(year);
            if (headerIdx < 0) continue;
            
            const value = values[headerIdx];
            
            if (value && value !== '' && !isNaN(parseFloat(value))) {
                allData.push({
                    'Country Code': countryCode,
                    'Country Name': countryName,
                    'Indicator Code': indicatorCode,
                    'Indicator Name': indicatorName,
                    'Year': year,
                    'Value': parseFloat(value)
                });
            }
        }
    }
    
    console.log('Total records loaded:', allData.length);
    filteredData = [...allData];
}

// Parse CSV line handling quotes
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(current.replace(/^"|"$/g, '').trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.replace(/^"|"$/g, '').trim());
    return result;
}

// Handle CSV file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    const statusDiv = document.getElementById('uploadStatus');

    if (!file) return;

    if (!file.name.endsWith('.csv')) {
        statusDiv.textContent = '❌ Please upload a valid CSV file';
        statusDiv.className = 'upload-status error';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            allData = [];
            parseWorldBankData(csv);
            filteredData = [...allData];
            
            updateDashboard();
            statusDiv.textContent = `✅ Successfully loaded ${allData.length} records!`;
            statusDiv.className = 'upload-status success';
        } catch (error) {
            console.error('Error parsing CSV:', error);
            statusDiv.textContent = '❌ Error parsing CSV file. Check console for details.';
            statusDiv.className = 'upload-status error';
        }
    };
    reader.readAsText(file);
}

// Load sample data for demonstration
function loadSampleData() {
    allData = [
        { 'Country Name': 'United States', 'Country Code': 'USA', 'Indicator Name': 'External Debt (% of GNI)', 'Indicator Code': 'DT.EXT.DECT.ZS', 'Year': '2020', 'Value': 18.5 },
        { 'Country Name': 'China', 'Country Code': 'CHN', 'Indicator Name': 'External Debt (% of GNI)', 'Indicator Code': 'DT.EXT.DECT.ZS', 'Year': '2020', 'Value': 12.3 },
        { 'Country Name': 'Japan', 'Country Code': 'JPN', 'Indicator Name': 'External Debt (% of GNI)', 'Indicator Code': 'DT.EXT.DECT.ZS', 'Year': '2020', 'Value': 35.2 },
        { 'Country Name': 'Germany', 'Country Code': 'DEU', 'Indicator Name': 'External Debt (% of GNI)', 'Indicator Code': 'DT.EXT.DECT.ZS', 'Year': '2020', 'Value': 22.1 },
        { 'Country Name': 'India', 'Country Code': 'IND', 'Indicator Name': 'External Debt (% of GNI)', 'Indicator Code': 'DT.EXT.DECT.ZS', 'Year': '2020', 'Value': 21.4 },
        { 'Country Name': 'Brazil', 'Country Code': 'BRA', 'Indicator Name': 'External Debt (% of GNI)', 'Indicator Code': 'DT.EXT.DECT.ZS', 'Year': '2020', 'Value': 31.8 },
        { 'Country Name': 'United Kingdom', 'Country Code': 'GBR', 'Indicator Name': 'External Debt (% of GNI)', 'Indicator Code': 'DT.EXT.DECT.ZS', 'Year': '2020', 'Value': 25.6 },
        { 'Country Name': 'France', 'Country Code': 'FRA', 'Indicator Name': 'External Debt (% of GNI)', 'Indicator Code': 'DT.EXT.DECT.ZS', 'Year': '2020', 'Value': 28.3 },
        { 'Country Name': 'Canada', 'Country Code': 'CAN', 'Indicator Name': 'External Debt (% of GNI)', 'Indicator Code': 'DT.EXT.DECT.ZS', 'Year': '2020', 'Value': 19.5 },
        { 'Country Name': 'Italy', 'Country Code': 'ITA', 'Indicator Name': 'External Debt (% of GNI)', 'Indicator Code': 'DT.EXT.DECT.ZS', 'Year': '2020', 'Value': 24.7 }
    ];
    
    filteredData = [...allData];
    updateDashboard();
}

// Update entire dashboard
function updateDashboard() {
    updateStatistics();
    populateFilters();
    setTimeout(() => {
        updateCharts();
        displayTableData();
    }, 500);
}

// Update statistics cards
function updateStatistics() {
    const uniqueCountries = new Set(allData.map(d => d['Country Code'] || '').filter(x => x)).size;
    const uniqueIndicators = new Set(allData.map(d => d['Indicator Code'] || '').filter(x => x)).size;
    
    // Use reduce instead of spread operator to avoid stack overflow with large arrays
    let minYear = 9999;
    let maxYear = 0;
    for (let i = 0; i < allData.length; i++) {
        const year = parseInt(allData[i]['Year']) || 0;
        if (year > 0) {
            if (year < minYear) minYear = year;
            if (year > maxYear) maxYear = year;
        }
    }
    minYear = minYear === 9999 ? 0 : minYear;
    const minYearStr = minYear.toString();
    const maxYearStr = maxYear.toString();

    console.log('Countries:', uniqueCountries);
    console.log('Records:', allData.length);
    console.log('Indicators:', uniqueIndicators);

    document.getElementById('countryCount').textContent = uniqueCountries.toLocaleString();
    document.getElementById('recordCount').textContent = allData.length.toLocaleString();
    document.getElementById('categoryCount').textContent = uniqueIndicators.toLocaleString();
    
    const yearRangeEl = document.getElementById('yearRange');
    if (yearRangeEl && uniqueCountries > 0) {
        yearRangeEl.textContent = `${minYearStr}-${maxYearStr}`;
    }
}

// Populate filter dropdowns
function populateFilters() {
    console.log('Populating filters with', allData.length, 'records');
    
    // Debt types
    const debtTypes = [...new Set(allData.map(d => d['Indicator Name']).filter(x => x))].sort();
    const debtTypeFilter = document.getElementById('debtTypeFilter');
    
    console.log('Found debt types:', debtTypes.length, debtTypes);
    
    if (debtTypeFilter) {
        debtTypeFilter.innerHTML = '<option value="">All Indicators</option>';
        debtTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            debtTypeFilter.appendChild(option);
        });
        console.log('Updated debt type filter with', debtTypes.length, 'options');
    }

    // Countries for datalist
    const countries = [...new Set(allData.map(d => d['Country Name']).filter(x => x))].sort();
    console.log('Found countries:', countries.length);
    
    let countryDatalist = document.getElementById('countryList');
    if (!countryDatalist) {
        countryDatalist = document.createElement('datalist');
        countryDatalist.id = 'countryList';
        document.body.appendChild(countryDatalist);
    } else {
        countryDatalist.innerHTML = '';
    }
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        countryDatalist.appendChild(option);
    });

    // Years for dropdown
    const years = [...new Set(allData.map(d => d['Year']).filter(x => x))].map(y => parseInt(y)).filter(y => !isNaN(y)).sort((a,b) => b-a).map(y => y.toString());
    console.log('Found years:', years.length, years.slice(0, 10));
    
    const yearFilter = document.getElementById('yearFilter');
    if (yearFilter && yearFilter.tagName === 'SELECT') {
        yearFilter.innerHTML = '<option value="">All Years</option>';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
        console.log('Updated year filter with', years.length, 'options');
    }

    // Add datalist attribute to country input
    const countryInput = document.getElementById('countryFilter');
    if (countryInput) {
        countryInput.setAttribute('list', 'countryList');
    }
    
    console.log('Filters populated successfully');
}

// Filter data based on user input
function filterData() {
    const countryFilter = document.getElementById('countryFilter').value.toLowerCase();
    const debtTypeFilter = document.getElementById('debtTypeFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;

    filteredData = allData.filter(item => {
        const countryMatch = !countryFilter || 
            (item['Country Name'] && item['Country Name'].toLowerCase().includes(countryFilter)) ||
            (item['Country Code'] && item['Country Code'].toLowerCase().includes(countryFilter));
        
        const typeMatch = !debtTypeFilter || (item['Indicator Name'] === debtTypeFilter);
        const yearMatch = !yearFilter || (item['Year'] && item['Year'].toString() === yearFilter);

        return countryMatch && typeMatch && yearMatch;
    });

    currentPage = 1;
    updateCharts();
    displayTableData();
    
    // Update Student 2 visualizations
    if (filteredData.length > 0) {
        drawBarChart('barChart', filteredData);
        drawScatterPlot('scatterChart', filteredData);
        drawDoughnut('doughnutChart', filteredData);
        renderAnalysis(filteredData);
        renderInsights(filteredData);
    }
}

// Update charts
function updateCharts() {
    setTimeout(() => {
        updateTopCountriesChart();
        drawBarChart('barChart', filteredData);
        updateDebtTypeChart();
        updateTrendsChart();
        updateRegionalChart();
    }, 100);
}

// Chart 1: Top countries by debt
function updateTopCountriesChart() {
    if (filteredData.length === 0) {
        console.warn('No data to display in top countries chart');
        return;
    }

    const countryDebts = {};
    
    filteredData.forEach(item => {
        if (item['Country Name'] && item['Value']) {
            const country = item['Country Name'];
            const value = typeof item['Value'] === 'string' ? parseFloat(item['Value']) : item['Value'];
            const numValue = isNaN(value) ? 0 : value;
            
            countryDebts[country] = (countryDebts[country] || 0) + numValue;
        }
    });

    const sorted = Object.entries(countryDebts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const labels = sorted.map(item => item[0]);
    const data = sorted.map(item => item[1]);

    const ctx = document.getElementById('topCountriesChart');
    if (!ctx) return;

    if (topCountriesChart) {
        topCountriesChart.destroy();
    }

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 16, 240, 0.3)');

    topCountriesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Debt Value',
                data: data,
                backgroundColor: gradient,
                borderColor: 'rgba(0, 240, 255, 1)',
                borderWidth: 2,
                borderRadius: 0,
                hoverBackgroundColor: 'rgba(57, 255, 20, 0.8)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        },
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(0, 240, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(0, 240, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function drawBarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Sort the top 10 countries by debt value
    const sorted = [...data]
        .filter(item => item['Country Name'] && item['Value'])
        .sort((a, b) => b['Value'] - a['Value'])
        .slice(0, 10);

    const labels = sorted.map(item => item['Country Name']);
    const values = sorted.map(item => typeof item['Value'] === 'string' ? parseFloat(item['Value']) : item['Value']);

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Debt Value',
                data: values,
                backgroundColor: 'rgba(217,79,61,0.8)',
                borderColor: 'rgba(217,79,61,1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    min: 0,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                y: {
                    ticks: {
                        autoSkip: false
                    }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    const placeholder = document.getElementById('barPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    ctx.style.display = 'block';
}

// Chart 2: Debt distribution by type
function updateDebtTypeChart() {
    if (filteredData.length === 0) {
        console.warn('No data to display in debt type chart');
        return;
    }

    const debtTypes = {};
    
    filteredData.forEach(item => {
        if (item['Indicator Name'] && item['Value']) {
            const type = item['Indicator Name'];
            const value = typeof item['Value'] === 'string' ? parseFloat(item['Value']) : item['Value'];
            const numValue = isNaN(value) ? 0 : value;
            
            debtTypes[type] = (debtTypes[type] || 0) + numValue;
        }
    });

    const labels = Object.keys(debtTypes);
    const data = Object.values(debtTypes);
    const colors = [
        'rgba(0, 240, 255, 0.8)',
        'rgba(57, 255, 20, 0.8)',
        'rgba(181, 55, 242, 0.8)',
        'rgba(255, 16, 240, 0.8)',
        'rgba(0, 128, 255, 0.8)',
        'rgba(255, 107, 53, 0.8)',
        'rgba(247, 127, 0, 0.8)',
        'rgba(255, 20, 147, 0.8)'
    ];

    const ctx = document.getElementById('debtTypeChart');
    if (!ctx) return;

    if (debtTypeChart) {
        debtTypeChart.destroy();
    }

    debtTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: '#0a0e27',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#e0e0e0',
                        font: {
                            size: 11
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return label + ': ' + value.toLocaleString(undefined, {maximumFractionDigits: 2});
                        }
                    }
                }
            }
        }
    });
}

// Chart 3: Debt trends over time
function updateTrendsChart() {
    if (filteredData.length === 0) {
        console.warn('No data to display in trends chart');
        return;
    }

    const yearTrends = {};
    
    filteredData.forEach(item => {
        if (item['Year'] && item['Value']) {
            const year = item['Year'];
            const value = typeof item['Value'] === 'string' ? parseFloat(item['Value']) : item['Value'];
            const numValue = isNaN(value) ? 0 : value;
            
            yearTrends[year] = (yearTrends[year] || 0) + numValue;
        }
    });

    const sortedYears = Object.keys(yearTrends).sort();
    const labels = sortedYears;
    const data = sortedYears.map(year => yearTrends[year]);

    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;

    if (trendsChart) {
        trendsChart.destroy();
    }

    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Debt Trend',
                data: data,
                borderColor: 'rgba(57, 255, 20, 1)',
                backgroundColor: 'rgba(57, 255, 20, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgba(57, 255, 20, 1)',
                pointBorderColor: '#0a0e27',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(57, 255, 20, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        },
                        color: '#e0e0e0'
                    },
                    grid: {
                        color: 'rgba(57, 255, 20, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

// Chart 4: Regional distribution
function updateRegionalChart() {
    if (filteredData.length === 0) {
        console.warn('No data to display in regional chart');
        return;
    }

    const regionalData = {};
    
    filteredData.forEach(item => {
        if (item['Country Code'] && item['Value']) {
            const code = item['Country Code'];
            const value = typeof item['Value'] === 'string' ? parseFloat(item['Value']) : item['Value'];
            const numValue = isNaN(value) ? 0 : value;
            
            regionalData[code] = (regionalData[code] || 0) + numValue;
        }
    });

    const sorted = Object.entries(regionalData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const labels = sorted.map(item => item[0]);
    const data = sorted.map(item => item[1]);

    const ctx = document.getElementById('regionalChart');
    if (!ctx) return;

    if (regionalChart) {
        regionalChart.destroy();
    }

    const colors = [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)',
        'rgba(199, 199, 199, 0.8)',
        'rgba(83, 102, 255, 0.8)'
    ];

    regionalChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Regional Debt Distribution',
                data: data,
                borderColor: 'rgba(181, 55, 242, 1)',
                backgroundColor: 'rgba(181, 55, 242, 0.25)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(181, 55, 242, 1)',
                pointBorderColor: '#0a0e27',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    ticks: {
                        color: '#e0e0e0',
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(181, 55, 242, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#e0e0e0'
                    }
                }
            }
        }
    });
}

// Display data table with pagination
function displayTableData() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    pageData.forEach(item => {
        const row = tableBody.insertRow();
        const value = typeof item['Value'] === 'string' ? parseFloat(item['Value']) : item['Value'];
        row.innerHTML = `
            <td>${item['Country Code'] || '-'}</td>
            <td>${item['Country Name'] || '-'}</td>
            <td>${item['Indicator Name'] || '-'}</td>
            <td>${item['Year'] || '-'}</td>
            <td>${isNaN(value) ? '-' : value.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
        `;
    });

    // Update pagination info
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pageInfoEl = document.getElementById('pageInfo');
    if (pageInfoEl) {
        pageInfoEl.textContent = `Page ${currentPage} of ${Math.max(1, totalPages)}`;
    }
}

// Pagination functions
function nextPage() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayTableData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayTableData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ============================================================
// STUDENT 1 CONTRIBUTION: Data Engine Implementation (Tasks A-E)
// ============================================================

/**
 * TASK A: loadDataset()
 * - Copy allData into window.DS (use [...allData])
 * - Call renderTable(window.DS)
 * - Call renderSummaryCards(window.DS)
 * - Call onDataReady() so Student 2's code can initialize
 * - Update #rowCount text
 */
function loadDataset() {
    window.DS = [...allData];
    console.log(`✓ TASK A: Loaded ${window.DS.length} debt records into window.DS`);
    
    renderTable(window.DS);
    renderSummaryCards(window.DS);
    onDataReady();
    updateRowCount(window.DS.length);
}

/**
 * TASK B: renderTable(data)
 * - Clear #tableBody innerHTML
 * - Build one <tr> per record with <td> for each field
 * - Apply CSS class 'num' for numbers (right-aligned)
 * - Show "No results" row when data.length === 0
 */
function renderTable(data) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="no-results">No results found</td></tr>';
        console.log('✓ TASK B: Displayed "No results" row');
        return;
    }
    
    data.forEach(record => {
        const row = document.createElement('tr');
        const value = typeof record['Value'] === 'string' ? parseFloat(record['Value']) : record['Value'];
        
        row.innerHTML = `
            <td>${record['Country Code'] || '-'}</td>
            <td>${record['Country Name'] || '-'}</td>
            <td>${record['Indicator Name'] || '-'}</td>
            <td class="num">${record['Year'] || '-'}</td>
            <td class="num">${isNaN(value) ? '-' : value.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    console.log(`✓ TASK B: Rendered ${data.length} rows`);
}

/**
 * TASK C: applyFilterSort()
 * - Read #filterInput (case-insensitive name match)
 * - Read #sortSelect; sort numbers descending, name ascending
 * - Call renderTable(filtered+sorted result)
 * - Update #rowCount
 */
function applyFilterSort() {
    const filterInput = document.getElementById('filterInput')?.value.toLowerCase() || '';
    const sortSelect = document.getElementById('sortSelect')?.value || 'none';
    
    // Filter
    let filtered = window.DS.filter(record =>
        record['Country Name']?.toLowerCase().includes(filterInput)
    );
    
    // Sort
    if (sortSelect !== 'none') {
        filtered.sort((a, b) => {
            if (sortSelect === 'country') {
                // Country name ascending (A-Z)
                return (a['Country Name'] || '').localeCompare(b['Country Name'] || '');
            } else if (sortSelect === 'value') {
                // Value descending (high-low)
                const valA = typeof a['Value'] === 'string' ? parseFloat(a['Value']) : a['Value'];
                const valB = typeof b['Value'] === 'string' ? parseFloat(b['Value']) : b['Value'];
                return (valB || 0) - (valA || 0);
            } else if (sortSelect === 'year') {
                // Year descending (most recent first)
                return parseInt(b['Year'] || 0) - parseInt(a['Year'] || 0);
            }
        });
    }
    
    renderTable(filtered);
    updateRowCount(filtered.length);
    console.log(`✓ TASK C: Applied filter="${filterInput}" sort="${sortSelect}" → ${filtered.length} results`);
}

/**
 * TASK D: resetTable()
 * - Clear inputs
 * - Call renderTable(window.DS)
 * - Update count
 */
function resetTable() {
    const filterInput = document.getElementById('filterInput');
    const sortSelect = document.getElementById('sortSelect');
    
    if (filterInput) filterInput.value = '';
    if (sortSelect) sortSelect.value = 'none';
    
    renderTable(window.DS);
    updateRowCount(window.DS.length);
    console.log('✓ TASK D: Reset table to original state');
}

/**
 * TASK E: renderSummaryCards(data)
 * - #cardMeanValue  → average of data.map(d=>d.Value)
 * - #cardHighest    → name of country with highest value
 * - #cardCountries  → count of unique countries
 * - #cardAvgYear    → average year represented
 */
function renderSummaryCards(data) {
    if (data.length === 0) {
        document.getElementById('cardMeanValue').textContent = '—';
        document.getElementById('cardHighest').textContent = '—';
        document.getElementById('cardCountries').textContent = '—';
        document.getElementById('cardAvgYear').textContent = '—';
        console.log('✓ TASK E: No data to summarize');
        return;
    }
    
    // Mean Value
    const validValues = data
        .map(d => typeof d['Value'] === 'string' ? parseFloat(d['Value']) : d['Value'])
        .filter(v => !isNaN(v));
    const meanValue = validValues.length > 0 
        ? (validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(2)
        : '—';
    document.getElementById('cardMeanValue').textContent = meanValue;
    
    // Highest Value Country
    const highest = data.reduce((max, d) => {
        const val = typeof d['Value'] === 'string' ? parseFloat(d['Value']) : d['Value'];
        const maxVal = typeof max['Value'] === 'string' ? parseFloat(max['Value']) : max['Value'];
        return (val || 0) > (maxVal || 0) ? d : max;
    });
    document.getElementById('cardHighest').textContent = highest['Country Name'] || '—';
    
    // Unique Countries Count
    const uniqueCountries = new Set(data.map(d => d['Country Code']).filter(x => x)).size;
    document.getElementById('cardCountries').textContent = uniqueCountries;
    
    // Average Year
    const years = data.map(d => parseInt(d['Year'])).filter(y => !isNaN(y));
    const avgYear = years.length > 0 
        ? Math.round(years.reduce((a, b) => a + b, 0) / years.length).toString()
        : '—';
    document.getElementById('cardAvgYear').textContent = avgYear;
    
    console.log('✓ TASK E: Rendered all summary cards');
}

/**
 * Helper: Update row count display
 */
function updateRowCount(count) {
    const rowCountEl = document.getElementById('rowCount');
    if (rowCountEl) {
        rowCountEl.textContent = count;
    }
}

function downloadFilteredData() {
    if (!filteredData || filteredData.length === 0) {
        alert('No filtered records are available to download.');
        return;
    }

    const headers = ['Country Code', 'Country Name', 'Indicator Name', 'Year', 'Value'];
    const rows = filteredData.map(item => [
        item['Country Code'] || '',
        item['Country Name'] || '',
        item['Indicator Name'] || '',
        item['Year'] || '',
        item['Value'] != null ? item['Value'] : ''
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'filtered_debt_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Wire up event listeners for Data Engine
document.addEventListener('DOMContentLoaded', () => {
    const applyBtn = document.getElementById('applyBtn');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const filterInput = document.getElementById('filterInput');
    
    if (applyBtn) applyBtn.addEventListener('click', applyFilterSort);
    if (resetBtn) resetBtn.addEventListener('click', resetTable);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadFilteredData);
    
    // Allow Enter key to apply filter
    if (filterInput) {
        filterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') applyFilterSort();
        });
    }
    
    console.log('✓ Data Engine event listeners wired up');
});

// ============================================================
// STUDENT 2 CONTRIBUTION — Visualization Layer (Part A)
// ============================================================

/**
 * drawBarChart(elementId, data)
 * - Sort data by value descending, take top 10
 * - Horizontal bar chart (type: 'bar', indexAxis: 'y')
 * - Labels = country names
 * - Bars = coral color #d94f3d at 80% opacity
 * - X-axis: 0–max value
 */
function drawBarChart(elementId, data) {
    if (!data || data.length === 0) {
        console.warn('No data for bar chart');
        return;
    }

    // Aggregate by country and sort
    const countryTotals = {};
    data.forEach(d => {
        if (d['Country Name'] && d['Value']) {
            const val = typeof d['Value'] === 'string' ? parseFloat(d['Value']) : d['Value'];
            if (!isNaN(val)) {
                countryTotals[d['Country Name']] = (countryTotals[d['Country Name']] || 0) + val;
            }
        }
    });

    const sorted = Object.entries(countryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reverse(); // Reverse for horizontal chart bottom-to-top

    const labels = sorted.map(item => item[0]);
    const values = sorted.map(item => item[1]);

    const ctx = document.getElementById(elementId);
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (barChart) {
        barChart.destroy();
        barChart = null;
    }

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Debt',
                data: values,
                backgroundColor: 'rgba(217, 79, 61, 0.8)',
                borderColor: '#d94f3d',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#e0e0e0',
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(217, 79, 61, 0.1)'
                    }
                },
                y: {
                    ticks: { color: '#e0e0e0' },
                    grid: { color: 'rgba(217, 79, 61, 0.1)' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.x.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    // Hide placeholder, show canvas
    const placeholder = document.getElementById(elementId + 'Placeholder');
    if (placeholder) placeholder.style.display = 'none';
    ctx.style.display = 'block';

    console.log('✓ drawBarChart: Rendered top 10 countries');
}

/**
 * drawScatterPlot(elementId, data)
 * - Points: { x: one metric, y: another metric }
 * - Color: sage green #3a7d5c
 * - Add regression line as second dataset
 */
function drawScatterPlot(elementId, data) {
    if (!data || data.length === 0) {
        console.warn('No data for scatter plot');
        return;
    }

    // Extract two dimensions for scatter
    // Use Value vs Year for X vs Y
    const points = data
        .filter(d => d['Value'] && d['Year'])
        .map(d => ({
            x: parseInt(d['Year']) || 0,
            y: typeof d['Value'] === 'string' ? parseFloat(d['Value']) : d['Value'],
            label: d['Country Name'] || ''
        }))
        .filter(p => !isNaN(p.x) && !isNaN(p.y))
        .slice(0, 100); // Limit to first 100 points for performance

    if (points.length < 2) {
        console.warn('Insufficient data for scatter plot');
        return;
    }

    // Calculate linear regression
    const regression = linearRegression(
        points.map(p => p.x),
        points.map(p => p.y)
    );

    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));

    const regressionLine = [
        { x: minX, y: regression.intercept + regression.slope * minX },
        { x: maxX, y: regression.intercept + regression.slope * maxX }
    ];

    const ctx = document.getElementById(elementId);
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (scatterChart) {
        scatterChart.destroy();
        scatterChart = null;
    }

    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Data Points',
                    data: points,
                    backgroundColor: 'rgba(58, 125, 92, 0.7)',
                    borderColor: '#3a7d5c',
                    borderWidth: 1,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'Regression Line',
                    data: regressionLine,
                    type: 'line',
                    borderColor: '#d94f3d',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    title: { display: true, text: 'Year', color: '#e0e0e0' },
                    ticks: { color: '#e0e0e0' },
                    grid: { color: 'rgba(58, 125, 92, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'Debt Value', color: '#e0e0e0' },
                    ticks: { color: '#e0e0e0' },
                    grid: { color: 'rgba(58, 125, 92, 0.1)' }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#e0e0e0' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label === 'Data Points') {
                                return context.raw.label + ': ' + context.raw.y.toLocaleString();
                            }
                            return 'y: ' + context.raw.y.toLocaleString();
                        }
                    }
                }
            }
        }
    });

    const placeholder = document.getElementById(elementId + 'Placeholder');
    if (placeholder) placeholder.style.display = 'none';
    ctx.style.display = 'block';

    console.log('✓ drawScatterPlot: Rendered with regression line');
}

/**
 * drawDoughnut(elementId, data)
 * - Count distribution by indicator type or category
 * - Use different colors
 * - cutout: '60%', show count + % in tooltip
 */
function drawDoughnut(elementId, data) {
    if (!data || data.length === 0) {
        console.warn('No data for doughnut chart');
        return;
    }

    // Count by indicator type
    const typeCounts = {};
    data.forEach(d => {
        const indicator = d['Indicator Name'] || 'Unknown';
        typeCounts[indicator] = (typeCounts[indicator] || 0) + 1;
    });

    const labels = Object.keys(typeCounts);
    const counts = Object.values(typeCounts);
    const colors = [
        'rgba(42, 122, 80, 0.8)',   // A - dark green
        'rgba(58, 110, 168, 0.8)',  // B - blue
        'rgba(181, 130, 13, 0.8)',  // C - gold
        'rgba(217, 79, 61, 0.8)',   // D - coral
        'rgba(100, 100, 180, 0.8)',
        'rgba(180, 100, 100, 0.8)',
        'rgba(100, 180, 100, 0.8)',
        'rgba(180, 180, 100, 0.8)'
    ];

    const ctx = document.getElementById(elementId);
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (doughnutChart) {
        doughnutChart.destroy();
        doughnutChart = null;
    }

    const totalCount = counts.reduce((a, b) => a + b, 0);

    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: '#0a0e27',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#e0e0e0',
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percent = ((value / totalCount) * 100).toFixed(1);
                            return label + ': ' + value + ' (' + percent + '%)';
                        }
                    }
                }
            }
        }
    });

    const placeholder = document.getElementById(elementId + 'Placeholder');
    if (placeholder) placeholder.style.display = 'none';
    ctx.style.display = 'block';

    console.log('✓ drawDoughnut: Rendered distribution');
}

// ============================================================
// STUDENT 2 CONTRIBUTION — Analysis Engine (Part B)
// ============================================================

/**
 * variance(arr) → σ² = Σ(xᵢ−μ)² / n
 */
function variance(arr) {
    if (!arr || arr.length === 0) return 0;
    
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const squaredDiffs = arr.map(x => Math.pow(x - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * stdDev(arr) → σ = √variance(arr)
 */
function stdDev(arr) {
    return Math.sqrt(variance(arr));
}

/**
 * pearsonCorr(x, y) → r = Σ((xᵢ−x̄)(yᵢ−ȳ)) / √(Σ(xᵢ−x̄)²·Σ(yᵢ−ȳ)²)
 */
function pearsonCorr(x, y) {
    if (!x || !y || x.length !== y.length || x.length < 2) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / x.length;
    const meanY = y.reduce((a, b) => a + b, 0) / y.length;

    let numerator = 0;
    let sumSqX = 0;
    let sumSqY = 0;

    for (let i = 0; i < x.length; i++) {
        const diffX = x[i] - meanX;
        const diffY = y[i] - meanY;
        numerator += diffX * diffY;
        sumSqX += diffX * diffX;
        sumSqY += diffY * diffY;
    }

    const denominator = Math.sqrt(sumSqX * sumSqY);
    return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * linearRegression(x, y) → { slope, intercept, rSquared }
 */
function linearRegression(x, y) {
    if (!x || !y || x.length !== y.length || x.length < 2) {
        return { slope: 0, intercept: 0, rSquared: 0 };
    }

    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
        numerator += (x[i] - meanX) * (y[i] - meanY);
        denominator += (x[i] - meanX) * (x[i] - meanX);
    }

    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = meanY - slope * meanX;

    const r = pearsonCorr(x, y);
    const rSquared = r * r;

    return { slope, intercept, rSquared };
}

/**
 * renderAnalysis(data)
 * - Extract values for statistical analysis
 * - Update all DOM stat elements
 */
function renderAnalysis(data) {
    if (!data || data.length === 0) {
        console.warn('No data for analysis');
        return;
    }

    // Extract numerical values
    const values = data
        .map(d => typeof d['Value'] === 'string' ? parseFloat(d['Value']) : d['Value'])
        .filter(v => !isNaN(v) && v !== null);

    if (values.length === 0) {
        console.warn('No valid numerical data for analysis');
        return;
    }

    // Calculate basic statistics
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const varVal = variance(values);
    const stdDevVal = stdDev(values);

    // Extract years and values for correlation analysis
    const years = data
        .map(d => parseInt(d['Year']))
        .filter(y => !isNaN(y));

    let corrVal = 0, rSquaredVal = 0, slopeVal = 0, interceptVal = 0;

    if (years.length >= 2 && years.length === values.length) {
        const regression = linearRegression(years, values);
        corrVal = pearsonCorr(years, values);
        rSquaredVal = regression.rSquared;
        slopeVal = regression.slope;
        interceptVal = regression.intercept;
    }

    // Update DOM elements
    document.getElementById('statMean').textContent = mean.toFixed(2);
    document.getElementById('statVariance').textContent = varVal.toFixed(2);
    document.getElementById('statStdDev').textContent = stdDevVal.toFixed(2);
    document.getElementById('statMin').textContent = minVal.toFixed(2);
    document.getElementById('statMax').textContent = maxVal.toFixed(2);
    document.getElementById('statCorr').textContent = corrVal.toFixed(3);
    document.getElementById('statRSquared').textContent = rSquaredVal.toFixed(3);
    document.getElementById('statSlope').textContent = slopeVal.toFixed(6);
    document.getElementById('statIntercept').textContent = interceptVal.toFixed(2);

    console.log('✓ renderAnalysis: Updated all statistics');
}

/**
 * renderInsights(data)
 * - Build narrative insights from computed statistics
 * - Display in #insightsBody with styled highlights
 */
function renderInsights(data) {
    if (!data || data.length === 0) {
        document.getElementById('insightsBody').innerHTML = 
            '<p>No data available for insights.</p>';
        return;
    }

    // Extract values
    const values = data
        .map(d => typeof d['Value'] === 'string' ? parseFloat(d['Value']) : d['Value'])
        .filter(v => !isNaN(v));

    if (values.length === 0) {
        document.getElementById('insightsBody').innerHTML = 
            '<p>No numerical data available for insights.</p>';
        return;
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDevVal = stdDev(values);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // Count by country
    const uniqueCountries = new Set(data.map(d => d['Country Name']).filter(x => x)).size;

    // Build narrative
    const insight = `
        <p>
            Based on <span class="highlight">${data.length}</span> records from 
            <span class="highlight">${uniqueCountries}</span> countries, we observe:
        </p>
        <p>
            The mean debt value is <span class="highlight">${mean.toFixed(2)}</span> with a 
            standard deviation of <span class="highlight">${stdDevVal.toFixed(2)}</span>. 
            Values range from <span class="highlight">${minVal.toFixed(2)}</span> to 
            <span class="highlight">${maxVal.toFixed(2)}</span>, indicating 
            ${stdDevVal > mean * 0.5 ? 'substantial variation' : 'relatively consistent'} 
            across the dataset.
        </p>
    `;

    document.getElementById('insightsBody').innerHTML = insight;
    console.log('✓ renderInsights: Generated narrative insights');
}
