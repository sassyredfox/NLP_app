import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NLPProvider } from './contexts/NLPContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Translation from './pages/Translation';
import Summarization from './pages/Summarization';
import SpeechToText from './pages/SpeechToText';
import TextToSpeech from './pages/TextToSpeech';
import History from './pages/History';

function App() {
  return (
    <AuthProvider>
      <NLPProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/translation" element={<Translation />} />
              <Route path="/summarization" element={<Summarization />} />
              <Route path="/speech-to-text" element={<SpeechToText />} />
              <Route path="/text-to-speech" element={<TextToSpeech />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </Layout>
        </Router>
      </NLPProvider>
    </AuthProvider>
  );
}

export default App;