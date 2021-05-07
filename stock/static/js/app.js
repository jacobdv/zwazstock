// Data collection for today.
let today = new Date();
let dayOfTheWeek = today.getDay() < 5 ? today.getDay() : console.log('No trading occurs on weekends.'); today.getDay();
let date = (today.getDate() < 10 ? '0' : '') + today.getDate();
let yesterday = (today.getDate() < 10 ? '0' : '') + (today.getDate() - 1);
let month = ((today.getMonth() + 1) < 10 ? '0' : '') + (today.getMonth() + 1);
let year = today.getFullYear();
let hours = today.getHours();
let minutes = today.getMinutes();
let stockData = [];
let dateForAPI = `${year}-${month}-${yesterday}`
console.log(`Yesterday's Date: ${dateForAPI}`)

// Adding stocks as clickable buttons.
let stockList = d3.select('#stock-list-div').append('ul').attr('id','stock-list');
zwazStocks.forEach(stock => {
    stockList.append('li').text(`${stock}`).attr('class','list-stock')
})

stockList.selectAll('li').on('click', function() {
    console.log('Click.')
})

// Iterating through my owned stocks.
zwazStocks.forEach(stock => {

    // Building the link for the API call.
    let callLink = polygonBaseLink + `v1/open-close/${stock}/${dateForAPI}?unadjusted=true&apiKey=${polygon_API_KEY}`;

    // JSON API call for each stock in my list.
    d3.json(callLink).then(stockCall => {
        if (stockCall.status === 'OK') {

            // Creating an object for the stock information.
            let stockObject = {
                'symbol': stockCall.symbol,
                'prices': {
                    'open': stockCall.open,
                    'close': stockCall.close,
                    'high': stockCall.high,
                    'low': stockCall.low
                },
                'volume': stockCall.volume,
                'date': stockCall.from,
            }

            // Adds the stock object to an array.
            stockData.push(stockObject);
        };
    }).catch(error => {
        let code = parseInt(error.message);
        if (code === 429) {
            console.log('429: Too many API calls in too short an amount of time.')
        } else if (code === 404) {
            console.log(`404: There was an error retrieving ${stock} stock.`)
        } else {
            console.log(code)
            console.log(error)
        }
    });
});

// Logging the final array of successful data pulls.
console.log(stockData)