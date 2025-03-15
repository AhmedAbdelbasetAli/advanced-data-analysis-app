import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import './TextInput.css';

const TextInput = ({ onAnalyze }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/text/analyze', { text });
      onAnalyze(response.data);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-input-container"
    >
      <form onSubmit={handleSubmit} className="text-input-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
          className="text-input-area"
          rows={6}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="text-input-button"
        >
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            'Analyze Text'
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default TextInput;