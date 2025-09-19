import React, { useState } from 'react';
import { Search, Download, Trash2, FileText, Languages, Mic, Volume2, Copy, Check, Filter } from 'lucide-react';
import { useNLP } from '../contexts/NLPContext';
import jsPDF from 'jspdf';

const History: React.FC = () => {
  const { state, clearHistory } = useNLP();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copied, setCopied] = useState<string>('');

  const typeIcons = {
    translation: Languages,
    summarization: FileText,
    'speech-to-text': Mic,
    'text-to-speech': Volume2,
  };

  const typeColors = {
    translation: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    summarization: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    'speech-to-text': 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    'text-to-speech': 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300',
  };

  const filteredHistory = state.history.filter(item => {
    const matchesSearch = item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.output.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const exportToPDF = () => {
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 20;

    // Title
    pdf.setFontSize(20);
    pdf.text('My-NLP-App History Export', 20, yPosition);
    yPosition += 20;

    // Export date
    pdf.setFontSize(10);
    pdf.text(`Exported on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 20;

    filteredHistory.forEach((item, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }

      // Item header
      pdf.setFontSize(12);
      pdf.text(`${index + 1}. ${item.type.replace('-', ' ').toUpperCase()}`, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(8);
      pdf.text(`Date: ${new Date(item.timestamp).toLocaleString()}`, 20, yPosition);
      yPosition += 10;

      // Input
      pdf.text('Input:', 20, yPosition);
      yPosition += 5;
      const inputLines = pdf.splitTextToSize(item.input, 170);
      pdf.text(inputLines, 25, yPosition);
      yPosition += inputLines.length * 4 + 5;

      // Output
      pdf.text('Output:', 20, yPosition);
      yPosition += 5;
      const outputLines = pdf.splitTextToSize(item.output, 170);
      pdf.text(outputLines, 25, yPosition);
      yPosition += outputLines.length * 4 + 15;
    });

    pdf.save('nlp-history.pdf');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Operation History
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Track and manage all your NLP operations
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="translation">Translation</option>
                <option value="summarization">Summarization</option>
                <option value="speech-to-text">Speech to Text</option>
                <option value="text-to-speech">Text to Speech</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportToPDF}
              disabled={filteredHistory.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            
            <button
              onClick={clearHistory}
              disabled={state.history.length === 0}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {state.history.filter(h => h.type === 'translation').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Translations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {state.history.filter(h => h.type === 'summarization').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Summaries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {state.history.filter(h => h.type === 'speech-to-text').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Speech→Text</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {state.history.filter(h => h.type === 'text-to-speech').length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Text→Speech</div>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-gray-500 dark:text-gray-400">
              {searchTerm || filterType !== 'all' ? 'No matching history found' : 'No operations yet'}
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              {searchTerm || filterType !== 'all' ? 'Try adjusting your search or filter' : 'Start using the NLP features to see your history here'}
            </div>
          </div>
        ) : (
          filteredHistory.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <div
                key={item.id}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${typeColors[item.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {item.type.replace('-', ' ')}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {item.metadata && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.metadata.fromLang && item.metadata.toLang && 
                        `${item.metadata.fromLang} → ${item.metadata.toLang}`}
                      {item.metadata.confidence && 
                        `Confidence: ${Math.round(item.metadata.confidence * 100)}%`}
                      {item.metadata.voice && 
                        `Voice: ${item.metadata.voice}`}
                      {item.metadata.summaryLength && 
                        `Length: ${item.metadata.summaryLength}`}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Input</h4>
                      <button
                        onClick={() => copyToClipboard(item.input, `${item.id}-input`)}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      >
                        {copied === `${item.id}-input` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 max-h-24 overflow-y-auto">
                      {item.input}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Output</h4>
                      <button
                        onClick={() => copyToClipboard(item.output, `${item.id}-output`)}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      >
                        {copied === `${item.id}-output` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 max-h-24 overflow-y-auto">
                      {item.output}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default History;