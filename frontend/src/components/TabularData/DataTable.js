import React from 'react';
import { motion } from 'framer-motion';
import './DataTable.css';

const DataTable = ({ datasets, loadDataset, handleDelete }) => {
  return (
    <motion.div 
      className="dataset-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {datasets.map((ds) => (
        <motion.div
          key={ds._id}
          className="dataset-card"
          whileHover={{ y: -5 }}
          onClick={() => loadDataset(ds._id)}
        >
          <div className="card-header">
            <h3 className="card-title">{ds.filename}</h3>
            <span className="pill">{ds.columns.length} columns</span>
          </div>
          <p className="card-subtext">{new Date(ds.created_at).toLocaleDateString()}</p>
          <div className="card-actions">
            <button 
              className="icon-btn danger"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(ds._id);
              }}
            >
              🗑️
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DataTable;