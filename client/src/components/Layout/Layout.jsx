import React from 'react';
import {
  Box,
  VStack
} from '@chakra-ui/react';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <VStack minH="100vh" spacing={0} align="stretch">
      <Header />
      <Box flex={1} bg="gray.50">
        {children}
      </Box>
    </VStack>
  );
};

export default Layout;