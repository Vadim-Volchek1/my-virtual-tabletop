import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GameTable from './components/GameTable';
import SessionDetails from './components/SessionDetails';
import PublicRoute from './components/PublicRoute'; // default import
import ProtectedRoute from './components/ProtectedRoute'; // default import
import './App.css';

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/session/:id" element={
                <ProtectedRoute>
                  <GameTable />
                </ProtectedRoute>
              } />
              <Route path="/session/:id/details" element={
                <ProtectedRoute>
                  <SessionDetails />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;