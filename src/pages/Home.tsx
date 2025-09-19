import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Languages, 
  FileText, 
  Mic, 
  Volume2, 
  History,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      name: 'Text Translation',
      description: 'Translate text between multiple languages with high accuracy and real-time processing.',
      icon: Languages,
      href: '/translation',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      name: 'Text Summarization',
      description: 'Generate concise summaries from long texts with customizable length and focus.',
      icon: FileText,
      href: '/summarization',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      name: 'Speech to Text',
      description: 'Convert spoken words to text with advanced speech recognition technology.',
      icon: Mic,
      href: '/speech-to-text',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      name: 'Text to Speech',
      description: 'Transform text into natural-sounding speech with multiple voice options.',
      icon: Volume2,
      href: '/text-to-speech',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      name: 'Operation History',
      description: 'Track all your NLP operations with detailed history and PDF export options.',
      icon: History,
      href: '/history',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Advanced NLP Technology</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            My-NLP-App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Experience the power of advanced Natural Language Processing with our comprehensive suite of AI-powered tools. 
            Translate, summarize, transcribe, and synthesize text with cutting-edge technology.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/translation"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/history"
            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            View History
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.name}
              to={feature.href}
              className="group block"
            >
              <div className={`${feature.bgColor} rounded-xl p-6 h-full hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200 transform group-hover:translate-x-1" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-8 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              100+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Supported Languages
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              99.9%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Accuracy Rate
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              24/7
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Availability
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;