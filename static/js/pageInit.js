// Data object for stocks.
let stockData = [];

// Converts UNIX timestamps to YYYY-MM-DD format.
function toHumanDate(unixTimestamp) {
    let placeholderDate = new Date(unixTimestamp * 1000);
    humanDate = `${(placeholderDate.getFullYear())}-${((placeholderDate.getMonth() + 1) < 10 ? '0' : '') + (placeholderDate.getMonth() + 1)}-${(placeholderDate.getDate() < 10 ? '0' : '') + placeholderDate.getDate()}` 
    return humanDate;
}

// Displaying data on the page.
function displayStockData(stock) {

    // Changes top-level display data.
    let stockHeaderInfo = d3.select('#stock-header-info').html('');
    stockHeaderInfo.append('h1').attr('id','stockTitle').text(stock);
    let currentPrice = stockHeaderInfo.append('p');
    let shares;

    zwazStocks.forEach(s => {
        if (s.symbol === stock) {
            shares = s.shares;
        }
    })

    // Calls API for the selected stock.
    d3.json(`${finnhubBaseLink}api/v1/quote?symbol=${stock}&token=${finnhub_API_KEY}`).then(stockCall => {
        // Stock object.
        let stockObject = {
            'symbol': stock,
            'prices': {
                'open': stockCall.o,
                'current': stockCall.c,
                'high': stockCall.h,
                'low': stockCall.l,
                'previousClose': stockCall.pc
            },
            'date': toHumanDate(stockCall.t),
        }
        // Makes sure the return was valid, then appends information to the page.
        if (stockObject.prices.current === 0) {
            currentPrice.text('There was an issue retrieving data for this stock.')
        } else {
            currentPrice.text(`Current Price: $${stockObject.prices.current}`);
            let sharesOwned = stockHeaderInfo.append('p').text(`Shares: ${shares}`);
            let investedSum;
            investedSum = stockHeaderInfo.append('p').text(`Total Invested: $${(stockObject.prices.current * shares).toFixed(2)}`);
            let endpointLink = stockHeaderInfo.append('a');
            endpointLink.text('API Endpoint').attr('href','http://127.0.0.1:5000/zAPI/stock/' + stockObject.symbol + '/').classed('endpoint-link',true);
        }
        
        // Calls function for line graph.
        individualLineGraph(stockObject)

    }).catch(error => {
        fourTwentyNine();
    })
}

function individualLineGraph(stockObject) { 
    // API call from created endpoints.
    let url = `http://127.0.0.1:5000/zAPI/stock/${stockObject.symbol}/`;
    d3.json(url).then(function(apiData) {
        let dates = apiData.map(item => item.date);
        let currentPriceList = apiData.map(item => item.prices.current);
        let sDate = dates[0];
        let eDate = dates.slice(-1)[0];
        let trace = {
            type: 'scatter',
            mode: 'lines+markers',
            name: stockObject.symbol,
            x: dates,
            y: currentPriceList,
            line: {
                color: 'black'
            }
        };
        let data = [trace];
        let layout = {
            title: 'Closing Prices',
            xaxis: {
                range: [sDate, eDate],
                type: 'date'
            },
            yaxis: {
                range: [0, (Math.max(currentPriceList) * 1.2)],
                type: 'linear'
            }
        };
        Plotly.newPlot('topChart', data, layout)
    })
}

// Adding title as clickable reload for homepage.
let zwazTitle = d3.select('#title');
zwazTitle.on('click', function() {
    location.reload();
})

// Adding stocks as clickable buttons.
let stockList = d3.select('#stock-list-div').append('ul').attr('id','stock-list');
zwazStocks.forEach(stock => {
    let stockLink = stockList.append('a').classed('inactive',true).classed('active',false);
    stockLink.append('li').text(`${stock.symbol}`).attr('value',`${stock.symbol}`).attr('class','list-stock');
});

// On click, updates the active link. Sets the selectedStock to this value.
stockList.selectAll('li').on('click', function() {
    let selectedStock = d3.select(this);

    // Console log of click location.
    console.log(`Click. @Navbar=> ${selectedStock.attr('value')}`);

    // Resets all links to inactive and sets the selectedStock to active.
    let navList = d3.selectAll('li').classed('active',false).classed('inactive',true);
    selectedStock.classed('active',true).classed('inactive',false);
    
    // Displays data for stock.
    displayStockData(selectedStock.attr('value'));
});

