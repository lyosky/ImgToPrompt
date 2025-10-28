import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages/Home';
import { Analyze } from './pages/Analyze';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { useAppStore } from './store/useAppStore';

function App() {
  const { initializeApp } = useAppStore();

  useEffect(() => {
    // 初始化应用状态
    initializeApp();
  }, [initializeApp]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
