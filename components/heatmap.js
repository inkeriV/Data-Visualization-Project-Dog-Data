class Heatmap {

    margin = {top: 20, bottom: 80, left: 291, right: 250 }

    constructor(svg, tooltip, data, width=625, height=625) {
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
        this.yScale = d3.scaleBand();
        this.myColor = d3.scaleLinear()

        this.svg
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom)

        this.container
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
    }
    
 
    update(yattr, xattr) { 

        this.sorted_xattr = this.prepareAttributeArrays(xattr)
        this.sorted_yattr = this.prepareAttributeArrays(yattr)

        this.finaldata = []
        var max = 0
        
        for (var i = 0; i<this.sorted_xattr.length; i++) {
            for (var j = 0; j<this.sorted_yattr.length; j++) {
                var count = 0
                for (var k=0; k<this.data.length; k++) {
                    if ( (this.sorted_xattr[i] == this.data[k][xattr]) && (this.sorted_yattr[j] == this.data[k][yattr])) {
                        count = count + 1;
                    }
                }
                this.finaldata.push({'xa':this.sorted_xattr[i], 'ya':this.sorted_yattr[j], 'value': count})
                if (count > max) {
                    max = count
                }
            }
        }

        this.Xa = this.sorted_xattr
        this.Ya = this.sorted_yattr

        this.xScale.domain(this.Xa).range([0,this.width]).padding(0.01);
        this.yScale.domain(this.Ya).range([this.height,0]).padding(0.01);
        this.myColor.domain([0,max]).range(["#f9fcff", "#00377c"]);

        this.container.selectAll(".cell")
            .data(this.finaldata, d => d.xa+':'+d.ya)
            .enter()
            .append("rect")
                .on("mouseover", (e,d) => {
                    this.tooltip.select(".tooltip-inner").html(`${d.xa}<br />${d.ya}<br />${d.value}`);

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
                .attr('x', d => this.xScale(d.xa))
                .attr('y', d => this.yScale(d.ya))
                .attr('width', this.xScale.bandwidth())
                .attr('height',d => this.yScale.bandwidth())
                .style("fill", d => this.myColor(d.value))

        if (xattr == 'LicenseType') {
            this.xAxis
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
                .transition()
                .call(d3.axisBottom(this.xScale))
                .selectAll("text").attr("transform", "rotate(-13)").style("text-anchor", "end")            
                .attr("font-size", '11px');
        } else if (xattr == "Breed" || xattr == "Color") {
            this.xAxis
                .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
                .transition()
                .call(d3.axisBottom(this.xScale))
                .selectAll("text").attr("transform", "rotate(-10)").style("text-anchor", "end") 
                .attr("font-size", '9px');
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
            .attr("font-size", '12px');

       
    }
    prepareAttributeArrays(attribute) {
        const newdata = []
        var sorted_array = []
        if (attribute != "ExpYear") {

            this.data.forEach(function(d) {
                var b = d[attribute];
                    if (newdata[b] === undefined) {
                        newdata[b] = 0;
                    } else {
                        newdata[b] = newdata[b] + 1;
                    }
            });

            var sorted = this.sortData(newdata)
            sorted_array = sorted.slice(0, 10);

        } else {
            for (var i=2009; i<2017; i++) {
                newdata.push(i);
            }
            sorted_array = newdata;
        }
        return sorted_array
    }

    sortData(data) {
        var sorted_data = Object.keys(data).sort(function(a, b) {
            return data[b] - data[a];
        })
        return sorted_data;
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
}
