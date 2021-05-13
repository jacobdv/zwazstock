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
        if (stockObject.prices.current === 0) {
            currentPrice.text('There was an issue retrieving data for this stock.')
        } else {
            currentPrice.text(`Current Price: $${stockObject.prices.current}`);
            let sharesOwned = stockHeaderInfo.append('p').text(`Shares: ${shares}`);
            let investedSum;
            investedSum = stockHeaderInfo.append('p').text(`Total Invested: $${(stockObject.prices.current * shares).toFixed(2)}`);
        }
    }).catch(error => {
        fourTwentyNine();
    })
}

function fourTwentyNine() {
    console.log('There have been too many calls in a short period of time. Finnhub limits to 30 calls per second. Please wait a moment.');
    ilShares.text('You have exceeded the API call limit. It will reset shortly. Until then, enjoy Alfred Lord Tennyson.');
    ilInvestment.text('');
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

zwazStocks.forEach(zStock => {
    d3.json(`${finnhubBaseLink}api/v1/quote?symbol=${zStock.symbol}&token=${finnhub_API_KEY}`).then(stockCall => {
        let ilStockObject = {
            'symbol': zStock,
            'prices': {
                'open': stockCall.o,
                'current': stockCall.c,
                'high': stockCall.h,
                'low': stockCall.l,
                'previousClose': stockCall.pc
            },
            'date': toHumanDate(stockCall.t),
        }
        let moneyInStock = (zStock.shares * ilStockObject.prices.current).toFixed(2);
        investments = (parseFloat(investments) + parseFloat(moneyInStock)).toFixed(2);
        totalShares = (parseFloat(totalShares) + parseFloat(zStock.shares)).toFixed(6)
        
        ilShares.text(`Shares: ${totalShares}`);
        ilInvestment.text(`Investment: $${investments}`);
    }).catch(error => {
        let errorCode = parseInt(error.message);
        if (errorCode === 429) {
            fourTwentyNine();
        } else {
            console.log(errorCode);
            console.log('PUT IN ERROR HANDLING FOR THIS ONE');
        }
    })
});