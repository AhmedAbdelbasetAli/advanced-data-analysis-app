import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/components/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">Advanced Data Analysis Suite</h1>
          <p className="hero-subtitle">Transform Your Data into Actionable Insights</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="primary-button"
            onClick={() => navigate('/tabular')}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>

      <div className="features-container">
        <motion.div 
          className="feature-card"
          whileHover={{ y: -10 }}
          onClick={() => navigate('/tabular')}
        >
          <div className="feature-icon">📊</div>
          <h3 className="feature-title">Tabular Analysis</h3>
          <p className="feature-text">Advanced spreadsheet processing with ML capabilities</p>
        </motion.div>

        <motion.div 
          className="feature-card"
          whileHover={{ y: -10 }}
          onClick={() => navigate('/images')}
        >
          <div className="feature-icon">🖼️</div>
          <h3 className="feature-title">Image Processing</h3>
          <p className="feature-text">CV-powered analysis and transformation toolkit</p>
        </motion.div>

        <motion.div 
          className="feature-card"
          whileHover={{ y: -10 }}
          onClick={() => navigate('/text')}
        >
          <div className="feature-icon">📝</div>
          <h3 className="feature-title">Text Analytics</h3>
          <p className="feature-text">NLP-driven text processing and insight extraction</p>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;