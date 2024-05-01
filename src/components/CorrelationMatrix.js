import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function CorrelationMatrix({ data, onSelect }) {
    const ref = useRef();

    useEffect(() => {
      if (data.length > 0) {
          const margin = { top: 60, right: 60, bottom: 10, left: 70 };
          const width = 650 - margin.left - margin.right;
          const height = 500 - margin.top - margin.bottom;
          
          d3.select(ref.current).selectAll("*").remove();
  
          const svg = d3.select(ref.current)
              .attr("width", width + margin.left + margin.right + 50)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

            const variables = Object.keys(data[0]).filter(d => typeof data[0][d] === 'number');
            const n = variables.length;
            const matrix = [];

            for (let i = 0; i < n; i++) {
                matrix[i] = [];
                for (let j = 0; j < n; j++) {
                    if (i === j) {
                        matrix[i][j] = 1;
                    } else {
                        matrix[i][j] = calculateCorrelation(data, variables[i], variables[j]);
                    }
                }
            }

            const x = d3.scaleBand()
                .domain(variables)
                .range([0, width])
                .padding(0.05);

            const y = d3.scaleBand()
                .domain(variables)
                .range([0, height])
                .padding(0.05);

            const colorScale = d3.scaleSequential()
                .interpolator(d3.interpolateRdYlBu)
                .domain([-1, 1]);

            svg.selectAll(".cell")
                .data(matrix.flat())
                .join("rect")
                .attr("class", "cell")
                .attr("x", (_, i) => x(variables[i % n]))
                .attr("y", (_, i) => y(variables[Math.floor(i / n)]))
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .attr("fill", d => colorScale(d))
                .on("click", (_, i) => onSelect(variables[i % n], variables[Math.floor(i / n)]));

            svg.selectAll(".label")
                .data(matrix.flat())
                .join("text")
                .attr("class", "label")
                .attr("x", (_, i) => x(variables[i % n]) + x.bandwidth() / 2)
                .attr("y", (_, i) => y(variables[Math.floor(i / n)]) + y.bandwidth() / 2)
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .text(d => d.toFixed(2))
                .style("fill", d => Math.abs(d) > 0.5 ? "white" : "black");

            const axisLeft = d3.axisLeft(y).tickSize(0);

            svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", `translate(0, ${-20})`)
                .call(d3.axisTop(x).tickSize(0))
                .selectAll("text")
                .style("text-anchor", "middle")
                .attr("dx", "0em")
                .attr("dy", "-0.5em");

            svg.append("g")
                .attr("class", "axis axis--y")
                .call(axisLeft);

            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width + 20}, 0)`);

            const legendScale = d3.scaleLinear()
                .domain([-1, 1])
                .range([height, 0]);            

            const legendScaleGroup = svg.append("g")
                .attr("class", "legend-scale")
                .attr("transform", `translate(${width + 60}, 0)`);
            
            legendScaleGroup.call(d3.axisRight(legendScale).tickValues(d3.range(-1, 1.1, 0.2)));

            const defs = svg.append("defs");
            const linearGradient = defs.append("linearGradient")
                .attr("id", "gradient-colors")
                .attr("x1", "0%")
                .attr("x2", "0%")
                .attr("y1", "100%")
                .attr("y2", "0%");

            linearGradient.selectAll("stop")
                .data(colorScale.ticks().map((t, i, n) => ({
                    offset: `${100 * i / n.length}%`,
                    color: colorScale(t)
                })))
                .enter().append("stop")
                .attr("offset", d => d.offset)
                .attr("stop-color", d => d.color);

            legend.append("rect")
                .attr("width", 20)
                .attr("height", height)
                .style("fill", "url(#gradient-colors)");
            
            svg.selectAll(".axis--x .tick text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            svg.selectAll(".axis--y .tick text")
                .style("text-anchor", "end")
                .attr("dy", "-.8em");
        }
    }, [data, onSelect]);

    return <svg ref={ref} />;
}

function calculateCorrelation(data, xVariable, yVariable) {
    const meanX = d3.mean(data, d => +d[xVariable]);
    const meanY = d3.mean(data, d => +d[yVariable]);
    const n = data.length;
    let num = 0;
    let den1 = 0;
    let den2 = 0;

    for (let i = 0; i < n; i++) {
        const x = data[i][xVariable] - meanX;
        const y = data[i][yVariable] - meanY;
        num += x * y;
        den1 += x * x;
        den2 += y * y;
    }

    return num / Math.sqrt(den1 * den2);
}

export default CorrelationMatrix;