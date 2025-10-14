import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

const SessionDetails = () => {
  const { id } = useParams();

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Детали сессии #{id}</Heading>
        <Text>Здесь будет информация о конкретной игровой сессии.</Text>
        <Text>Функциональность в разработке...</Text>
      </VStack>
    </Box>
  );
};

export default SessionDetails;