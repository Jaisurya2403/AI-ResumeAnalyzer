import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { storageService } from '../services/storageService';

const initialState = {
  resultId: null,
  createdAt: null,
  rawResumeText: "",
  resumeProfile: null,
  githubData: null,
  jobRole: { id: "fullstack-eng", title: "Full Stack Engineer", domain: "Software" },
  roundScores: {
    round1: null,
    round2: null,
    round3: null,
    round4: null
  },
  roundAnswers: {
    round1: [],
    round2: [],
    round3: [],
    round4: []
  },
  finalReport: null,
  isAnalyzing: false,
  apiConfigModalOpen: false
};

function appReducer(state, action) {
  switch (action.type) {
    case 'START_NEW_ANALYSIS':
      return {
        ...initialState,
        resultId: "res_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now(),
        createdAt: new Date().toISOString(),
        rawResumeText: action.payload.rawResumeText || "",
        isAnalyzing: true
      };

    case 'SET_RESUME_PROFILE':
      return {
        ...state,
        resumeProfile: action.payload,
        isAnalyzing: false
      };

    case 'SET_GITHUB_DATA':
      return {
        ...state,
        githubData: action.payload
      };

    case 'SET_JOB_ROLE':
      return {
        ...state,
        jobRole: action.payload
      };

    case 'SET_ROUND_SCORE': {
      const updatedScores = {
        ...state.roundScores,
        [action.payload.round]: action.payload.score
      };
      return {
        ...state,
        roundScores: updatedScores
      };
    }

    case 'SET_ROUND_ANSWERS': {
      const updatedAnswers = {
        ...state.roundAnswers,
        [action.payload.round]: action.payload.answers
      };
      return {
        ...state,
        roundAnswers: updatedAnswers
      };
    }

    case 'SET_FINAL_REPORT':
      return {
        ...state,
        finalReport: action.payload
      };

    case 'LOAD_SAVED_RESULT':
      return {
        ...state,
        ...action.payload,
        isAnalyzing: false
      };

    case 'RESET_SESSION':
      return {
        ...initialState,
        resultId: "res_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now()
      };

    case 'TOGGLE_API_MODAL':
      return {
        ...state,
        apiConfigModalOpen: typeof action.payload === 'boolean' ? action.payload : !state.apiConfigModalOpen
      };

    default:
      return state;
  }
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto persist when final report or profile changes
  useEffect(() => {
    if (state.resultId && (state.resumeProfile || state.finalReport)) {
      storageService.saveResult({
        resultId: state.resultId,
        createdAt: state.createdAt || new Date().toISOString(),
        resumeProfile: state.resumeProfile,
        githubData: state.githubData,
        jobRole: state.jobRole,
        roundScores: state.roundScores,
        roundAnswers: state.roundAnswers,
        finalReport: state.finalReport
      });
    }
  }, [state.resumeProfile, state.githubData, state.jobRole, state.roundScores, state.roundAnswers, state.finalReport, state.resultId]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
