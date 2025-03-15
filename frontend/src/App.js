import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TabularPage from './pages/TabularPage';
import ImagesPage from './pages/ImagesPage';
import TextPage from './pages/TextPage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tabular" element={<TabularPage />} />
          <Route path="/images" element={<ImagesPage />} />
          <Route path="/text" element={<TextPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;