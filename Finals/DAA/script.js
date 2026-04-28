// Global state
let allData = [];            // debt / time-series rows only
let filteredData = [];       // active filtered debt rows
let countryMetaData = [];    // country metadata rows only
let currentPage = 1;
const itemsPerPage = 10;

let topCountriesChart = null;
let debtTypeChart = null;
let trendsChart = null;
let regionalChart = null;
let barChart = null;
let regressionChart = null;
let scatterChart = null;
let doughnutChart = null;

window.DS = []; // Student 1 namespace

function onDataReady() {
    console.log('✓ Data Engine ready! Student 2 can initialize their code.');
}

// -------------------------
// Bootstrap
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard initialized');
    wireUpEventListeners();
    loadWorldBankData();
});

function wireUpEventListeners() {
    const applyBtn = document.getElementById('applyBtn');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const filterInput = document.getElementById('filterInput');
    const calculateCorrBtn = document.getElementById('calculateCorrBtn');
    const calculateRegBtn = document.getElementById('calculateRegBtn');

    if (applyBtn) applyBtn.addEventListener('click', applyFilterSort);
    if (resetBtn) resetBtn.addEventListener('click', resetTable);
    if (downloadBtn) downloadBtn.addEventListener('click', downloadFilteredData);
    if (filterInput) {
        filterInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') applyFilterSort();
        });
    }
    if (calculateCorrBtn) calculateCorrBtn.addEventListener('click', handleCorrelationCalculation);
    if (calculateRegBtn) calculateRegBtn.addEventListener('click', handleRegressionCalculation);

    console.log('✓ Data Engine event listeners wired up');
}

// -------------------------
// Data loading / parsing
// -------------------------
async function loadWorldBankData() {
    console.log('Starting to load World Bank data...');
    console.log('Current URL:', window.location.href);
    console.log('Protocol:', window.location.protocol);

    try {
        const r = await fetch('IDSData.csv');
        console.log('✓ Fetch successful! Response:', r.status, r.statusText);
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);

        const csv = await r.text();
        console.log('✓ CSV data received. Length:', csv.length, 'characters');
        console.log('First 200 chars:', csv.substring(0, 200));

        const result = parseCSVData(csv);

        if (result.type === 'timeseries') {
            allData = result.rows;
            filteredData = [...allData];
            window.DS = [...allData];

            console.log('✓ Parsed time-series data successfully! Records loaded:', allData.length);
            console.log('✓ Unique countries:', new Set(allData.map(d => d['Country Code'])).size);
            console.log('✓ Unique indicators:', new Set(allData.map(d => d['Indicator Code'])).size);
            console.log('Sample parsed records:', allData.slice(0, 3));

            updateDashboard();
            loadDataset();
        } else if (result.type === 'metadata') {
            countryMetaData = result.rows;
            console.log('✓ Parsed country metadata successfully! Rows loaded:', countryMetaData.length);
            console.warn('This file is country metadata, not a time-series debt dataset. Charts will stay idle until a time-series file is loaded.');
            populateRegressionDropdowns([]);
        } else {
            throw new Error('Unknown CSV format');
        }
    } catch (err) {
        console.warn('❌ Could not load CSV file:', err.message);
        console.warn('SOLUTION: Run a local server using: python -m http.server 8000');
        console.warn('Then open: http://localhost:8000/index.html');
        console.log('Loading sample data as fallback...');
        loadSampleData();
    }
}

function handleFileUpload(event) {
    const file = event.target.files?.[0];
    const statusDiv = document.getElementById('uploadStatus');
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
        if (statusDiv) {
            statusDiv.textContent = '❌ Please upload a valid CSV file';
            statusDiv.className = 'upload-status error';
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const csv = String(e.target.result || '');
            const result = parseCSVData(csv);

            if (result.type === 'timeseries') {
                allData = result.rows;
                filteredData = [...allData];
                window.DS = [...allData];
                updateDashboard();
                loadDataset();
                if (statusDiv) {
                    statusDiv.textContent = `✅ Successfully loaded ${allData.length} records!`;
                    statusDiv.className = 'upload-status success';
                }
            } else if (result.type === 'metadata') {
                countryMetaData = result.rows;
                populateRegressionDropdowns(allData);
                if (statusDiv) {
                    statusDiv.textContent = `✅ Successfully loaded ${countryMetaData.length} metadata rows!`;
                    statusDiv.className = 'upload-status success';
                }
                console.warn('Loaded metadata file. Load a time-series debt CSV to populate charts.');
            } else {
                throw new Error('Unknown CSV format');
            }
        } catch (error) {
            console.error('Error parsing CSV:', error);
            if (statusDiv) {
                statusDiv.textContent = '❌ Error parsing CSV file. Check console for details.';
                statusDiv.className = 'upload-status error';
            }
        }
    };
    reader.readAsText(file);
}

