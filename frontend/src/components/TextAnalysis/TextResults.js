import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './TextResult.css';

const TextResult = ({ data }) => {
  if (!data) return null;

  const sentimentData = [
    { name: 'Polarity', value: data.sentiment.polarity },
    { name: 'Subjectivity', value: data.sentiment.subjectivity },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-result-container"
    >
      <h2 className="text-result-title">Analysis Results</h2>

      <div className="text-result-grid">
        <div className="text-result-section">
          <h3 className="text-result-subtitle">Summary</h3>
          <ul className="text-result-list">
            {data.summary.map((sentence, index) => (
              <li key={index} className="text-result-item">
                {sentence}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-result-section">
          <h3 className="text-result-subtitle">Keywords</h3>
          <div className="text-result-keywords">
            {data.keywords.map((keyword, index) => (
              <span key={index} className="text-result-keyword">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="text-result-chart">
        <h3 className="text-result-subtitle">Sentiment Analysis</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentimentData}>
              <XAxis dataKey="name" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '0.75rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#818cf8"
                strokeWidth={3}
                dot={{ fill: '#4f46e5', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default TextResult;