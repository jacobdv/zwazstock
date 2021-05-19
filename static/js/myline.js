// Size Constants
svgH = 450;
svgW = 450;
const margin = {top:20, right:40, bottom:80, left:100 };
const chartH = svgH - (margin.top +margin.bottom);
const chartW = svgW - (margin.left + margin.right);

function zLineGraph(stock) {
    const svg = d3.select('#secondChart').html('').append('svg').attr('height',svgH).attr('width',svgW);
    const chartGroup = svg.append('g').attr('transform',`translate(${margin.left}, ${margin.top})`);
    let url = `http://127.0.0.1:5000/zAPI/stock/${stock}/`;

    d3.json(url).then(data => {
        let dates = data.map(item => item.date);
        let currentPriceList = data.map(item => (item.prices.current).toFixed(2));
        let sDate = dates[0];
        let eDate = dates.slice(-1)[0];
        
        let dataArray = [];
        for (let i = 0; i < dates.length; i++) {
            dataArray.push({'date': dates[i], 'price': currentPriceList[i]});
        };

        let x = d3.scaleTime()
            .domain([d3.timeParse('%Y-%m-%d')(sDate), d3.timeParse('%Y-%m-%d')(eDate)])
            .range([0, chartW]);
        svg.append('g')
            .attr('transform',`translate(0, ${chartH})`)
            .call(d3.axisBottom(x));
        
        let y = d3.scaleLinear()
            .domain([d3.min(currentPriceList) * 0.8, d3.max(currentPriceList) * 1.2])
            .range([chartH, 0]);
        svg.append('g')
            .call(d3.axisLeft(y));

        svg.append('path')
            .datum(dataArray)
            .attr('fill','none')
            .attr('stroke','steelblue')
            .attr('stroke-width',1.5)
            .attr('d', d3.line()
                .x(d => x(d3.timeParse('%Y-%m-%d')(d.date)))
                .y(d => y(d.price))
            )
    })
}