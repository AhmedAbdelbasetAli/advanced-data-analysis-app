import React, { useState } from 'react';
import TextInput from '../components/TextAnalysis/TextInput';
import TextResult from '../components/TextAnalysis/TextResults';
import '../styles/components/TextPage.css';

const TextPage = () => {
  const [analysisResult, setAnalysisResult] = useState(null);

  return (
    <div className="text-page-container">
      <div className="text-page-content">
        <h1 className="text-page-title">Text Analysis</h1>
        <TextInput onAnalyze={setAnalysisResult} />
        <TextResult data={analysisResult} />
      </div>
    </div>
  );
};

export default TextPage;