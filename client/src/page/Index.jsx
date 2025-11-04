import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Divider,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { FaDiceD20, FaUsers, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Index = () => {
  const { user, logout } = useAuth();
  const bg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const accent = useColorModeValue('teal.500', 'teal.300');

  return (
    <Box minH="100vh" p={8} bg={bg}>
      <VStack spacing={8} align="stretch" maxW="800px" mx="auto">
        <VStack spacing={2}>
          <Heading size="xl" color={accent}>
            Добро пожаловать, {user?.username || 'Путешественник'}!
          </Heading>
          <Text fontSize="lg" color="gray.500">
            Это ваша панель управления RPG Table Online
          </Text>
          <Text>Email: <b>{user?.email}</b></Text>
        </VStack>

        <Divider />

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card bg={cardBg} shadow="lg" borderRadius="2xl" _hover={{ transform: 'scale(1.03)' }} transition="0.2s">
            <CardHeader>
              <HStack spacing={3}>
                <Icon as={FaDiceD20} boxSize={6} color={accent} />
                <Heading size="md">Мои персонажи</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Text color="gray.500">Просматривайте, редактируйте и создавайте новых героев.</Text>
            </CardBody>
            <CardFooter>
              <Button colorScheme="teal" w="full" variant="solid">
                Открыть персонажей
              </Button>
            </CardFooter>
          </Card>

          <Card bg={cardBg} shadow="lg" borderRadius="2xl" _hover={{ transform: 'scale(1.03)' }} transition="0.2s">
            <CardHeader>
              <HStack spacing={3}>
                <Icon as={FaUsers} boxSize={6} color={accent} />
                <Heading size="md">Игровые сессии</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Text color="gray.500">Участвуйте в кампаниях или создайте свою собственную.</Text>
            </CardBody>
            <CardFooter>
              <Button colorScheme="teal" w="full" variant="solid">
                Мои сессии
              </Button>
            </CardFooter>
          </Card>

          <Card bg={cardBg} shadow="lg" borderRadius="2xl" _hover={{ transform: 'scale(1.03)' }} transition="0.2s">
            <CardHeader>
              <HStack spacing={3}>
                <Icon as={FaUser} boxSize={6} color={accent} />
                <Heading size="md">Профиль</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Text color="gray.500">Измените информацию аккаунта или обновите аватар.</Text>
            </CardBody>
            <CardFooter>
              <Button colorScheme="teal" w="full" variant="solid">
                Редактировать профиль
              </Button>
            </CardFooter>
          </Card>
        </SimpleGrid>

        <Divider />
      </VStack>
    </Box>
  );
};

export default Index;
