import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { CharacterProvider } from './contexts/CharacterContext';

import Header from './components/Layout/Header';
import Login from './page/Login';
import Dashboard from './page/Dashboard';
import Index from './page/Index';
import GameTable from './page/GameTable';
import SessionDetails from './components/SessionDetails';
import Profile from './page/Profile';
import CharacterListPage from './page/CharactersListPage';
import CharacterSheetPage from './page/CharacterSheetPage';

import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

// ---------- Общий Layout приложения ----------
const AppLayout = () => {
  return (
    <Box minH="100vh">
      <Header />
      <Box as="main" p={6}>
        <Outlet />
      </Box>
    </Box>
  );
};

// ---------- Прослойка для передачи currentUser ----------
function AppProviders({ children }) {
  const { user } = useAuth();

  console.log('👤 [AppProviders] user из AuthContext:', user);

  return (
    <ProfileProvider>
      <CharacterProvider currentUser={user}>
        {children}
      </CharacterProvider>
    </ProfileProvider>
  );
}

// ---------- Основное приложение ----------
function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <AppProviders>
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

              {/* Защищённые маршруты с общим Layout */}
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
                <Route path="/characters" element={<CharacterListPage />} />
                <Route path="/characters/:id" element={<CharacterSheetPage />} />
              </Route>
            </Routes>
          </Router>
        </AppProviders>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
