import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChart = ({ data, selectedVariable }) => {
  const [selectedCategory, setSelectedCategory] = useState('day');
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 460 - margin.top - margin.bottom;

    if (data.length === 0) return;

    const filteredData = data.filter(d => d[selectedCategory]);
    const categories = [...new Set(filteredData.map(d => d[selectedCategory]))];
    if (categories.length === 0) return;

    const averages = categories.map(category => {
      const categoryData = filteredData.filter(d => d[selectedCategory] === category);
      const sum = d3.sum(categoryData, d => d[selectedVariable]);
      return { category, average: sum / categoryData.length };
    });

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);
    x.domain(categories);
    y.domain([0, d3.max(averages, d => d.average)]);

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    g.selectAll('.bar')
      .data(averages)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.category))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.average))
      .attr('height', d => height - y(d.average))
      .append('title')
      .text(d => `Average ${selectedVariable}: ${d.average.toFixed(2)}`);

    g.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(x))
      .append('text')
      .attr('x', width / 2)
      .attr('y', margin.bottom - 10)
      .attr('fill', '#000')
      .attr('text-anchor', 'middle')
      .text(selectedCategory);

    const yAxisGroup = g.append('g').call(d3.axisLeft(y));
    yAxisGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50)
      .attr('x', -(height / 2))
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .attr('fill', '#000')
      .text(selectedVariable);
  }, [data, selectedVariable, selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div>
      <div style ={{ marginBottom: '8px' }}>
        <label htmlFor="category-select">Select Category:</label>
        <div style ={{ marginTop: '10px'}} id="category-select">
          {['day', 'time', 'smoker', 'sex'].map(category => (
            <label key={category}>
              <input
                type="radio"
                value={category}
                checked={selectedCategory === category}
                onChange={() => handleCategoryChange(category)}
              />
              {category}
            </label>
          ))}
        </div>
      </div>
      <svg ref={svgRef} width={600} height={460} />
    </div>
  );
};

export default BarChart;