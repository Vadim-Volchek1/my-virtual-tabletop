import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  useColorModeValue,
  Avatar,
  HStack,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { useProfile } from '../contexts/ProfileContext'; // ✅ добавлено

const ProfilePage = () => {
  const { profile, updateProfile } = useProfile(); // ✅ берём из контекста
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const bg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const toast = useToast();

  // ✅ при загрузке страницы берём актуальные данные профиля
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setEmail(profile.email || '');
      setAvatarUrl(profile.avatar || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateProfile({ username, email, avatar: avatarUrl }); // ✅ обновляем через контекст

      toast({
        title: 'Профиль обновлён',
        description: 'Изменения успешно сохранены',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box minH="100vh" p={8} bg={bg}>
      <VStack spacing={6} maxW="600px" mx="auto" bg={cardBg} p={6} rounded="2xl" shadow="lg">
        <Heading size="lg" color="teal.400">Редактирование профиля</Heading>
        <Divider />

        <Avatar size="xl" name={username} src={avatarUrl} />
        <FormControl>
          <FormLabel>Ссылка на аватар</FormLabel>
          <Input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Имя пользователя</FormLabel>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <HStack spacing={4}>
          <Button colorScheme="teal" onClick={handleSave} isLoading={isSaving}>
            Сохранить
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Назад
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProfilePage;