function parseCSVData(dataCSV) {
    const lines = String(dataCSV || '').split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) return { type: 'unknown', rows: [] };

    const headers = parseCSVLine(lines[0]);
    const yearColumns = headers.filter(h => /^\d{4}$/.test(h));
    const hasTimeSeriesShape = yearColumns.length > 0 && headers.includes('Indicator Name') && headers.includes('Indicator Code');
    const hasMetadataShape = headers.includes('Region') && headers.includes('Income Group') && !yearColumns.length;

    if (hasTimeSeriesShape) {
        return { type: 'timeseries', rows: parseTimeSeriesCSV(lines, headers, yearColumns) };
    }
    if (hasMetadataShape) {
        return { type: 'metadata', rows: parseMetadataCSV(lines, headers) };
    }
    return { type: 'unknown', rows: [] };
}

function parseTimeSeriesCSV(lines, headers, yearColumns) {
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < 4) continue;

        const countryName = (values[0] || '').trim();
        const countryCode = (values[1] || '').trim();
        const indicatorName = (values[2] || '').trim();
        const indicatorCode = (values[3] || '').trim();

        if (!countryName || !countryCode || !indicatorName || !indicatorCode) continue;

        for (const year of yearColumns) {
            const idx = headers.indexOf(year);
            if (idx < 0) continue;

            const raw = values[idx];
            const num = Number(raw);
            if (raw !== '' && Number.isFinite(num)) {
                rows.push({
                    'Country Code': countryCode,
                    'Country Name': countryName,
                    'Indicator Code': indicatorCode,
                    'Indicator Name': indicatorName,
                    'Year': year,
                    'Value': num
                });
            }
        }
    }
    return rows;
}

function parseMetadataCSV(lines, headers) {
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (!values.length) continue;

        const row = {};
        headers.forEach((h, idx) => {
            row[h] = values[idx] ?? '';
        });
        if (row['Country Code']) rows.push(row);
    }
    return rows;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"' && insideQuotes && next === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
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

// -------------------------
// Sample data
// -------------------------
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
        { 'Country Name': 'Italy', 'Country Code': 'ITA', 'Indicator Name': 'External Debt (% of GNI)', 'Indicator Code': 'DT.EXT.DECT.ZS', 'Year': '2020', 'Value': 24.7 },
        { 'Country Name': 'United States', 'Country Code': 'USA', 'Indicator Name': 'Debt Service (% of GNI)', 'Indicator Code': 'DT.TDS.DECT.GN.ZS', 'Year': '2020', 'Value': 8.2 },
        { 'Country Name': 'China', 'Country Code': 'CHN', 'Indicator Name': 'Debt Service (% of GNI)', 'Indicator Code': 'DT.TDS.DECT.GN.ZS', 'Year': '2020', 'Value': 5.1 },
        { 'Country Name': 'Japan', 'Country Code': 'JPN', 'Indicator Name': 'Debt Service (% of GNI)', 'Indicator Code': 'DT.TDS.DECT.GN.ZS', 'Year': '2020', 'Value': 12.3 },
        { 'Country Name': 'Germany', 'Country Code': 'DEU', 'Indicator Name': 'Debt Service (% of GNI)', 'Indicator Code': 'DT.TDS.DECT.GN.ZS', 'Year': '2020', 'Value': 9.8 },
        { 'Country Name': 'India', 'Country Code': 'IND', 'Indicator Name': 'Debt Service (% of GNI)', 'Indicator Code': 'DT.TDS.DECT.GN.ZS', 'Year': '2020', 'Value': 8.9 }
    ];

    filteredData = [...allData];
    window.DS = [...allData];
    updateDashboard();
    loadDataset();
}

// -------------------------
// Dashboard pipeline
// -------------------------
function updateDashboard() {
    if (!allData.length) return;
    updateStatistics();
    populateFilters();
    updateCharts();
    displayTableData();
}

function updateStatistics() {
    const rows = allData.filter(isDebtRow);
    let uniqueCountries = new Set();
    let uniqueIndicators = new Set();
    let minYear = Infinity;
    let maxYear = -Infinity;

    for (const d of rows) {
        if (d['Country Code']) uniqueCountries.add(d['Country Code']);
        if (d['Indicator Code']) uniqueIndicators.add(d['Indicator Code']);
        const year = Number(d['Year']);
        if (Number.isFinite(year)) {
            if (year < minYear) minYear = year;
            if (year > maxYear) maxYear = year;
        }
    }

    setText('countryCount', uniqueCountries.size.toLocaleString());
    setText('recordCount', rows.length.toLocaleString());
    setText('categoryCount', uniqueIndicators.size.toLocaleString());
    setText('yearRange', (minYear !== Infinity && maxYear !== -Infinity) ? `${minYear}-${maxYear}` : '—');
}

