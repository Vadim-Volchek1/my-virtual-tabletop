import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';

import Header from './components/Layout/Header';
import Login from './page/Login';
import Dashboard from './page/Dashboard';
import Index from './page/Index';
import GameTable from './page/GameTable';
import SessionDetails from './components/SessionDetails';
import Profile from './page/Profile'; 

import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

const AppLayout = () => {
  return (
    <Box minH="100vh">
      <Header />
      <Box as="main" p={6}>
        <Outlet /> {/* сюда будут подставляться внутренние страницы */}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <ProfileProvider> {/* 👈 добавили обёртку */}
          <Router>
            <Routes>
              {/* Публичные страницы */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              {/* Защищённые маршруты — общий макет */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/session/:id" element={<GameTable />} />
                <Route path="/session/:id/details" element={<SessionDetails />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Routes>
          </Router>
        </ProfileProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
