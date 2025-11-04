import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

const GameTable = () => {
  const { id } = useParams();

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Игровой стол сессии #{id}</Heading>
        <Text>Здесь будет игровой стол с токенами и картами.</Text>
        <Text>Функциональность в разработке...</Text>
      </VStack>
    </Box>
  );
};

export default GameTable;