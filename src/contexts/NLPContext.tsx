import React, { createContext, useContext, useReducer, ReactNode } from 'react';

export interface HistoryItem {
  id: string;
  type: 'translation' | 'summarization' | 'speech-to-text' | 'text-to-speech';
  input: string;
  output: string;
  metadata?: {
    fromLang?: string;
    toLang?: string;
    confidence?: number;
    voice?: string;
    summaryLength?: string;
  };
  timestamp: number;
}

interface NLPState {
  history: HistoryItem[];
  isLoading: boolean;
  theme: 'light' | 'dark';
}

interface NLPContextType {
  state: NLPState;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
}

const initialState: NLPState = {
  history: JSON.parse(localStorage.getItem('nlp-history') || '[]'),
  isLoading: false,
  theme: (localStorage.getItem('nlp-theme') as 'light' | 'dark') || 'light',
};

type NLPAction = 
  | { type: 'ADD_TO_HISTORY'; payload: Omit<HistoryItem, 'id' | 'timestamp'> }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_LOADING'; payload: boolean };

const nlpReducer = (state: NLPState, action: NLPAction): NLPState => {
  switch (action.type) {
    case 'ADD_TO_HISTORY':
      const newItem: HistoryItem = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      const newHistory = [newItem, ...state.history];
      localStorage.setItem('nlp-history', JSON.stringify(newHistory));
      return { ...state, history: newHistory };
    
    case 'CLEAR_HISTORY':
      localStorage.setItem('nlp-history', '[]');
      return { ...state, history: [] };
    
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('nlp-theme', newTheme);
      return { ...state, theme: newTheme };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    default:
      return state;
  }
};

const NLPContext = createContext<NLPContextType | undefined>(undefined);

export const NLPProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(nlpReducer, initialState);

  const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_TO_HISTORY', payload: item });
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  return (
    <NLPContext.Provider value={{
      state,
      addToHistory,
      clearHistory,
      toggleTheme,
      setLoading,
    }}>
      <div className={state.theme}>
        {children}
      </div>
    </NLPContext.Provider>
  );
};

export const useNLP = () => {
  const context = useContext(NLPContext);
  if (context === undefined) {
    throw new Error('useNLP must be used within a NLPProvider');
  }
  return context;
};