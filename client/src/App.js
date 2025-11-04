import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { AuthProvider } from './contexts/AuthContext';

import Header from './components/Layout/Header';
import Login from './page/Login';
import Dashboard from './page/Dashboard';
import Index from './page/Index';
import GameTable from './page/GameTable';
import SessionDetails from './components/SessionDetails';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

/**
 * Общий макет для всех защищённых страниц
 */
const AppLayout = () => {
  return (
    <Box minH="100vh">
      <Header />
      <Box as="main" p={6}>
        <Outlet /> {/* здесь будет рендериться внутренняя страница */}
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
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

            {/* Защищённые маршруты — обёрнуты в общий макет */}
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
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
