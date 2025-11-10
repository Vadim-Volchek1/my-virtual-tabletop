import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCharacter } from '../contexts/CharacterContext';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Spinner,
  useDisclosure,
  useColorModeValue,
  Icon,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { FaPlus, FaTrash, FaUser, FaDiceD20, FaHeart, FaShieldAlt, FaRunning } from 'react-icons/fa';

const CharacterListPage = () => {
  const { 
    characters, 
    loading, 
    error, 
    deleteCharacter, 
    clearError,
    createCharacter,
    loadUserCharacters
  } = useCharacter();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    race: '',
    class: '',
    level: 1,
    background: '',
  });
  const [creating, setCreating] = useState(false);

  const bg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const accent = useColorModeValue('teal.500', 'teal.300');

  const handleCreateCharacter = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      console.log('Creating character with data:', newCharacter);
      
      const characterData = {
        name: newCharacter.name,
        race: newCharacter.race,
        class: newCharacter.class,
        level: newCharacter.level,
        background: newCharacter.background || '',
        // Бэкенд установит значения по умолчанию
      };
      
      await createCharacter(characterData);
      toast({
        title: 'Персонаж создан',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setNewCharacter({
        name: '',
        race: '',
        class: '',
        level: 1,
        background: '',
      });
    } catch (error) {
      console.error('Error creating character:', error);
      toast({
        title: 'Ошибка создания персонажа',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (characterId, characterName) => {
    if (window.confirm(`Вы уверены, что хотите удалить персонажа "${characterName}"?`)) {
      try {
        await deleteCharacter(characterId);
        toast({
          title: 'Персонаж удален',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Ошибка удаления',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  // Функция для расчета модификатора характеристики
  const getAbilityModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  const formatModifier = (modifier) => {
    return modifier >= 0 ? `+${modifier}` : modifier.toString();
  };

  // Функция для безопасного доступа к данным персонажа
  // Функция для безопасного доступа к данным персонажа
const getCharacterDisplayData = (character) => {
  if (!character) return {};
  
  // Базовые данные с значениями по умолчанию
  const defaultData = {
    id: character.id,
    name: character.name || 'Без имени',
    race: character.race || 'Не указана',
    class: character.class || 'Не указан',
    level: character.level || 1,
    background: character.background,
    
    // Характеристики с значениями по умолчанию
    abilities: character.abilities || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    
    // Боевые параметры с значениями по умолчанию
    armor_class: character.armor_class || 10,
    current_hp: character.current_hp || 10,
    max_hp: character.max_hp || 10,
    temporary_hp: character.temporary_hp || 0,
    speed: character.speed || 30,
    initiative: character.initiative || 0,
  };
  
  return defaultData;
};

  if (loading && characters.length === 0) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color={accent} />
          <Text fontSize="lg" color="gray.500">Загрузка персонажей...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" p={8} bg={bg}>
      <VStack spacing={8} align="stretch" maxW="1200px" mx="auto">
        {/* Заголовок и кнопка */}
        <HStack justify="space-between" wrap="wrap" gap={4}>
          <VStack align="flex-start" spacing={2}>
            <Heading size="xl" color={accent}>
              Мои персонажи
            </Heading>
            <Text color="gray.500">
              Управляйте вашими RPG персонажами
            </Text>
          </VStack>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="teal"
            size="lg"
            onClick={onOpen}
          >
            Создать персонажа
          </Button>
        </HStack>

        {/* Сообщение об ошибке */}
        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <AlertDescription flex="1">{error}</AlertDescription>
            <CloseButton onClick={clearError} />
          </Alert>
        )}

        {/* Список персонажей */}
        {characters.length === 0 ? (
          <Card bg={cardBg} shadow="lg" borderRadius="2xl" textAlign="center" py={12}>
            <CardBody>
              <VStack spacing={4}>
                <Icon as={FaUser} boxSize={12} color="gray.400" />
                <Heading size="md" color="gray.500">
                  У вас пока нет персонажей
                </Heading>
                <Text color="gray.500">
                  Создайте своего первого персонажа чтобы начать игру
                </Text>
                <Button
                  leftIcon={<FaPlus />}
                  colorScheme="teal"
                  onClick={onOpen}
                >
                  Создать первого персонажа
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {characters.map((character) => {
              const charData = getCharacterDisplayData(character);
              
              return (
                <Card 
                  key={charData.id} 
                  bg={cardBg} 
                  shadow="lg" 
                  borderRadius="2xl"
                  _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                  transition="all 0.2s"
                >
                  <CardHeader pb={2}>
                    <HStack justify="space-between" align="flex-start">
                      <VStack align="flex-start" spacing={1}>
                        <Heading size="md" color={accent}>
                          {charData.name}
                        </Heading>
                        <HStack spacing={2} wrap="wrap">
                          <Badge colorScheme="teal" fontSize="xs">
                            {charData.race}
                          </Badge>
                          <Badge colorScheme="blue" fontSize="xs">
                            {charData.class}
                          </Badge>
                        </HStack>
                        {charData.background && (
                          <Text fontSize="sm" color="gray.500" noOfLines={1}>
                            {charData.background}
                          </Text>
                        )}
                      </VStack>
                      <Box
                        bg={accent}
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="bold"
                        minW="60px"
                        textAlign="center"
                      >
                        Ур. {charData.level}
                      </Box>
                    </HStack>
                  </CardHeader>

                  <CardBody py={2}>
                    <VStack spacing={3} align="stretch">
                      <HStack justify="space-around" bg="gray.50" _dark={{ bg: 'gray.600' }} p={2} borderRadius="lg">
                        <VStack spacing={1}>
                          <Icon as={FaHeart} color="red.500" />
                          <Text fontSize="sm" fontWeight="bold">
                            {charData.current_hp}/{charData.max_hp}
                          </Text>
                          <Text fontSize="xs" color="gray.500">HP</Text>
                        </VStack>
                        <VStack spacing={1}>
                          <Icon as={FaShieldAlt} color="blue.500" />
                          <Text fontSize="sm" fontWeight="bold">
                            {charData.armor_class}
                          </Text>
                          <Text fontSize="xs" color="gray.500">AC</Text>
                        </VStack>
                        <VStack spacing={1}>
                          <Icon as={FaRunning} color="green.500" />
                          <Text fontSize="sm" fontWeight="bold">
                            {charData.speed}
                          </Text>
                          <Text fontSize="xs" color="gray.500">Скор.</Text>
                        </VStack>
                        <VStack spacing={1}>
                          <Icon as={FaDiceD20} color="purple.500" />
                          <Text fontSize="sm" fontWeight="bold">
                            {formatModifier(getAbilityModifier(charData.abilities?.dexterity || 10))}
                          </Text>
                          <Text fontSize="xs" color="gray.500">Иниц.</Text>
                        </VStack>
                      </HStack>
                      
                      {/* Краткая информация о характеристиках */}
                      {charData.abilities && (
                        <SimpleGrid columns={3} spacing={2} fontSize="xs">
                          <Text textAlign="center">
                            <Text as="span" fontWeight="bold">СИЛ</Text>
                            <br />
                            {charData.abilities.strength || 10}
                            <Text as="span" fontSize="xs" color="gray.500">
                              ({formatModifier(getAbilityModifier(charData.abilities.strength || 10))})
                            </Text>
                          </Text>
                          <Text textAlign="center">
                            <Text as="span" fontWeight="bold">ЛОВ</Text>
                            <br />
                            {charData.abilities.dexterity || 10}
                            <Text as="span" fontSize="xs" color="gray.500">
                              ({formatModifier(getAbilityModifier(charData.abilities.dexterity || 10))})
                            </Text>
                          </Text>
                          <Text textAlign="center">
                            <Text as="span" fontWeight="bold">ТЕЛ</Text>
                            <br />
                            {charData.abilities.constitution || 10}
                            <Text as="span" fontSize="xs" color="gray.500">
                              ({formatModifier(getAbilityModifier(charData.abilities.constitution || 10))})
                            </Text>
                          </Text>
                        </SimpleGrid>
                      )}
                    </VStack>
                  </CardBody>

                  <CardFooter pt={2}>
                    <HStack spacing={3} w="full">
                      <Button
                        as={Link}
                        to={`/characters/${charData.id}`}
                        colorScheme="teal"
                        variant="solid"
                        flex={1}
                      >
                        Открыть лист
                      </Button>
                      <Button
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(charData.id, charData.name)}
                      >
                        <FaTrash />
                      </Button>
                    </HStack>
                  </CardFooter>
                </Card>
              );
            })}
          </SimpleGrid>
        )}

        {/* Модальное окно создания персонажа */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader borderBottomWidth="1px">
              Создание персонажа
            </ModalHeader>
            <form onSubmit={handleCreateCharacter}>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Имя персонажа</FormLabel>
                    <Input
                      value={newCharacter.name}
                      onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                      placeholder="Введите имя персонажа"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Раса</FormLabel>
                    <Input
                      value={newCharacter.race}
                      onChange={(e) => setNewCharacter({...newCharacter, race: e.target.value})}
                      placeholder="Например: Человек, Эльф, Гном"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Класс</FormLabel>
                    <Input
                      value={newCharacter.class}
                      onChange={(e) => setNewCharacter({...newCharacter, class: e.target.value})}
                      placeholder="Например: Воин, Волшебник, Плут"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Происхождение</FormLabel>
                    <Input
                      value={newCharacter.background}
                      onChange={(e) => setNewCharacter({...newCharacter, background: e.target.value})}
                      placeholder="Например: Солдат, Благородный, Мудрец"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Уровень</FormLabel>
                    <NumberInput
                      min={1}
                      max={20}
                      value={newCharacter.level}
                      onChange={(value) => setNewCharacter({...newCharacter, level: parseInt(value) || 1})}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter borderTopWidth="1px">
                <HStack spacing={3}>
                  <Button variant="outline" onClick={onClose} isDisabled={creating}>
                    Отмена
                  </Button>
                  <Button 
                    colorScheme="teal" 
                    type="submit"
                    isDisabled={!newCharacter.name || !newCharacter.race || !newCharacter.class || creating}
                    isLoading={creating}
                    loadingText="Создание..."
                  >
                    Создать
                  </Button>
                </HStack>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default CharacterListPage;