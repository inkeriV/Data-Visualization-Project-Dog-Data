class Barchart {

    margin = {top: 5, bottom: 80, left: 30, right: 10}

    constructor(svg, tooltip, data, width=1150, height=725) {
        this.svg = svg;
        this.tooltip = tooltip;
        this.data = data
        this.width = width;
        this.height = height;
        this.handlers = {}

    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.tooltip = d3.select(this.tooltip);
        this.container = this.svg.append('g');
        this.xAxis = this.svg.append('g');
        this.yAxis = this.svg.append('g');
        
        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleLinear();
        

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height - this.margin.top - this.margin.bottom)
            .attr("viewBox", [0, 50, this.width, this.height]);

        this.container
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
    }
    
    update(attribute) { 
        const newdata = {}
        if (attribute != "AllDogs") {
            
            this.data.forEach(function(d) {
                var b = d[attribute];
                    if (newdata[b] === undefined) {
                        newdata[b] = 0;
                    } else {
                        newdata[b] = newdata[b] + 1;
                    }
            });
            this.newdata = newdata
            const sorted_data = this.sortData(newdata)
            const top10 = this.returnTop10(sorted_data, newdata)
                
            this.sorted_data = sorted_data
            this.sorted_data = this.sorted_data.slice(0, 10);
            this.top10 = top10
            
        }
        if (attribute == "AllDogs") {
            const counts = {}
            this.data.forEach(function(d) {
                var year = d['ExpYear']
                if (counts[year] == undefined) {
                    counts[year] = 0;
                } else {
                    counts[year] = counts[year] + 1;
                }
            })
            const years = []
            for (var i = 2009; i < 2017; i++) {
                years.push(i)
            }
            this.sorted_data = years;
            this.top10 = counts;
        }
        
        this.xScale.domain(this.sorted_data).range([0,this.width]).padding(0.1);
        this.yScale.domain([0, d3.max(Object.values(this.top10))]).nice().range([this.height,55]); //-55

        this.container.selectAll("rect")
            .data(this.sorted_data)
            .join("rect")
            .on("mouseover", (e,d) => {
                this.tooltip.select(".tooltip-inner").html(`${this.top10[d]}`);

                Popper.createPopper(e.target, this.tooltip.node(), {
                    placement: 'top',
                    modifiers: [
                        {
                            name: 'arrow',
                            options: {
                                element: this.tooltip.select(".tooltip-arrow").node(),
                            },
                        },
                    ],
                });
                this.tooltip.style("display", "block");
            })
            .on("mouseout", (d) => {
                this.tooltip.style("display", "none");    
            })
            .transition()
            .attr("class", "rect")
            .attr('x', d => this.xScale(d))
            .attr('y', d => this.yScale(this.top10[d]))
            .attr('width', this.xScale.bandwidth())
            .attr('height', d => this.height - this.yScale(this.top10[d]))
            .attr("fill", 'rgb( 218, 117, 32')

        if (attribute == 'LicenseType') {
            this.xAxis
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
                .transition()
                .call(d3.axisBottom(this.xScale))
                .selectAll("text").attr("transform", "rotate(-6)").style("text-anchor", "end")            
                .attr("font-size", '11px');
        } else if (attribute == "Breed") {
            this.xAxis
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
                .transition()
                .call(d3.axisBottom(this.xScale))
                .attr("font-size", '10px');
        } else {
            this.xAxis
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
                .transition()
                .call(d3.axisBottom(this.xScale))          
                .attr("font-size", '11px');
        }

        this.yAxis
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`)
            .transition()
            .call(d3.axisLeft(this.yScale))
            .attr("font-size", '15px');
        
    }

    sortData(data) {
        var sorted_data = Object.keys(data).sort(function(a, b) {
            return data[b] - data[a];
        })
        return sorted_data;
    }

    returnTop10(data) {
        var sliced_data = data.slice(0, 10); 
        console.log("sliced data",sliced_data)
        const top10 = {}

        sliced_data.forEach(b => {
            top10[b] = this.newdata[b]
        });
        return top10;
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
}
