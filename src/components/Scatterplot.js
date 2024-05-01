import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function Scatterplot({ data, xVar, yVar }) {
  const ref = useRef();

  useEffect(() => {
    console.log("xVar, yVar: ", xVar, yVar);
    console.log("Data sample: ", data.slice(0, 5)); 
    if (!xVar || !yVar) return;

    const svg = d3.select(ref.current);
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d[xVar]))
      .range([0, width]);
    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d[yVar]))
      .range([height, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));
    g.append('g')
      .call(d3.axisLeft(y));

    g.selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d[xVar]))
      .attr("cy", d => y(d[yVar]))
      .attr("r", 5)
      .style("fill", "#69b3a2");

  }, [data, xVar, yVar]);

  return <svg ref={ref} width={600} height={400}></svg>;
}

export default Scatterplot;