// On page load. The initial total data to display.
let stockHeaderInfo = d3.select('#stock-header-info').html('');
stockHeaderInfo.append('h1').attr('id','stockTitle').text('Investment Totals');
let ilShares = stockHeaderInfo.append('p');
let ilInvestment = stockHeaderInfo.append('p');

let totalShares = 0;
let investments = 0;
let chartingOnLoad = [];

function awaitPortion() {
    return new Promise(resolve => {
        zwazStocks.forEach(zStock => {
            d3.json(`http://127.0.0.1:5000/zAPI/stock/${zStock.symbol}/`).then(stockCall => {
                let mostRecentObj = stockCall.slice(-1)[0];
                let moneyInStock = (zStock.shares * mostRecentObj.prices.current).toFixed(2);
                investments = (parseFloat(investments) + parseFloat(moneyInStock)).toFixed(2);
                totalShares = (parseFloat(totalShares) + parseFloat(zStock.shares)).toFixed(6);
                ilShares.text(`Shares: ${totalShares}`);
                ilInvestment.text(`Investment: $${investments}`);
                chartingOnLoad.push(mostRecentObj);
                if (zwazStocks.length === chartingOnLoad.length) {
                    resolve('resolved');
                }
            }).catch(error => {
                let errorCode = parseInt(error.message);
                if (errorCode === 429) {
                    // This shouldn't be called very often now that I'm on my own API. I think you'd have to run the app.py five times in a minute.
                    fourTwentyNine();
                } else {
                    console.log(errorCode);
                    console.log('PUT IN ERROR HANDLING FOR THIS ONE');
                }
            })
        });
    });
}

async function asyncPortion() {
    const result = await awaitPortion();
    let names = chartingOnLoad.map(item => item.meta.symbol);
    let shares = chartingOnLoad.map(item => item.meta.shares);
    let valuation = chartingOnLoad.map(item => {
        let a = item.meta.shares;
        let b = item.prices.current;
        let value = parseFloat((a * b).toFixed(2));
        return value;
    })
    let bubbleTrace = {
        x: shares,
        y: valuation,
        text: names,
        mode: 'markers',
        marker: {
            size: valuation.map(s => Math.sqrt(s)),
        }
    };
    let bubbleData = [bubbleTrace];
    let bubbleLayout = {
        title: 'Stock Valuation', 
        xaxis: {
            title: 'Shares'
        },
        yaxis: {
            title: 'Investment'
        },
        showlegend: false
    };
    let bubbleConfig = { responsive: true };
    Plotly.newPlot('topChart', bubbleData, bubbleLayout, bubbleConfig);
}

asyncPortion();

// Homepage bubble chart.
// let shares = chartingOnLoad.map(item => item.meta.shares);
// let valuation = chartingOnLoad.map(item => (item.shares * item.prices.current));
// console.log(shares)

// console.log(chartingOnLoad)

// "Error handling."
function fourTwentyNine() {
    console.log('There have been too many calls in a short period of time. Finnhub limits to 30 calls per second. Please wait a moment.');
    ilShares.text('You have exceeded the API call limit. (30 calls per second, 60 calls per minute.) It will reset shortly. Until then, enjoy Alfred Lord Tennyson.');
    ilInvestment.text('');
    
    // Poem audio and text.
    let sample = document.getElementById('kraken')
    sample.play();
    if ( (d3.select('#poemTitle')).size() === 0 ) {
        let poemTitle = stockHeaderInfo.append('h5').attr('id','poemTitle').html('<br>The Kraken');
        let poemStanza = stockHeaderInfo.append('p').attr('id','poemText').html('Below the thunders of the upper deep,<br>\
        Far, far beneath in the abysmal sea,<br>\
        His ancient, dreamless, uninvaded sleep<br>\
        The Kraken sleepeth: faintest sunlights flee<br>\
        About his shadowy sides; above him swell<br>\
        Huge sponges of millennial growth and height;<br>\
        And far away into the sickly light,<br>\
        From many a wondrous grot and secret cell<br>\
        Unnumbered and enormous polypi<br>\
        Winnow with giant arms the slumbering green.<br>\
        There hath he lain for ages, and will lie<br>\
        Battening upon huge sea worms in his sleep,<br>\
        Until the latter fire shall heat the deep;<br>\
        Then once by man and angels to be seen<br>\
        In roaring he shall rise and on the surface die.');
    }
}