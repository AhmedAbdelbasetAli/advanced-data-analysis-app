import React, { useState } from 'react';
import axios from 'axios';
import './DataForm.css';

const DataForm = ({ fetchTables }) => {
  const [formData, setFormData] = useState([{ name: '', value: '' }]);

  const handleChange = (index, e) => {
    const updatedFormData = [...formData];
    updatedFormData[index][e.target.name] = e.target.value;
    setFormData(updatedFormData);
  };

  const addRow = () => {
    setFormData([...formData, { name: '', value: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/tabular/tables', formData);;
    setFormData([{ name: '', value: '' }]);
    fetchTables();
  };

  return (
    <form onSubmit={handleSubmit} className="data-form">
      {formData.map((row, index) => (
        <div key={index}>
          <input
            name="name"
            value={row.name}
            onChange={(e) => handleChange(index, e)}
            placeholder="Name"
            required
          />
          <input
            name="value"
            type="number"
            value={row.value}
            onChange={(e) => handleChange(index, e)}
            placeholder="Value"
            required
          />
        </div>
      ))}
      <button type="button" onClick={addRow}>Add Row</button>
      <button type="submit">Create Table</button>
    </form>
  );
};

export default DataForm;