function populateFilters() {
    const rows = allData.filter(isDebtRow);

    const debtTypes = [...new Set(rows.map(d => d['Indicator Name']).filter(Boolean))].sort();
    const debtTypeFilter = document.getElementById('debtTypeFilter');
    if (debtTypeFilter) {
        debtTypeFilter.innerHTML = '<option value="">All Indicators</option>';
        for (const type of debtTypes) {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            debtTypeFilter.appendChild(option);
        }
    }

    const countries = [...new Set(rows.map(d => d['Country Name']).filter(Boolean))].sort();
    let countryDatalist = document.getElementById('countryList');
    if (!countryDatalist) {
        countryDatalist = document.createElement('datalist');
        countryDatalist.id = 'countryList';
        document.body.appendChild(countryDatalist);
    }
    countryDatalist.innerHTML = '';
    for (const country of countries) {
        const option = document.createElement('option');
        option.value = country;
        countryDatalist.appendChild(option);
    }

    const years = [...new Set(rows.map(d => Number(d['Year'])).filter(Number.isFinite))].sort((a, b) => b - a).map(String);
    const yearFilter = document.getElementById('yearFilter');
    if (yearFilter && yearFilter.tagName === 'SELECT') {
        yearFilter.innerHTML = '<option value="">All Years</option>';
        for (const year of years) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        }
    }

    const countryInput = document.getElementById('countryFilter');
    if (countryInput) countryInput.setAttribute('list', 'countryList');
}

function filterData() {
    const countryFilter = (document.getElementById('countryFilter')?.value || '').toLowerCase();
    const debtTypeFilter = document.getElementById('debtTypeFilter')?.value || '';
    const yearFilter = document.getElementById('yearFilter')?.value || '';

    filteredData = allData.filter(item => {
        if (!isDebtRow(item)) return false;
        const countryMatch = !countryFilter ||
            (item['Country Name'] && item['Country Name'].toLowerCase().includes(countryFilter)) ||
            (item['Country Code'] && item['Country Code'].toLowerCase().includes(countryFilter));
        const typeMatch = !debtTypeFilter || item['Indicator Name'] === debtTypeFilter;
        const yearMatch = !yearFilter || String(item['Year']) === String(yearFilter);
        return countryMatch && typeMatch && yearMatch;
    });

    currentPage = 1;
    updateCharts();
    displayTableData();
}

function updateCharts() {
    const chartRows = getChartRows(filteredData);
    if (!chartRows.length) {
        clearCharts();
        return;
    }
    updateTopCountriesChart(chartRows);
    drawBarChart('barChart', chartRows);
    updateDebtTypeChart(chartRows);
    updateTrendsChart(chartRows);
    updateRegionalChart(chartRows);
    initAdditionalCharts(chartRows);
}

function clearCharts() {
    for (const c of [topCountriesChart, debtTypeChart, trendsChart, regionalChart, barChart, regressionChart, scatterChart, doughnutChart]) {
        if (c && typeof c.destroy === 'function') {
            try { c.destroy(); } catch (_) {}
        }
    }
}

function getChartRows(data) {
    const rows = data.filter(isDebtRow);
    const typeFilter = document.getElementById('debtTypeFilter')?.value || '';
    const yearFilter = document.getElementById('yearFilter')?.value || '';

    let out = rows;
    if (typeFilter) out = out.filter(r => r['Indicator Name'] === typeFilter);
    if (yearFilter) {
        out = out.filter(r => String(r['Year']) === String(yearFilter));
    } else if (out.length) {
        const latestYear = maxOf(out.map(r => Number(r['Year'])));
        if (Number.isFinite(latestYear)) out = out.filter(r => Number(r['Year']) === latestYear);
    }
    return out;
}

function getLatestYearRows(data) {
    const rows = data.filter(isDebtRow);
    if (!rows.length) return [];
    const latestYear = maxOf(rows.map(r => Number(r['Year'])));
    return rows.filter(r => Number(r['Year']) === latestYear);
}

function updateTopCountriesChart(data) {
    const rows = data.filter(isDebtRow);
    if (!rows.length) return;

    const countryTotals = groupSum(rows, r => r['Country Name'], r => Number(r['Value']));
    const entries = Object.entries(countryTotals).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const labels = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);

    const ctx = document.getElementById('topCountriesChart');
    if (!ctx) return;
    safeDestroy(topCountriesChart);

    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 16, 240, 0.3)');

    topCountriesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Debt Value',
                data: values,
                backgroundColor: gradient,
                borderColor: 'rgba(0, 240, 255, 1)',
                borderWidth: 2,
                hoverBackgroundColor: 'rgba(57, 255, 20, 0.8)'
            }]
        },
        options: makeBarOptions(false)
    });
}

function drawBarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    const rows = data.filter(isDebtRow);
    if (!rows.length) return;

    const entries = Object.entries(groupSum(rows, r => r['Country Name'], r => Number(r['Value'])))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const labels = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);

    safeDestroy(barChart);
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Debt Value',
                data: values,
                backgroundColor: 'rgba(217,79,61,0.8)',
                borderColor: 'rgba(217,79,61,1)',
                borderWidth: 1
            }]
        },
        options: makeBarOptions(true)
    });

    const placeholder = document.getElementById('barPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    ctx.style.display = 'block';
}

function updateDebtTypeChart(data) {
    const rows = data.filter(isDebtRow);
    if (!rows.length) return;

    const counts = groupCount(rows, r => r['Indicator Name']);
    const labels = Object.keys(counts);
    const values = Object.values(counts);
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
    safeDestroy(debtTypeChart);

    debtTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
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
                    labels: { color: '#e0e0e0', font: { size: 11 }, padding: 15 }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
                        }
                    }
                }
            }
        }
    });
}

