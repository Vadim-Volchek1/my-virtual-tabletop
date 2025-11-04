import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Добро пожаловать, {user?.username}!</Heading>
        <Text>Это ваша панель управления RPG Table Online.</Text>
        <Text>Email: {user?.email}</Text>
        <Text>Здесь будут отображаться ваши игровые сессии.</Text>
        <Button onClick={logout} colorScheme="red" width="200px">
          Выйти
        </Button>
      </VStack>
    </Box>
  );
};

export default Dashboard;