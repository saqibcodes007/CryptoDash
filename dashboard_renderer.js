// dashboard_renderer.js (With corrected Tooltip logic)

document.addEventListener('DOMContentLoaded', () => {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js failed to load. Please check the script tag in dashboard.html');
        return;
    }

    // --- DOM Element References ---
    const positionsTableBody = document.getElementById('positions-table-body');
    const statusIndicator = document.getElementById('status-indicator');
    const lastUpdatedEl = document.getElementById('last-updated');
    const totalPnlValueEl = document.getElementById('total-pnl-value');
    const avgPnlPercentEl = document.getElementById('avg-pnl-percent');
    const totalMarginValueEl = document.getElementById('total-margin-value');
    const chartCanvas = document.getElementById('pnlChart').getContext('2d');
    const resetButton = document.getElementById('reset-button');
    const themeToggle = document.getElementById('theme-toggle');

    let pnlChart = null;
    let credentials = null;
    let chartData = {
        labels: [],
        pnlHistory: [],
        pnlAbsoluteHistory: []
    };
    const MAX_CHART_POINTS = 100;

    // --- Main Data Fetch and Display Function ---
    async function fetchAndDisplayData() {
        if (!credentials) return;
        statusIndicator.classList.add('loading');
        try {
            const positions = await window.api.invoke('get-positions', credentials);
            updateUI(positions);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            lastUpdatedEl.textContent = `Error refreshing.`;
        } finally {
            statusIndicator.classList.remove('loading');
        }
    }

    // --- UI Update Functions ---
    function updateUI(positions) {
        if (positions && !positions.error) {
            let totalMargin = 0;
            let totalPnl = 0;
            
            positions.forEach(pos => {
                const margin = parseFloat(pos.margin || 0);
                const pnl = pos.unrealised_pnl_absolute || 0;
                totalMargin += margin;
                totalPnl += pnl;
            });

            const portfolioPnlPercent = (totalMargin > 0) ? (totalPnl / totalMargin) * 100 : 0;
            
            updateTable(positions);
            updateMetrics(positions, totalMargin, portfolioPnlPercent);
            updateChart(portfolioPnlPercent, totalPnl);
            lastUpdatedEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        }
    }

    function updateTable(positions) {
        positionsTableBody.innerHTML = '';
        if (positions.length === 0) {
            positionsTableBody.innerHTML = `<tr><td colspan="8" class="no-positions">No open positions found.</td></tr>`;
            return;
        }
        positions.forEach(pos => {
            const pnlAbs = pos.unrealised_pnl_absolute || 0;
            const margin = parseFloat(pos.margin || 0);
            const pnlPct = (margin > 0) ? (pnlAbs / margin) * 100 : 0;
            const pnlClass = pnlAbs >= 0 ? 'pnl-positive' : 'pnl-negative';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pos.product_symbol || 'N/A'}</td>
                <td>${Math.abs(pos.size || 0)}</td>
                <td class="${(pos.size || 0) > 0 ? 'side-long' : 'side-short'}">${(pos.size || 0) > 0 ? 'LONG' : 'SHORT'}</td>
                <td>${parseFloat(pos.entry_price || 0).toFixed(2)}</td>
                <td>${parseFloat(pos.mark_price || 0).toFixed(2)}</td>
                <td class="${pnlClass}">${pnlAbs.toFixed(4)}</td>
                <td class="${pnlClass}">${pnlPct.toFixed(2)}%</td>
                <td>${parseFloat(pos.liquidation_price || 0).toFixed(2)}</td>
            `;
            positionsTableBody.appendChild(row);
        });
    }

    function updateMetrics(positions, totalMargin, portfolioPnlPercent) {
        totalMarginValueEl.textContent = `${totalMargin.toFixed(4)} USD`;
        if (positions.length > 0) {
            const totalPnl = positions.reduce((sum, pos) => sum + (pos.unrealised_pnl_absolute || 0), 0);
            totalPnlValueEl.textContent = `${totalPnl.toFixed(4)} USD`;
            avgPnlPercentEl.textContent = `${portfolioPnlPercent.toFixed(2)}%`;
            
            totalPnlValueEl.className = totalPnl >= 0 ? 'pnl-positive' : 'pnl-negative';
            avgPnlPercentEl.className = portfolioPnlPercent >= 0 ? 'pnl-positive' : 'pnl-negative';
        } else {
            totalPnlValueEl.textContent = '-';
            avgPnlPercentEl.textContent = '-';
            totalPnlValueEl.className = '';
            avgPnlPercentEl.className = '';
        }
    }

    function updateChart(currentPnlPercent, currentPnlAbsolute) {
        const now = new Date();
        chartData.labels.push(now.toLocaleTimeString());
        chartData.pnlHistory.push(currentPnlPercent);
        chartData.pnlAbsoluteHistory.push(currentPnlAbsolute);

        if (chartData.labels.length > MAX_CHART_POINTS) {
            chartData.labels.shift();
            chartData.pnlHistory.shift();
            chartData.pnlAbsoluteHistory.shift();
        }

        if (pnlChart) {
            pnlChart.update('none');
        } else {
            createLineChart();
        }
    }

    function createLineChart() {
        if (pnlChart) pnlChart.destroy();

        const isLightTheme = document.body.classList.contains('light-theme');
        const labelColor = isLightTheme ? '#333' : '#e0e0e0';
        const gridColor = isLightTheme ? '#ddd' : '#2a2a4a';
        
        pnlChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Total Portfolio PNL %',
                    data: chartData.pnlHistory,
                    fill: true,
                    backgroundColor: 'rgba(0, 194, 255, 0.2)',
                    borderColor: 'rgba(0, 194, 255, 1)',
                    borderWidth: 2,
                    pointRadius: 1,
                    pointHoverRadius: 5,
                    pointHitRadius: 10,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { // This ensures tooltips appear on hover
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    y: { ticks: { color: labelColor, callback: (value) => `${value.toFixed(2)}%` }, grid: { color: gridColor } },
                    x: { ticks: { color: labelColor }, grid: { display: false } }
                },
                plugins: {
                    legend: { display: false },
                    // CORRECTED TOOLTIP CONFIGURATION
                    tooltip: {
                        callbacks: {
                            // This function formats the text inside the tooltip
                            label: function(context) {
                                const index = context.dataIndex;
                                const pnlPct = chartData.pnlHistory[index] || 0;
                                const pnlAbs = chartData.pnlAbsoluteHistory[index] || 0;
                                
                                const line1 = ` PNL: ${pnlPct.toFixed(2)}%`;
                                const line2 = `      ${pnlAbs.toFixed(4)} USD`;
                                
                                return [line1, line2]; // Return an array for multi-line tooltips
                            }
                        }
                    }
                }
            }
        });
    }

    // --- Event Listeners and Initializers ---
    resetButton.addEventListener('click', () => {
        window.api.send('reset-app');
    });

    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-theme');
        const currentTheme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
        window.api.send('save-theme', currentTheme);
        createLineChart();
    });

    async function initializeDashboard() {
        const savedTheme = await window.api.invoke('load-theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.checked = true;
        }

        credentials = await window.api.invoke('load-credentials');
        if (credentials) {
            fetchAndDisplayData();
            setInterval(fetchAndDisplayData, 5000);
        } else {
            alert("Could not load credentials. Please log in again.");
            window.location.href = 'index.html';
        }
    }

    initializeDashboard();
});
