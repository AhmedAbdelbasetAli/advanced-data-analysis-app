import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { motion } from 'framer-motion';
import DataTable from '../components/TabularData/DataTable';
import '../styles/components/TabularPage.css';

Chart.register(...registerables);

const TabularPage = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);  

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/tabular/datasets');
      setDatasets(data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      await axios.post('http://localhost:5000/tabular/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchDatasets();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDataset = async (id) => {
    try {
      const { data: dataset } = await axios.get(`http://localhost:5000/tabular/datasets/${id}`);
      const { data: stats } = await axios.get(`http://localhost:5000/tabular/datasets/${id}/stats`);
      
      setSelectedDataset({
        ...dataset,
        columns: dataset.columns.map(c => c.name)
      });
      setStats(stats);
    } catch (error) {
      console.error('Error loading dataset:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tabular/datasets/${id}`);
      await fetchDatasets();
      if (selectedDataset?._id === id) {
        setSelectedDataset(null);
        setStats(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="tabular-container">
      <motion.div className="upload-card">
        <h2 className="section-title">Upload Dataset</h2>
        <div className="upload-content">
          <input
            type="file"
            id="file-upload"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            accept=".csv,.xlsx"
          />
          <label htmlFor="file-upload" className="file-input-label">
            {selectedFile ? selectedFile.name : 'Choose file...'}
          </label>
          <button 
            className="primary-btn"
            onClick={handleFileUpload}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Process Dataset'}
          </button>
        </div>
      </motion.div>

      <div className="dataset-section">
        <h2 className="section-title">Your Datasets</h2>
        <DataTable 
          datasets={datasets}
          loadDataset={loadDataset}
          handleDelete={handleDelete}
        />
      </div>

      {selectedDataset && (
        <motion.div 
          className="analysis-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="dataset-preview">
            <h3 className="dataset-title">{selectedDataset.filename}</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {selectedDataset.columns.map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedDataset.rows.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      {selectedDataset.columns.map((col) => (
                        <td key={col}>{row[col] ?? '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {stats && (
            <div className="statistical-analysis">
              <h3 className="analysis-title">Statistical Insights</h3>
              <div className="charts-grid">
                {Object.entries(stats).map(([col, metrics]) => (
                  <div key={col} className="metric-card">
                    <h4 className="metric-title">{col}</h4>
                    <div className="chart-wrapper">
                      <Bar
                        data={{
                          labels: ['Mean', 'Median', 'Mode', 'Min', 'Max'],
                          datasets: [{
                            label: 'Values',
                            data: [metrics.mean, metrics.median, metrics.mode, metrics.min, metrics.max],
                            backgroundColor: 'rgba(59, 130, 246, 0.8)'
                          }]
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            tooltip: { mode: 'index' }
                          }
                        }}
                      />
                    </div>
                    <div className="metric-details">
                      <div className="metric-row">
                        <span>Std Dev:</span>
                        <span>{metrics.std.toFixed(2)}</span>
                      </div>
                      <div className="metric-row">
                        <span>Outliers:</span>
                        <span>{metrics.outliers.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default TabularPage;