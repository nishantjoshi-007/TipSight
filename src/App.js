import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import Dropdown from './components/Dropdown';
import BarChart from './components/BarChart';
import CorrelationMatrix from './components/CorrelationMatrix';
import Scatterplot from './components/Scatterplot';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [selectedVariable, setSelectedVariable] = useState('total_bill');
  const [selectedXVar, setSelectedXVar] = useState('');
  const [selectedYVar, setSelectedYVar] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        let data = await d3.csv('/data/tips.csv');
        data = data.map(d => ({
          ...d,
          total_bill: +d.total_bill,
          tip: +d.tip,            
          size: +d.size     
        }));
        console.log(data);
        setData(data);
      } catch (error) {
        console.error("Error loading the CSV data: ", error);
      }
    };
  
    loadData();
  }, []);

  const handleVariableChange = (variable) => {
    setSelectedVariable(variable);
  };

  const handleSelect = (xVar, yVar) => {
    setSelectedXVar(xVar);
    setSelectedYVar(yVar);
  };

  const dropdownOptions = [
    { value: 'total_bill', label: 'Total Bill' },
    { value: 'tip', label: 'Tip' },
    { value: 'size', label: 'Size' }
  ];

  return (
    <div className="dashboard">
      <Dropdown options={dropdownOptions} onChange={handleVariableChange} />
      <div className="charts-container">
        <BarChart data={data} dropdownOptions={dropdownOptions} selectedVariable={selectedVariable}/>
        <CorrelationMatrix data={data} onSelect={handleSelect} />
      </div>
      <Scatterplot data={data} xVar={selectedXVar} yVar={selectedYVar} />
    </div>
  );
}

export default App;