function updateTrendsChart(data) {
    const rows = data.filter(isDebtRow);
    if (!rows.length) return;

    const byYear = groupSum(rows, r => Number(r['Year']), r => Number(r['Value']));
    const entries = Object.entries(byYear)
        .map(([k, v]) => [Number(k), v])
        .filter(([k]) => Number.isFinite(k))
        .sort((a, b) => a[0] - b[0]);

    if (!entries.length) return;

    const labels = entries.map(([k]) => k);
    const values = entries.map(([, v]) => v);

    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    safeDestroy(trendsChart);

    trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Average / Total Debt Value by Year',
                data: values,
                borderColor: 'rgba(0, 240, 255, 1)',
                backgroundColor: 'rgba(0, 240, 255, 0.1)',
                tension: 0.2,
                pointRadius: 4
            }]
        },
        options: makeLineOptions('Year', 'Debt Value')
    });
}

function updateRegionalChart(data) {
    const rows = data.filter(isDebtRow);
    if (!rows.length || !countryMetaData.length) {
        console.log('✓ Regional chart updated');
        return;
    }

    const latestRows = getLatestYearRows(rows);
    const byRegion = {};

    for (const row of latestRows) {
        const meta = countryMetaData.find(c => c['Country Code'] === row['Country Code']);
        const region = meta?.['Region'] || 'Unknown';
        if (!byRegion[region]) byRegion[region] = [];
        byRegion[region].push(Number(row['Value']));
    }

    const labels = Object.keys(byRegion);
    const values = labels.map(region => {
        const arr = byRegion[region].filter(Number.isFinite);
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    });

    const ctx = document.getElementById('regionalChart');
    if (!ctx) return;
    safeDestroy(regionalChart);

    regionalChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Average Debt Value by Region',
                data: values,
                backgroundColor: 'rgba(181, 55, 242, 0.8)',
                borderColor: 'rgba(181, 55, 242, 1)',
                borderWidth: 1
            }]
        },
        options: makeBarOptions(false)
    });

    console.log('✓ Regional chart updated');
}

function initAdditionalCharts(data) {
    drawScatterPlot('scatterChart', data);
    drawDoughnut('doughnutChart', data);
}

