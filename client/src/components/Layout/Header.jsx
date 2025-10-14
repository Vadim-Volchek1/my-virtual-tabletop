import React from 'react';
import {
  Box,
  HStack,
  Text,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  IconButton
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box bg="white" borderBottom="1px" borderColor="gray.200" px={6} py={4}>
      <HStack justify="space-between">
        <Text fontSize="xl" fontWeight="bold">
          RPG Table Online
        </Text>
        
        <HStack spacing={4}>
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            aria-label="Toggle theme"
          />
          
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <HStack>
                <Avatar size="sm" name={user?.username} />
                <Text>{user?.username}</Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem onClick={logout}>Выйти</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </HStack>
    </Box>
  );
};

export default Header;