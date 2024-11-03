const apiKey = '2WJGJM0G9GQP33R9'; // Replace with your API key
const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'XEQT.TO', 'VGRO.TO']; // Add your stock tickers here
const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function fetchHistoricalData(ticker) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=${ticker}&apikey=${apiKey}`;
    const response = await fetch(url);
    return response.json();
}

function calculateReturn(currentPrice, pastPrice) {
    return ((currentPrice - pastPrice) / pastPrice) * 100;
}

function getCachedData() {
    const cachedData = localStorage.getItem('stockData');
    const lastFetchTime = localStorage.getItem('lastFetchTime');
    const now = new Date().getTime();

    if (cachedData && lastFetchTime && (now - lastFetchTime < cacheDuration)) {
      return JSON.parse(cachedData);
    } else {
      return null;
    }
}

async function updateStockGrid() {
    const stockGrid = document.getElementById('stockGrid');
    stockGrid.innerHTML = ''; // Clear existing grid items

    let stockData = getCachedData();

    if (!stockData) {
        stockData = {};
        for (const ticker of tickers) {
          const data = await fetchHistoricalData(ticker);
          const timeSeries = data['Monthly Adjusted Time Series'];

          if (timeSeries) {
            const dates = Object.keys(timeSeries).sort().reverse();
            const currentPrice = parseFloat(timeSeries[dates[0]]['5. adjusted close']);
            const oneYearAgoPrice = timeSeries[dates[12]] ? parseFloat(timeSeries[dates[12]]['5. adjusted close']) : null;
            const threeYearsAgoPrice = timeSeries[dates[36]] ? parseFloat(timeSeries[dates[36]]['5. adjusted close']) : null;
            const fiveYearsAgoPrice = timeSeries[dates[60]] ? parseFloat(timeSeries[dates[60]]['5. adjusted close']) : null;
            const tenYearsAgoPrice = timeSeries[dates[120]] ? parseFloat(timeSeries[dates[120]]['5. adjusted close']) : null;

            stockData[ticker] = {
                symbol: ticker,
                oneYearReturn: oneYearAgoPrice ? calculateReturn(currentPrice, oneYearAgoPrice) : 'N/A',
                threeYearReturn: threeYearsAgoPrice ? calculateReturn(currentPrice, threeYearsAgoPrice) : 'N/A',
                fiveYearReturn: fiveYearsAgoPrice ? calculateReturn(currentPrice, fiveYearsAgoPrice) : 'N/A',
                tenYearReturn: tenYearsAgoPrice ? calculateReturn(currentPrice, tenYearsAgoPrice) : 'N/A',
            };
          } else {
            stockData[ticker] = null;
          }
        }

        localStorage.setItem('stockData', JSON.stringify(stockData));
        localStorage.setItem('lastFetchTime', new Date().getTime().toString());
    }

    for (const ticker of tickers) {
        const stock = stockData[ticker];

        if (stock) {
        stockGrid.innerHTML += `
            <div class="table-row">
                <p>${stock.symbol}</p>
                <p class="right-aligned">${stock.oneYearReturn !== 'N/A' ? stock.oneYearReturn.toFixed(2) + '%' : 'N/A'}</p>
                <p class="right-aligned">${stock.threeYearReturn !== 'N/A' ? stock.threeYearReturn?.toFixed(2) + '%' : 'N/A'}</p>
                <p class="right-aligned">${stock.fiveYearReturn !== 'N/A' ? stock.fiveYearReturn.toFixed(2) + '%' : 'N/A'}</p>
                <p class="right-aligned">${stock.tenYearReturn !== 'N/A' ? stock.tenYearReturn.toFixed(2) + '%' : 'N/A'}</p>
            </div>
        `;
        } else {
            stockGrid.innerHTML += `
                <div class="table-row" style="grid-template-columns: 1fr 4fr;">
                    <p>${ticker}</p>
                    <p style="text-align: center;">No data available</p>
                </div>
            `;
        }
    }
}

// Initial update on page load
updateStockGrid();