function drawScatterPlot(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const countryCode = document.getElementById('regCountry')?.value || firstCountryCode(data);
    const indicatorName = document.getElementById('debtTypeFilter')?.value || firstIndicatorName(data, countryCode);

    const points = getCountryIndicatorSeries(data, countryCode, indicatorName);
    if (points.length < 2) return;

    safeDestroy(scatterChart);

    const regression = calculateLinearRegression(points);
    const { min: minYear, max: maxYear } = minMax(points.map(p => p.x));
    const regressionLine = [
        { x: minYear, y: regression.slope * minYear + regression.intercept },
        { x: maxYear, y: regression.slope * maxYear + regression.intercept }
    ];

    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Debt Values',
                    data: points,
                    backgroundColor: 'rgba(0, 240, 255, 0.8)',
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Trend Line',
                    data: regressionLine,
                    type: 'line',
                    borderColor: 'rgba(255, 16, 240, 1)',
                    backgroundColor: 'rgba(255, 16, 240, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    pointRadius: 0,
                    tension: 0,
                    showLine: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Debt Trends Over Time${countryCode ? ` - ${countryCode}` : ''}`,
                    color: '#e0e0e0',
                    font: { size: 16, weight: 'bold' }
                },
                legend: { labels: { color: '#e0e0e0' } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `Year: ${ctx.parsed.x}, Value: ${ctx.parsed.y.toLocaleString()}`
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'Year', color: '#e0e0e0' },
                    ticks: { color: '#e0e0e0', callback: v => Math.round(v) },
                    grid: { color: 'rgba(0, 240, 255, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'Debt Value', color: '#e0e0e0' },
                    ticks: { color: '#e0e0e0', callback: v => v.toLocaleString() },
                    grid: { color: 'rgba(0, 240, 255, 0.1)' }
                }
            }
        }
    });

    const placeholder = document.getElementById('scatterPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    ctx.style.display = 'block';
}

function drawDoughnut(canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const rows = data.filter(isDebtRow);
    if (!rows.length) return;

    const counts = groupCount(rows, r => r['Indicator Name']);
    const labels = Object.keys(counts);
    const values = Object.values(counts);
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

    safeDestroy(doughnutChart);
    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderColor: '#0a0e27',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                title: {
                    display: true,
                    text: 'Debt Indicator Distribution',
                    color: '#e0e0e0',
                    font: { size: 16, weight: 'bold' }
                },
                legend: { labels: { color: '#e0e0e0' } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total ? ((ctx.parsed / total) * 100).toFixed(1) : '0.0';
                            return `${ctx.label}: ${ctx.parsed} records (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    const placeholder = document.getElementById('doughnutPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    ctx.style.display = 'block';
}

// -------------------------
// Data engine tasks
// -------------------------
function loadDataset() {
    window.DS = [...allData];
    console.log(`✓ TASK A: Loaded ${window.DS.length} debt records into window.DS`);
    console.log('Sample records:', window.DS.slice(0, 3));

    renderTable(window.DS);
    renderSummaryCards(window.DS);
    updateStatisticsDisplay(window.DS);
    updateRegressionDropdown(window.DS);
    onDataReady();
    updateRowCount(window.DS.length);
}

function renderTable(data) {
    filteredData = Array.isArray(data) ? [...data] : [];
    currentPage = 1;
    displayTableData();
    console.log(`✓ TASK B: Rendered ${filteredData.length} rows`);
}

function applyFilterSort() {
    const filterInput = (document.getElementById('filterInput')?.value || '').toLowerCase();
    const sortSelect = document.getElementById('sortSelect')?.value || 'none';

    let filtered = window.DS.filter(record =>
        !filterInput || (record['Country Name'] || '').toLowerCase().includes(filterInput)
    );

    if (sortSelect !== 'none') {
        filtered.sort((a, b) => {
            if (sortSelect === 'country') {
                return (a['Country Name'] || '').localeCompare(b['Country Name'] || '');
            }
            if (sortSelect === 'value') {
                return toNumber(b['Value']) - toNumber(a['Value']);
            }
            if (sortSelect === 'year') {
                return toNumber(b['Year']) - toNumber(a['Year']);
            }
            return 0;
        });
    }

    renderTable(filtered);
    updateRowCount(filtered.length);
    console.log(`✓ TASK C: Applied filter="${filterInput}" sort="${sortSelect}" → ${filtered.length} results`);
}

function resetTable() {
    const filterInput = document.getElementById('filterInput');
    const sortSelect = document.getElementById('sortSelect');
    if (filterInput) filterInput.value = '';
    if (sortSelect) sortSelect.value = 'none';

    renderTable(window.DS);
    updateRowCount(window.DS.length);
    console.log('✓ TASK D: Reset table to original state');
}

function renderSummaryCards(data) {
    const rows = Array.isArray(data) ? data.filter(isDebtRow) : [];
    console.log('renderSummaryCards called with', rows.length, 'records');

    if (!rows.length) {
        setText('cardMeanValue', '—');
        setText('cardHighest', '—');
        setText('cardCountries', '—');
        setText('cardAvgYear', '—');
        console.log('✓ TASK E: No data to summarize');
        return;
    }

    const values = rows.map(r => toNumber(r['Value'])).filter(Number.isFinite);
    const meanValue = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '—';
    setText('cardMeanValue', meanValue);

    let highest = rows[0];
    for (const r of rows) {
        if (toNumber(r['Value']) > toNumber(highest['Value'])) highest = r;
    }
    setText('cardHighest', highest['Country Name'] || '—');
    setText('cardCountries', new Set(rows.map(r => r['Country Code']).filter(Boolean)).size.toString());

    const years = rows.map(r => toNumber(r['Year'])).filter(Number.isFinite);
    const avgYear = years.length ? Math.round(years.reduce((a, b) => a + b, 0) / years.length) : '—';
    setText('cardAvgYear', String(avgYear));

    console.log('About to populate correlation and regression dropdowns...');
    populateCorrelationDropdowns(rows);
    populateRegressionDropdowns(rows);
    console.log('✓ TASK E: Rendered all summary cards and statistical analysis');
}

function updateStatisticsDisplay(data) {
    console.log('updateStatisticsDisplay called with', Array.isArray(data) ? data.length : 0, 'records');
    const stats = calculateDescriptiveStats(data);
    setText('statMean', stats.mean);
    setText('statMedian', stats.median);
    setText('statStdDev', stats.stdDeviation);
    setText('statMax', stats.max);
    setText('statMin', stats.min);
    setText('statCount', stats.count.toLocaleString());
    console.log('✓ Statistics section updated');
}

function updateRegressionDropdown(data) {
    populateRegressionDropdowns(data);
}

function populateCorrelationDropdowns(data) {
    const rows = Array.isArray(data) ? data.filter(isDebtRow) : [];
    const indicators = [...new Set(rows.map(d => d['Indicator Name']).filter(x => x && x.trim() !== ''))].sort();
    const ind1Select = document.getElementById('corrIndicator1');
    const ind2Select = document.getElementById('corrIndicator2');

    if (ind1Select && ind2Select) {
        ind1Select.innerHTML = '<option value="">Select Indicator</option>';
        ind2Select.innerHTML = '<option value="">Select Indicator</option>';
        for (const indicator of indicators) {
            const option1 = document.createElement('option');
            option1.value = indicator;
            option1.textContent = indicator;
            ind1Select.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = indicator;
            option2.textContent = indicator;
            ind2Select.appendChild(option2);
        }
    }
}

function populateRegressionDropdowns(data) {
    const countrySelect = document.getElementById('regCountry');
    if (!countrySelect) return;

    const rows = Array.isArray(data) ? data.filter(isDebtRow) : [];
    const options = [];

    if (countryMetaData.length) {
        const seen = new Set();
        for (const meta of countryMetaData) {
            const code = meta['Country Code'];
            const name = meta['Short Name'] || meta['Long Name'] || code;
            if (!code || seen.has(code)) continue;
            seen.add(code);
            options.push({ value: code, label: name });
        }
    }

    if (!options.length) {
        const seen = new Set();
        for (const row of rows) {
            const code = row['Country Code'];
            const name = row['Country Name'] || code;
            if (!code || seen.has(code)) continue;
            seen.add(code);
            options.push({ value: code, label: name });
        }
    }

    countrySelect.innerHTML = '<option value="">Select Country</option>';
    for (const opt of options.sort((a, b) => a.label.localeCompare(b.label))) {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        countrySelect.appendChild(option);
    }
}

function updateRowCount(count) {
    setText('rowCount', String(count));
}

function downloadFilteredData() {
    if (!filteredData || !filteredData.length) {
        alert('No filtered records are available to download.');
        return;
    }

    const headers = ['Country Code', 'Country Name', 'Indicator Name', 'Year', 'Value'];
    const rows = filteredData.filter(isDebtRow).map(item => [
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

// -------------------------
// Table display / pagination
// -------------------------
function displayTableData() {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const rows = Array.isArray(filteredData) ? filteredData.filter(isDebtRow) : [];
    const totalPages = Math.max(1, Math.ceil(rows.length / itemsPerPage));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);

    const start = (currentPage - 1) * itemsPerPage;
    const pageData = rows.slice(start, start + itemsPerPage);

    if (!pageData.length) {
        tableBody.innerHTML = '<tr><td colspan="5" class="no-results">No results found</td></tr>';
    } else {
        for (const item of pageData) {
            const row = tableBody.insertRow();
            const value = toNumber(item['Value']);
            row.innerHTML = `
                <td>${escapeHtml(item['Country Code'] || '-')}</td>
                <td>${escapeHtml(item['Country Name'] || '-')}</td>
                <td>${escapeHtml(item['Indicator Name'] || '-')}</td>
                <td class="num">${escapeHtml(item['Year'] || '-')}</td>
                <td class="num">${Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}</td>
            `;
        }
    }

    const pageInfoEl = document.getElementById('pageInfo');
    if (pageInfoEl) pageInfoEl.textContent = `Page ${currentPage} of ${totalPages}`;
}

function nextPage() {
    const totalPages = Math.max(1, Math.ceil((filteredData.filter(isDebtRow)).length / itemsPerPage));
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

// -------------------------
// Statistics / helpers
// -------------------------
function calculateDescriptiveStats(data) {
    const rows = Array.isArray(data) ? data.filter(isDebtRow) : [];
    if (!rows.length) {
        return { mean: '—', median: '—', stdDeviation: '—', max: '—', min: '—', count: 0 };
    }

    const values = rows.map(d => toNumber(d['Value'])).filter(Number.isFinite).sort((a, b) => a - b);
    if (!values.length) {
        return { mean: '—', median: '—', stdDeviation: '—', max: '—', min: '—', count: 0 };
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const mid = Math.floor(values.length / 2);
    const median = values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
    const stdDeviation = stdDev(values);
    const { min, max } = minMax(values);

    return {
        mean: mean.toFixed(2),
        median: median.toFixed(2),
        stdDeviation: stdDeviation.toFixed(2),
        max: max.toFixed(2),
        min: min.toFixed(2),
        count: values.length
    };
}

function calculateCorrelation(data, indicator1, indicator2) {
    const rows = Array.isArray(data) ? data.filter(isDebtRow) : [];
    if (!rows.length || !indicator1 || !indicator2) {
        return { coefficient: null, interpretation: 'Insufficient data' };
    }

    const pairs = [];
    const dataMap = new Map();
    for (const record of rows) {
        const key = `${record['Country Code']}-${record['Year']}`;
        if (!dataMap.has(key)) dataMap.set(key, {});
        dataMap.get(key)[record['Indicator Name']] = toNumber(record['Value']);
    }

    dataMap.forEach(values => {
        if (Number.isFinite(values[indicator1]) && Number.isFinite(values[indicator2])) {
            pairs.push({ x: values[indicator1], y: values[indicator2] });
        }
    });

    if (pairs.length < 2) {
        return { coefficient: null, interpretation: 'Insufficient data pairs' };
    }

    const xs = pairs.map(p => p.x);
    const ys = pairs.map(p => p.y);
    const r = pearsonCorr(xs, ys);

    let interpretation = '';
    const absCoeff = Math.abs(r);
    if (absCoeff >= 0.8) interpretation = 'Very strong ';
    else if (absCoeff >= 0.6) interpretation = 'Strong ';
    else if (absCoeff >= 0.4) interpretation = 'Moderate ';
    else if (absCoeff >= 0.2) interpretation = 'Weak ';
    else interpretation = 'Very weak ';
    interpretation += r > 0 ? 'positive correlation' : 'negative correlation';

    return { coefficient: r.toFixed(3), interpretation };
}

function calculateLinearRegression(points) {
    if (!Array.isArray(points) || points.length < 2) {
        return { slope: 0, intercept: 0, rSquared: 0, error: 'Need at least 2 data points' };
    }

    const xs = points.map(p => toNumber(p.x)).filter(Number.isFinite);
    const ys = points.map(p => toNumber(p.y)).filter(Number.isFinite);
    if (xs.length < 2 || ys.length < 2 || xs.length !== ys.length) {
        return { slope: 0, intercept: 0, rSquared: 0, error: 'Insufficient valid data points' };
    }

    const n = xs.length;
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
    const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);
    const sumY2 = ys.reduce((sum, y) => sum + y * y, 0);

    const denom = (n * sumX2 - sumX * sumX);
    if (denom === 0) {
        return { slope: 0, intercept: sumY / n, rSquared: 0, error: 'No variation in x values' };
    }

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    const yMean = sumY / n;
    const ssRes = xs.reduce((sum, x, i) => sum + Math.pow(ys[i] - (slope * x + intercept), 2), 0);
    const ssTot = ys.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

    return {
        slope: Number.isFinite(slope) ? Number(slope.toFixed(4)) : 0,
        intercept: Number.isFinite(intercept) ? Number(intercept.toFixed(4)) : 0,
        rSquared: Number.isFinite(rSquared) ? Number(rSquared.toFixed(4)) : 0
    };
}

function updateDescriptiveStats(data) {
    const stats = calculateDescriptiveStats(data);
    setText('statMean', stats.mean);
    setText('statMedian', stats.median);
    setText('statStdDev', stats.stdDeviation);
    setText('statMax', stats.max);
    setText('statMin', stats.min);
    setText('statCount', stats.count.toLocaleString());
}

function handleCorrelationCalculation() {
    const ind1 = document.getElementById('corrIndicator1')?.value || '';
    const ind2 = document.getElementById('corrIndicator2')?.value || '';

    if (!ind1 || !ind2) {
        setText('correlationResult', '—');
        setText('correlationInterpretation', 'Please select both indicators');
        return;
    }

    const result = calculateCorrelation(filteredData, ind1, ind2);
    setText('correlationResult', result.coefficient || '—');
    setText('correlationInterpretation', result.interpretation);
}

function handleRegressionCalculation() {
    console.log('handleRegressionCalculation called');

    const countryCode = document.getElementById('regCountry')?.value || '';
    const countryName = displayNameForCountry(countryCode);
    const indicatorName = document.getElementById('debtTypeFilter')?.value || firstIndicatorName(filteredData, countryCode);

    if (!countryCode) {
        console.warn('No country selected');
        setText('regressionSlope', '—');
        setText('regressionIntercept', '—');
        setText('regressionRSquared', '—');
        alert('Please select a country');
        return;
    }

    const series = getCountryIndicatorSeries(filteredData, countryCode, indicatorName);
    if (series.length < 2) {
        setText('regressionSlope', '—');
        setText('regressionIntercept', '—');
        setText('regressionRSquared', '—');
        alert('Need at least 2 data points for regression');
        return;
    }

    const result = calculateLinearRegression(series);
    if (result.error) {
        setText('regressionSlope', '—');
        setText('regressionIntercept', '—');
        setText('regressionRSquared', '—');
        alert('Error: ' + result.error);
        return;
    }

    setText('regressionSlope', String(result.slope));
    setText('regressionIntercept', String(result.intercept));
    setText('regressionRSquared', String(result.rSquared));
    drawRegressionChart(series, result.slope, result.intercept, countryName, indicatorName);
}

function drawRegressionChart(points, slope, intercept, countryName, indicatorName) {
    const ctx = document.getElementById('regressionChart');
    if (!ctx || !Array.isArray(points) || points.length < 2) return;
    safeDestroy(regressionChart);

    const sorted = [...points].sort((a, b) => a.x - b.x);
    const { min, max } = minMax(sorted.map(p => p.x));
    const trendLine = [
        { x: min, y: slope * min + intercept },
        { x: max, y: slope * max + intercept }
    ];

    regressionChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Data Points',
                    data: sorted,
                    backgroundColor: 'rgba(0, 240, 255, 0.8)',
                    borderColor: 'rgba(0, 240, 255, 1)',
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Trend Line',
                    data: trendLine,
                    type: 'line',
                    borderColor: 'rgba(255, 16, 240, 1)',
                    backgroundColor: 'rgba(255, 16, 240, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    pointRadius: 0,
                    showLine: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Linear Regression: ${countryName}${indicatorName ? ` - ${indicatorName}` : ''}`,
                    color: '#e0e0e0',
                    font: { size: 16, weight: 'bold' }
                },
                legend: { labels: { color: '#e0e0e0' } }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'Year', color: '#e0e0e0' },
                    ticks: { color: '#e0e0e0', callback: v => Math.round(v) },
                    grid: { color: 'rgba(0, 240, 255, 0.1)' }
                },
                y: {
                    title: { display: true, text: 'Debt Value', color: '#e0e0e0' },
                    ticks: { color: '#e0e0e0', callback: v => v.toLocaleString() },
                    grid: { color: 'rgba(0, 240, 255, 0.1)' }
                }
            }
        }
    });

    const placeholder = document.getElementById('regressionPlaceholder');
    if (placeholder) placeholder.style.display = 'none';
    ctx.style.display = 'block';
}

// -------------------------
// Utilities
// -------------------------
function isDebtRow(row) {
    return !!row &&
        row['Country Code'] &&
        row['Country Name'] &&
        row['Indicator Code'] &&
        row['Indicator Name'] &&
        Number.isFinite(toNumber(row['Year'])) &&
        Number.isFinite(toNumber(row['Value']));
}

function toNumber(v) {
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) ? n : NaN;
}

function safeDestroy(chart) {
    if (chart && typeof chart.destroy === 'function') {
        try { chart.destroy(); } catch (_) {}
    }
}

function minMax(arr) {
    const values = Array.isArray(arr) ? arr.filter(Number.isFinite) : [];
    if (!values.length) return { min: 0, max: 0 };
    let min = values[0];
    let max = values[0];
    for (const v of values) {
        if (v < min) min = v;
        if (v > max) max = v;
    }
    return { min, max };
}

function maxOf(arr) {
    const values = Array.isArray(arr) ? arr.filter(Number.isFinite) : [];
    if (!values.length) return NaN;
    let max = values[0];
    for (const v of values) if (v > max) max = v;
    return max;
}

function groupSum(rows, keyFn, valFn) {
    const out = {};
    for (const row of rows) {
        const key = keyFn(row);
        const val = valFn(row);
        if (!key || !Number.isFinite(val)) continue;
        out[key] = (out[key] || 0) + val;
    }
    return out;
}

function groupCount(rows, keyFn) {
    const out = {};
    for (const row of rows) {
        const key = keyFn(row);
        if (!key) continue;
        out[key] = (out[key] || 0) + 1;
    }
    return out;
}

function firstCountryCode(data) {
    const rows = Array.isArray(data) ? data.filter(isDebtRow) : [];
    return rows[0]?.['Country Code'] || '';
}

function firstIndicatorName(data, countryCode = '') {
    const rows = Array.isArray(data) ? data.filter(isDebtRow) : [];
    const filtered = countryCode ? rows.filter(r => r['Country Code'] === countryCode) : rows;
    return filtered[0]?.['Indicator Name'] || '';
}

function getCountryIndicatorSeries(data, countryCode, indicatorName = '') {
    const rows = Array.isArray(data) ? data.filter(isDebtRow) : [];
    return rows
        .filter(r => r['Country Code'] === countryCode && (!indicatorName || r['Indicator Name'] === indicatorName))
        .map(r => ({ x: toNumber(r['Year']), y: toNumber(r['Value']) }))
        .filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
        .sort((a, b) => a.x - b.x);
}

function displayNameForCountry(countryCode) {
    if (!countryCode) return 'Selected Country';
    const meta = countryMetaData.find(c => c['Country Code'] === countryCode);
    return meta?.['Short Name'] || meta?.['Long Name'] || countryCode;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function meanf(arr) {
    if (!arr || arr.length === 0) return 0;
    return Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 100) / 100;
}

function variance(arr) {
    if (!arr || arr.length === 0) return 0;
    const mu = meanf(arr);
    const squaredDiffs = arr.map(x => Math.pow(x - mu, 2));
    const sum = squaredDiffs.reduce((a, b) => a + b, 0);
    return Math.round((sum / arr.length) * 100) / 100;
}

function stdDev(arr) {
    return Math.round(Math.sqrt(variance(arr)) * 100) / 100;
}

function pearsonCorr(x, y) {
    if (!x || !y || x.length !== y.length || x.length === 0) return 0;
    const mx = meanf(x), my = meanf(y);
    let num = 0, denomX = 0, denomY = 0;
    for (let i = 0; i < x.length; i++) {
        const dx = x[i] - mx;
        const dy = y[i] - my;
        num += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
    }
    const denom = Math.sqrt(denomX * denomY);
    const r = denom === 0 ? 0 : num / denom;
    return Math.round(r * 10000) / 10000;
}

function makeBarOptions(showLegend) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    callback: value => Number(value).toLocaleString(),
                    color: '#e0e0e0'
                },
                grid: { color: 'rgba(0, 240, 255, 0.1)' }
            },
            y: {
                ticks: { color: '#e0e0e0', autoSkip: false },
                grid: { color: 'rgba(0, 240, 255, 0.1)' }
            }
        },
        plugins: {
            legend: { display: showLegend }
        }
    };
}

function makeLineOptions(xTitle, yTitle) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#e0e0e0' } },
            title: { display: false }
        },
        scales: {
            x: {
                title: { display: true, text: xTitle, color: '#e0e0e0' },
                ticks: { color: '#e0e0e0' },
                grid: { color: 'rgba(0, 240, 255, 0.1)' }
            },
            y: {
                title: { display: true, text: yTitle, color: '#e0e0e0' },
                ticks: { color: '#e0e0e0', callback: v => Number(v).toLocaleString() },
                grid: { color: 'rgba(0, 240, 255, 0.1)' }
            }
        }
    };
}


/**
 * Helper function - mean of a numeric array
 */
function meanf(arr) {
    if (!arr || arr.length === 0) return 0;
    return Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 100) / 100;
}

/**
 * Helper function - median of a numeric array
 */
function medianf    (arr) {
    if (!arr || arr.length === 0) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 === 0
        ? Math.round(((s[m - 1] + s[m]) / 2) * 100) / 100
        : s[m];
}
