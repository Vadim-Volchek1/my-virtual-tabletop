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
  useColorModeValue,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext'; // 👈 добавили

const Header = () => {
  const { user, logout } = useAuth();
  const { profile, loading } = useProfile(); // 👈 теперь берём профиль
  const { colorMode, toggleColorMode } = useColorMode();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('teal.600', 'teal.300');

  // 👇 выбираем источник данных
  const displayUser = profile || user;

  return (
    <Box
      bg={bg}
      borderBottom="1px solid"
      borderColor={borderColor}
      px={6}
      py={4}
      boxShadow="md"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <HStack justify="space-between">
        {/* Логотип */}
        <Text
          as="a"
          href="/"
          fontSize="xl"
          fontWeight="bold"
          color={textColor}
          _hover={{ textDecoration: 'none', color: useColorModeValue('teal.700', 'teal.200') }}
        >
          RPG Table Online
        </Text>

        <HStack spacing={4}>
          {/* Переключатель темы */}
          <IconButton
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            aria-label="Toggle theme"
          />

          {/* Если профиль грузится */}
          {loading ? (
            <Spinner size="sm" color="teal.400" />
          ) : (
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="outline">
                <HStack spacing={2}>
                  <Avatar size="sm" src={displayUser?.avatar} name={displayUser?.username} />
                  <Text>{displayUser?.username || 'Гость'}</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem as="a" href="/profile">
                  Профиль
                </MenuItem>
                <MenuItem onClick={logout}>Выйти</MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </HStack>
    </Box>
  );
};

export default Header;
