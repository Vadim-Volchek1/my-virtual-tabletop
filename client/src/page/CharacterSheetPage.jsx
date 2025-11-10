import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCharacter } from '../contexts/CharacterContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  SimpleGrid,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton,
  Spinner,
  useColorModeValue,
  Icon,
  Badge,
  Divider,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Textarea,
  Checkbox,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Flex,
  Progress,
  Tag,
  Tooltip,
  Wrap,
  WrapItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Editable,
  EditableInput,
  EditablePreview,
} from '@chakra-ui/react';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaHeart, 
  FaShieldAlt, 
  FaRunning,
  FaDiceD20,
  FaMagic,
  FaBox,
  FaCog,
  FaStickyNote,
  FaExclamationTriangle,
  FaPlus,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaDragon,
  FaBook,
  FaScroll,
  FaHatWizard,
  FaFistRaised,
  FaUserCheck,
  FaWeightHanging,
  FaCoins,
  FaGem
} from 'react-icons/fa';

const CharacterSheetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { 
    currentCharacter, 
    loading, 
    error, 
    loadCharacter, 
    updateCharacter,
    addSpell,
    addItem,
    updateItem,
    removeItem,
    clearError,
    clearCurrentCharacter
  } = useCharacter();

  // Состояния для редактирования
  const [editingAbilities, setEditingAbilities] = useState(false);
  const [abilitiesForm, setAbilitiesForm] = useState({});
  const [basicInfoForm, setBasicInfoForm] = useState({});
  const [combatForm, setCombatForm] = useState({});
  const [accessError, setAccessError] = useState(false);

  // Состояния для модальных окон
  const { isOpen: isSpellModalOpen, onOpen: onSpellModalOpen, onClose: onSpellModalClose } = useDisclosure();
  const { isOpen: isItemModalOpen, onOpen: onItemModalOpen, onClose: onItemModalClose } = useDisclosure();
  
  // Состояния для форм
  const [newSpell, setNewSpell] = useState({
    name: '',
    level: 0,
    school: '',
    casting_time: '',
    range: '',
    components: '',
    duration: '',
    description: '',
    prepared: false
  });
  
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'equipment',
    quantity: 1,
    weight: 0,
    description: '',
    equipped: false
  });

  const bg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const accent = useColorModeValue('teal.500', 'teal.300');

  useEffect(() => {
    if (id) {
      loadCharacter(id).catch(error => {
        console.error('Error loading character:', error);
        if (error.response?.status === 403 || error.message?.includes('403')) {
          setAccessError(true);
          toast({
            title: 'Доступ запрещен',
            description: 'У вас нет прав для просмотра этого персонажа',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      });
    }

    return () => {
      clearCurrentCharacter();
    };
  }, [id]);

  useEffect(() => {
    if (currentCharacter) {
      console.log('📊 Current character data:', currentCharacter);
      
      if (currentCharacter.user_id && user?.id && currentCharacter.user_id !== user.id) {
        setAccessError(true);
        return;
      }
      
      setAbilitiesForm(currentCharacter.abilities || {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      });
      
      setBasicInfoForm({
        name: currentCharacter.name || '',
        race: currentCharacter.race || '',
        class: currentCharacter.class || '',
        level: currentCharacter.level || 1,
        background: currentCharacter.background || '',
        alignment: currentCharacter.alignment || '',
        subrace: currentCharacter.subrace || '',
        subclass: currentCharacter.subclass || ''
      });

      setCombatForm({
        current_hp: currentCharacter.current_hp || 10,
        max_hp: currentCharacter.max_hp || 10,
        temporary_hp: currentCharacter.temporary_hp || 0,
        armor_class: currentCharacter.armor_class || 10,
        speed: currentCharacter.speed || 30,
        initiative: currentCharacter.initiative || 0,
        proficiency_bonus: currentCharacter.proficiency_bonus || 2,
        passive_perception: currentCharacter.passive_perception || 10,
        hit_dice: currentCharacter.hit_dice || '1d8',
        current_hit_dice: currentCharacter.current_hit_dice || 1
      });
    }
  }, [currentCharacter, user]);

  // Обработчики обновления данных
  const handleUpdateAbilities = async (e) => {
    e.preventDefault();
    try {
      await updateCharacter(id, { 
        abilities: abilitiesForm 
      });
      setEditingAbilities(false);
      toast({
        title: 'Характеристики обновлены',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Update abilities error:', error);
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateBasicInfo = async (e) => {
    e.preventDefault();
    try {
      await updateCharacter(id, { 
        basic_info: basicInfoForm 
      });
      toast({
        title: 'Основная информация обновлена',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Update basic info error:', error);
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpdateCombat = async (e) => {
    e.preventDefault();
    try {
      await updateCharacter(id, { 
        combat: {
          hit_points: {
            current: combatForm.current_hp,
            max: combatForm.max_hp,
            temporary: combatForm.temporary_hp
          },
          armor_class: combatForm.armor_class,
          speed: combatForm.speed,
          initiative: combatForm.initiative,
          proficiency_bonus: combatForm.proficiency_bonus,
          passive_perception: combatForm.passive_perception,
          hit_dice: combatForm.hit_dice,
          current_hit_dice: combatForm.current_hit_dice
        }
      });
      toast({
        title: 'Боевые параметры обновлены',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Update combat error:', error);
      toast({
        title: 'Ошибка обновления',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Обработчики для заклинаний
  const handleAddSpell = async () => {
    try {
      await addSpell(id, newSpell);
      toast({
        title: 'Заклинание добавлено',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setNewSpell({
        name: '',
        level: 0,
        school: '',
        casting_time: '',
        range: '',
        components: '',
        duration: '',
        description: '',
        prepared: false
      });
      onSpellModalClose();
    } catch (error) {
      toast({
        title: 'Ошибка добавления заклинания',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddItem = async () => {
    try {
      await addItem(id, newItem);
      toast({
        title: 'Предмет добавлен',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setNewItem({
        name: '',
        type: 'equipment',
        quantity: 1,
        weight: 0,
        description: '',
        equipped: false
      });
      onItemModalClose();
    } catch (error) {
      toast({
        title: 'Ошибка добавления предмета',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleToggleItemEquip = async (itemId, currentlyEquipped) => {
    try {
      await updateItem(id, itemId, { equipped: !currentlyEquipped });
      toast({
        title: currentlyEquipped ? 'Предмет снят' : 'Предмет экипирован',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ошибка обновления предмета',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await removeItem(id, itemId);
      toast({
        title: 'Предмет удален',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Ошибка удаления предмета',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Вспомогательные функции
  const getAbilityModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  const formatModifier = (modifier) => {
    return modifier >= 0 ? `+${modifier}` : modifier.toString();
  };

  const calculateProficiencyBonus = () => {
    return Math.floor(((currentCharacter?.level || 1) - 1) / 4) + 2;
  };

  const getSkillModifier = (ability, isProficient = false) => {
    const baseModifier = getAbilityModifier(currentCharacter.abilities?.[ability] || 10);
    return isProficient ? baseModifier + calculateProficiencyBonus() : baseModifier;
  };

  const calculateCarryingCapacity = () => {
    const strength = currentCharacter.abilities?.strength || 10;
    return strength * 15; // Базовая грузоподъемность в D&D
  };

  const calculateTotalWeight = () => {
    return (currentCharacter.inventory || []).reduce((total, item) => {
      return total + (item.weight * item.quantity);
    }, 0);
  };

  // Данные для навыков
  const skillsData = [
    { key: 'acrobatics', label: 'Акробатика', ability: 'dexterity', icon: FaRunning },
    { key: 'animal_handling', label: 'Уход за животными', ability: 'wisdom', icon: FaDragon },
    { key: 'arcana', label: 'Магия', ability: 'intelligence', icon: FaHatWizard },
    { key: 'athletics', label: 'Атлетика', ability: 'strength', icon: FaFistRaised },
    { key: 'deception', label: 'Обман', ability: 'charisma', icon: FaUserCheck },
    { key: 'history', label: 'История', ability: 'intelligence', icon: FaBook },
    { key: 'insight', label: 'Проницательность', ability: 'wisdom', icon: FaEye },
    { key: 'intimidation', label: 'Запугивание', ability: 'charisma', icon: FaFistRaised },
    { key: 'investigation', label: 'Расследование', ability: 'intelligence', icon: FaEye },
    { key: 'medicine', label: 'Медицина', ability: 'wisdom', icon: FaHeart },
    { key: 'nature', label: 'Природа', ability: 'intelligence', icon: FaDragon },
    { key: 'perception', label: 'Восприятие', ability: 'wisdom', icon: FaEye },
    { key: 'performance', label: 'Выступление', ability: 'charisma', icon: FaUserCheck },
    { key: 'persuasion', label: 'Убеждение', ability: 'charisma', icon: FaUserCheck },
    { key: 'religion', label: 'Религия', ability: 'intelligence', icon: FaBook },
    { key: 'sleight_of_hand', label: 'Ловкость рук', ability: 'dexterity', icon: FaRunning },
    { key: 'stealth', label: 'Скрытность', ability: 'dexterity', icon: FaEyeSlash },
    { key: 'survival', label: 'Выживание', ability: 'wisdom', icon: FaDragon }
  ];

  const spellSchools = [
    'Вызов', 'Воплощение', 'Иллюзия', 'Некромантия', 'Ограждение', 'Очарование', 'Преобразование', 'Прорицание'
  ];

  const itemTypes = [
    'Оружие', 'Броня', 'Снаряжение', 'Магический предмет', 'Расходный материал', 'Сокровище', 'Инструмент'
  ];

  // Если нет доступа к персонажу
  if (accessError) {
    return (
      <Box minH="100vh" p={8} bg={bg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={6} textAlign="center">
          <Icon as={FaExclamationTriangle} boxSize={16} color="red.500" />
          <Heading color="red.500">Доступ запрещен</Heading>
          <Text fontSize="lg" color="gray.600">
            У вас нет прав для просмотра этого персонажа
          </Text>
          <Button as={Link} to="/characters" colorScheme="teal" size="lg">
            Вернуться к моим персонажам
          </Button>
        </VStack>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color={accent} />
          <Text fontSize="lg" color="gray.500">Загрузка персонажа...</Text>
        </VStack>
      </Box>
    );
  }

  if (!currentCharacter) {
    return (
      <Box minH="100vh" p={8} bg={bg} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Heading color={accent}>Персонаж не найден</Heading>
          <Text color="gray.600">Персонаж с ID {id} не существует</Text>
          <Button as={Link} to="/characters" colorScheme="teal">
            Вернуться к списку персонажей
          </Button>
        </VStack>
      </Box>
    );
  }

  const abilityScores = [
    { key: 'strength', label: 'Сила', icon: FaDiceD20 },
    { key: 'dexterity', label: 'Ловкость', icon: FaRunning },
    { key: 'constitution', label: 'Телосложение', icon: FaHeart },
    { key: 'intelligence', label: 'Интеллект', icon: FaCog },
    { key: 'wisdom', label: 'Мудрость', icon: FaStickyNote },
    { key: 'charisma', label: 'Харизма', icon: FaMagic }
  ];

  return (
    <Box minH="100vh" p={8} bg={bg}>
      <VStack spacing={6} align="stretch" maxW="1200px" mx="auto">
        {/* Навигация и заголовок */}
        <HStack justify="space-between" align="flex-start">
          <VStack align="flex-start" spacing={2}>
            <Button
              as={Link}
              to="/characters"
              leftIcon={<FaArrowLeft />}
              variant="outline"
              size="sm"
            >
              Назад к списку
            </Button>
            <VStack align="flex-start" spacing={1}>
              <Heading size="xl" color={accent}>
                {currentCharacter.name}
              </Heading>
              <HStack spacing={2} wrap="wrap">
                <Badge colorScheme="teal" fontSize="md">
                  {currentCharacter.race}
                </Badge>
                <Badge colorScheme="blue" fontSize="md">
                  {currentCharacter.class}
                </Badge>
                <Badge colorScheme="purple" fontSize="md">
                  Уровень {currentCharacter.level}
                </Badge>
                {currentCharacter.background && (
                  <Badge colorScheme="orange" fontSize="md">
                    {currentCharacter.background}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </VStack>
        </HStack>

        {/* Сообщение об ошибке */}
        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <AlertDescription flex="1">{error}</AlertDescription>
            <CloseButton onClick={clearError} />
          </Alert>
        )}

        <Card bg={cardBg} shadow="lg" borderRadius="2xl">
          <Tabs variant="enclosed" colorScheme="teal">
            <TabList px={6} pt={4} overflowX="auto">
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaDiceD20} />
                  <Text>Основное</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaHeart} />
                  <Text>Боевые параметры</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaMagic} />
                  <Text>Заклинания</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaBox} />
                  <Text>Инвентарь</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack spacing={2}>
                  <Icon as={FaCog} />
                  <Text>Навыки</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Вкладка характеристик (остается без изменений) */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="lg">Основные характеристики</Heading>
                    <Button
                      leftIcon={editingAbilities ? <FaTimes /> : <FaEdit />}
                      colorScheme={editingAbilities ? "gray" : "teal"}
                      onClick={() => setEditingAbilities(!editingAbilities)}
                    >
                      {editingAbilities ? 'Отмена' : 'Редактировать'}
                    </Button>
                  </HStack>

                  {editingAbilities ? (
                    <form onSubmit={handleUpdateAbilities}>
                      <VStack spacing={6}>
                        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
                          {abilityScores.map((ability) => (
                            <FormControl key={ability.key} textAlign="center">
                              <FormLabel>{ability.label}</FormLabel>
                              <NumberInput
                                min={1}
                                max={30}
                                value={abilitiesForm[ability.key] || 10}
                                onChange={(value) => setAbilitiesForm({
                                  ...abilitiesForm,
                                  [ability.key]: parseInt(value) || 10
                                })}
                              >
                                <NumberInputField textAlign="center" />
                                <NumberInputStepper>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                                </NumberInputStepper>
                              </NumberInput>
                              <Text fontSize="sm" color="gray.500" mt={1}>
                                Мод: {formatModifier(getAbilityModifier(abilitiesForm[ability.key] || 10))}
                              </Text>
                            </FormControl>
                          ))}
                        </SimpleGrid>

                        <HStack justify="flex-end" w="full">
                          <Button type="submit" leftIcon={<FaSave />} colorScheme="teal">
                            Сохранить характеристики
                          </Button>
                        </HStack>
                      </VStack>
                    </form>
                  ) : (
                    <>
                      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
                        {abilityScores.map((ability) => {
                          const score = currentCharacter.abilities?.[ability.key] || 10;
                          const modifier = getAbilityModifier(score);
                          
                          return (
                            <Card key={ability.key} textAlign="center" bg="gray.50" _dark={{ bg: 'gray.600' }}>
                              <CardBody>
                                <Icon as={ability.icon} boxSize={6} color={accent} mb={2} />
                                <Text fontSize="sm" fontWeight="medium" color="gray.600" _dark={{ color: 'gray.300' }}>
                                  {ability.label}
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color={accent}>
                                  {score}
                                </Text>
                                <Text fontSize="lg" fontWeight="semibold">
                                  {formatModifier(modifier)}
                                </Text>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </SimpleGrid>

                      <Divider />

                      {/* Основная информация */}
                      <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                        <CardBody>
                          <Heading size="sm" mb={4}>Основная информация</Heading>
                          <form onSubmit={handleUpdateBasicInfo}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              <FormControl>
                                <FormLabel>Имя</FormLabel>
                                <Input
                                  value={basicInfoForm.name}
                                  onChange={(e) => setBasicInfoForm({...basicInfoForm, name: e.target.value})}
                                />
                              </FormControl>

                              <FormControl>
                                <FormLabel>Раса</FormLabel>
                                <Input
                                  value={basicInfoForm.race}
                                  onChange={(e) => setBasicInfoForm({...basicInfoForm, race: e.target.value})}
                                />
                              </FormControl>

                              <FormControl>
                                <FormLabel>Класс</FormLabel>
                                <Input
                                  value={basicInfoForm.class}
                                  onChange={(e) => setBasicInfoForm({...basicInfoForm, class: e.target.value})}
                                />
                              </FormControl>

                              <FormControl>
                                <FormLabel>Уровень</FormLabel>
                                <NumberInput
                                  min={1}
                                  max={20}
                                  value={basicInfoForm.level}
                                  onChange={(value) => setBasicInfoForm({...basicInfoForm, level: parseInt(value) || 1})}
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </FormControl>

                              <FormControl>
                                <FormLabel>Происхождение</FormLabel>
                                <Input
                                  value={basicInfoForm.background}
                                  onChange={(e) => setBasicInfoForm({...basicInfoForm, background: e.target.value})}
                                />
                              </FormControl>

                              <FormControl>
                                <FormLabel>Мировоззрение</FormLabel>
                                <Input
                                  value={basicInfoForm.alignment}
                                  onChange={(e) => setBasicInfoForm({...basicInfoForm, alignment: e.target.value})}
                                />
                              </FormControl>
                            </SimpleGrid>

                            <HStack justify="flex-end" mt={4}>
                              <Button type="submit" leftIcon={<FaSave />} colorScheme="teal" size="sm">
                                Сохранить информацию
                              </Button>
                            </HStack>
                          </form>
                        </CardBody>
                      </Card>

                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                          <CardBody>
                            <Heading size="sm" mb={2}>Бонус мастерства</Heading>
                            <VStack spacing={2}>
                              <Text fontSize="2xl" fontWeight="bold" color={accent}>
                                {formatModifier(calculateProficiencyBonus())}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                На основе уровня {currentCharacter.level}
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                          <CardBody>
                            <Heading size="sm" mb={2}>Пассивная внимательность</Heading>
                            <VStack spacing={2}>
                              <Text fontSize="2xl" fontWeight="bold" color={accent}>
                                {10 + getAbilityModifier(currentCharacter.abilities?.wisdom || 10)}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                На основе мудрости
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>

                        <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                          <CardBody>
                            <Heading size="sm" mb={2}>Опыт</Heading>
                            <VStack spacing={2}>
                              <Text fontSize="2xl" fontWeight="bold" color={accent}>
                                {currentCharacter.experience || 0}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                До след. уровня: {300 - (currentCharacter.experience || 0)}
                              </Text>
                            </VStack>
                          </CardBody>
                        </Card>
                      </SimpleGrid>
                    </>
                  )}
                </VStack>
              </TabPanel>

              {/* Вкладка боевых параметров */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Heading size="lg">Боевые параметры</Heading>
                  
                  <form onSubmit={handleUpdateCombat}>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      {/* Здоровье */}
                      <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                        <CardBody>
                          <Heading size="sm" mb={4} display="flex" alignItems="center" gap={2}>
                            <Icon as={FaHeart} color="red.500" />
                            Здоровье
                          </Heading>
                          <VStack spacing={3}>
                            <FormControl>
                              <FormLabel>Текущее HP</FormLabel>
                              <NumberInput
                                min={0}
                                max={combatForm.max_hp}
                                value={combatForm.current_hp}
                                onChange={(value) => setCombatForm({...combatForm, current_hp: parseInt(value) || 0})}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </FormControl>
                            <FormControl>
                              <FormLabel>Максимальное HP</FormLabel>
                              <NumberInput
                                min={1}
                                value={combatForm.max_hp}
                                onChange={(value) => setCombatForm({...combatForm, max_hp: parseInt(value) || 10})}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </FormControl>
                            <FormControl>
                              <FormLabel>Временное HP</FormLabel>
                              <NumberInput
                                min={0}
                                value={combatForm.temporary_hp}
                                onChange={(value) => setCombatForm({...combatForm, temporary_hp: parseInt(value) || 0})}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </FormControl>
                          </VStack>
                          <Progress 
                            value={(combatForm.current_hp / combatForm.max_hp) * 100} 
                            colorScheme="red" 
                            mt={3}
                            borderRadius="full"
                          />
                        </CardBody>
                      </Card>

                      {/* Защита */}
                      <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                        <CardBody>
                          <Heading size="sm" mb={4} display="flex" alignItems="center" gap={2}>
                            <Icon as={FaShieldAlt} color="blue.500" />
                            Защита
                          </Heading>
                          <VStack spacing={3}>
                            <FormControl>
                              <FormLabel>Класс доспеха</FormLabel>
                              <NumberInput
                                min={1}
                                value={combatForm.armor_class}
                                onChange={(value) => setCombatForm({...combatForm, armor_class: parseInt(value) || 10})}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </FormControl>
                            <FormControl>
                              <FormLabel>Инициатива</FormLabel>
                              <NumberInput
                                value={combatForm.initiative}
                                onChange={(value) => setCombatForm({...combatForm, initiative: parseInt(value) || 0})}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </FormControl>
                            <FormControl>
                              <FormLabel>Скорость</FormLabel>
                              <NumberInput
                                min={0}
                                value={combatForm.speed}
                                onChange={(value) => setCombatForm({...combatForm, speed: parseInt(value) || 30})}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Прочее */}
                      <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                        <CardBody>
                          <Heading size="sm" mb={4}>Прочие параметры</Heading>
                          <VStack spacing={3}>
                            <FormControl>
                              <FormLabel>Бонус мастерства</FormLabel>
                              <NumberInput
                                min={2}
                                max={6}
                                value={combatForm.proficiency_bonus}
                                onChange={(value) => setCombatForm({...combatForm, proficiency_bonus: parseInt(value) || 2})}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </FormControl>
                            <FormControl>
                              <FormLabel>Пассивная внимательность</FormLabel>
                              <NumberInput
                                value={combatForm.passive_perception}
                                onChange={(value) => setCombatForm({...combatForm, passive_perception: parseInt(value) || 10})}
                              >
                                <NumberInputField />
                              </NumberInput>
                            </FormControl>
                            <FormControl>
                              <FormLabel>Кость хитов</FormLabel>
                              <Input
                                value={combatForm.hit_dice}
                                onChange={(e) => setCombatForm({...combatForm, hit_dice: e.target.value})}
                              />
                            </FormControl>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>

                    <HStack justify="flex-end" mt={6}>
                      <Button type="submit" leftIcon={<FaSave />} colorScheme="teal" size="lg">
                        Сохранить боевые параметры
                      </Button>
                    </HStack>
                  </form>
                </VStack>
              </TabPanel>

              {/* Вкладка заклинаний */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="lg">Заклинания</Heading>
                    <Button
                      leftIcon={<FaPlus />}
                      colorScheme="teal"
                      onClick={onSpellModalOpen}
                    >
                      Добавить заклинание
                    </Button>
                  </HStack>

                  {/* Слоты для заклинаний */}
                  <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                    <CardBody>
                      <Heading size="sm" mb={4}>Слоты для заклинаний</Heading>
                      <Wrap spacing={4}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                          <WrapItem key={level}>
                            <Stat textAlign="center" minW="100px">
                              <StatLabel>{level} уровень</StatLabel>
                              <StatNumber color={accent}>
                                {currentCharacter.spell_slots?.[`level_${level}`]?.max || 0}
                              </StatNumber>
                              <StatHelpText>
                                Использовано: {currentCharacter.spell_slots?.[`level_${level}`]?.used || 0}
                              </StatHelpText>
                            </Stat>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </CardBody>
                  </Card>

                  {/* Список заклинаний */}
                  <Accordion allowMultiple>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                      const levelSpells = (currentCharacter.spells || []).filter(spell => spell.level === level);
                      if (levelSpells.length === 0) return null;

                      return (
                        <AccordionItem key={level}>
                          <h2>
                            <AccordionButton>
                              <Box flex="1" textAlign="left">
                                <HStack>
                                  <Text fontWeight="bold">
                                    {level === 0 ? 'Заговоры' : `${level} уровень`}
                                  </Text>
                                  <Badge colorScheme="purple">{levelSpells.length}</Badge>
                                </HStack>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              {levelSpells.map((spell, index) => (
                                <Card key={index} bg={spell.prepared ? 'blue.50' : 'white'} _dark={{ bg: spell.prepared ? 'blue.900' : 'gray.700' }}>
                                  <CardBody>
                                    <VStack align="stretch" spacing={2}>
                                      <HStack justify="space-between">
                                        <Heading size="sm">{spell.name}</Heading>
                                        <Badge colorScheme={spell.prepared ? "blue" : "gray"}>
                                          {spell.prepared ? "Подготовлено" : "Не подготовлено"}
                                        </Badge>
                                      </HStack>
                                      <HStack>
                                        <Badge>{spell.school}</Badge>
                                        <Text fontSize="sm">Ур. {spell.level}</Text>
                                      </HStack>
                                      <Text fontSize="sm"><strong>Время накладывания:</strong> {spell.casting_time}</Text>
                                      <Text fontSize="sm"><strong>Дистанция:</strong> {spell.range}</Text>
                                      <Text fontSize="sm"><strong>Компоненты:</strong> {spell.components}</Text>
                                      <Text fontSize="sm"><strong>Длительность:</strong> {spell.duration}</Text>
                                      <Text fontSize="sm">{spell.description}</Text>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              ))}
                            </SimpleGrid>
                          </AccordionPanel>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>

                  {(currentCharacter.spells || []).length === 0 && (
                    <Card>
                      <CardBody textAlign="center" py={10}>
                        <Icon as={FaScroll} boxSize={12} color="gray.400" mb={4} />
                        <Heading size="md" color="gray.500" mb={2}>
                          Заклинания не добавлены
                        </Heading>
                        <Text color="gray.500">
                          Добавьте первое заклинание, чтобы начать работу с магией
                        </Text>
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </TabPanel>

              {/* Вкладка инвентаря */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Heading size="lg">Инвентарь</Heading>
                    <Button
                      leftIcon={<FaPlus />}
                      colorScheme="teal"
                      onClick={onItemModalOpen}
                    >
                      Добавить предмет
                    </Button>
                  </HStack>

                  {/* Статистика инвентаря */}
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                      <CardBody>
                        <Stat>
                          <StatLabel>Общий вес</StatLabel>
                          <StatNumber color={accent}>
                            {calculateTotalWeight().toFixed(1)}
                          </StatNumber>
                          <StatHelpText>
                            из {calculateCarryingCapacity()} фунтов
                          </StatHelpText>
                        </Stat>
                        <Progress 
                          value={(calculateTotalWeight() / calculateCarryingCapacity()) * 100} 
                          colorScheme={calculateTotalWeight() > calculateCarryingCapacity() ? "red" : "teal"}
                          mt={2}
                        />
                      </CardBody>
                    </Card>

                    <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                      <CardBody>
                        <Stat>
                          <StatLabel>Экипировано</StatLabel>
                          <StatNumber color={accent}>
                            {(currentCharacter.inventory || []).filter(item => item.equipped).length}
                          </StatNumber>
                          <StatHelpText>
                            предметов
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                      <CardBody>
                        <Stat>
                          <StatLabel>Всего предметов</StatLabel>
                          <StatNumber color={accent}>
                            {(currentCharacter.inventory || []).length}
                          </StatNumber>
                          <StatHelpText>
                            в инвентаре
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Список предметов */}
                  <Card>
                    <CardBody>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Название</Th>
                            <Th>Тип</Th>
                            <Th>Количество</Th>
                            <Th>Вес</Th>
                            <Th>Статус</Th>
                            <Th>Действия</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {(currentCharacter.inventory || []).map((item, index) => (
                            <Tr key={index}>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{item.name}</Text>
                                  {item.description && (
                                    <Text fontSize="sm" color="gray.500" noOfLines={1}>
                                      {item.description}
                                    </Text>
                                  )}
                                </VStack>
                              </Td>
                              <Td>
                                <Badge colorScheme={
                                  item.type === 'weapon' ? 'red' :
                                  item.type === 'armor' ? 'blue' :
                                  item.type === 'magic' ? 'purple' : 'gray'
                                }>
                                  {item.type}
                                </Badge>
                              </Td>
                              <Td>{item.quantity}</Td>
                              <Td>{(item.weight * item.quantity).toFixed(1)}</Td>
                              <Td>
                                <Badge colorScheme={item.equipped ? "green" : "gray"}>
                                  {item.equipped ? "Экипировано" : "В рюкзаке"}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={item.equipped ? <FaTimes /> : <FaPlus />}
                                    size="sm"
                                    colorScheme={item.equipped ? "orange" : "green"}
                                    onClick={() => handleToggleItemEquip(item.id, item.equipped)}
                                    aria-label={item.equipped ? "Снять" : "Экипировать"}
                                  />
                                  <IconButton
                                    icon={<FaTrash />}
                                    size="sm"
                                    colorScheme="red"
                                    onClick={() => handleDeleteItem(item.id)}
                                    aria-label="Удалить"
                                  />
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>

                      {(currentCharacter.inventory || []).length === 0 && (
                        <Box textAlign="center" py={10}>
                          <Icon as={FaBox} boxSize={12} color="gray.400" mb={4} />
                          <Heading size="md" color="gray.500" mb={2}>
                            Инвентарь пуст
                          </Heading>
                          <Text color="gray.500">
                            Добавьте первый предмет, чтобы начать собирать инвентарь
                          </Text>
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>

              {/* Вкладка навыков */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Heading size="lg">Навыки и владения</Heading>

                  {/* Бонус мастерства и пассивные навыки */}
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                      <CardBody textAlign="center">
                        <Heading size="sm" mb={2}>Бонус мастерства</Heading>
                        <Text fontSize="3xl" fontWeight="bold" color={accent}>
                          {formatModifier(calculateProficiencyBonus())}
                        </Text>
                      </CardBody>
                    </Card>

                    <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                      <CardBody textAlign="center">
                        <Heading size="sm" mb={2}>Пассивная внимательность</Heading>
                        <Text fontSize="3xl" fontWeight="bold" color={accent}>
                          {10 + getSkillModifier('wisdom')}
                        </Text>
                      </CardBody>
                    </Card>

                    <Card bg="gray.50" _dark={{ bg: 'gray.600' }}>
                      <CardBody textAlign="center">
                        <Heading size="sm" mb={2}>Пассивное расследование</Heading>
                        <Text fontSize="3xl" fontWeight="bold" color={accent}>
                          {10 + getSkillModifier('intelligence')}
                        </Text>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Список навыков */}
                  <Card>
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {skillsData.map((skill) => {
                          const isProficient = currentCharacter.proficiencies?.includes(skill.key) || false;
                          const modifier = getSkillModifier(skill.ability, isProficient);
                          
                          return (
                            <HStack key={skill.key} justify="space-between" p={3} bg="gray.50" _dark={{ bg: 'gray.600' }} borderRadius="md">
                              <HStack spacing={3}>
                                <Icon as={skill.icon} color={accent} />
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">{skill.label}</Text>
                                  <Text fontSize="sm" color="gray.500">
                                    {skill.ability === 'strength' ? 'Сил' :
                                     skill.ability === 'dexterity' ? 'Лов' :
                                     skill.ability === 'constitution' ? 'Тел' :
                                     skill.ability === 'intelligence' ? 'Инт' :
                                     skill.ability === 'wisdom' ? 'Мдр' : 'Хар'}
                                  </Text>
                                </VStack>
                              </HStack>
                              <HStack spacing={3}>
                                <Badge colorScheme={isProficient ? "green" : "gray"}>
                                  {formatModifier(modifier)}
                                </Badge>
                                <Tooltip label={isProficient ? "Владеет навыком" : "Не владеет навыком"}>
                                  <Box
                                    w={4}
                                    h={4}
                                    borderRadius="sm"
                                    border="2px"
                                    borderColor={isProficient ? "green.500" : "gray.300"}
                                    bg={isProficient ? "green.500" : "transparent"}
                                    cursor="pointer"
                                  />
                                </Tooltip>
                              </HStack>
                            </HStack>
                          );
                        })}
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  {/* Владения и языки */}
                  <Card>
                    <CardBody>
                      <Heading size="sm" mb={4}>Владения и языки</Heading>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                        <VStack align="start" spacing={3}>
                          <Heading size="xs" color="gray.600">Владение инструментами</Heading>
                          <Wrap>
                            {(currentCharacter.proficiencies || []).filter(p => p.includes('tool')).map((prof, index) => (
                              <WrapItem key={index}>
                                <Tag colorScheme="blue">{prof.replace('tool_', '')}</Tag>
                              </WrapItem>
                            ))}
                            {(currentCharacter.proficiencies || []).filter(p => p.includes('tool')).length === 0 && (
                              <Text color="gray.500" fontSize="sm">Нет владений инструментами</Text>
                            )}
                          </Wrap>
                        </VStack>

                        <VStack align="start" spacing={3}>
                          <Heading size="xs" color="gray.600">Языки</Heading>
                          <Wrap>
                            {(currentCharacter.proficiencies || []).filter(p => p.includes('language')).map((prof, index) => (
                              <WrapItem key={index}>
                                <Tag colorScheme="green">{prof.replace('language_', '')}</Tag>
                              </WrapItem>
                            ))}
                            {(currentCharacter.proficiencies || []).filter(p => p.includes('language')).length === 0 && (
                              <Text color="gray.500" fontSize="sm">Нет дополнительных языков</Text>
                            )}
                          </Wrap>
                        </VStack>
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      </VStack>

      {/* Модальное окно добавления заклинания */}
      <Modal isOpen={isSpellModalOpen} onClose={onSpellModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Добавить заклинание</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Название заклинания</FormLabel>
                <Input
                  value={newSpell.name}
                  onChange={(e) => setNewSpell({...newSpell, name: e.target.value})}
                  placeholder="Огненный шар"
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Уровень</FormLabel>
                  <NumberInput
                    min={0}
                    max={9}
                    value={newSpell.level}
                    onChange={(value) => setNewSpell({...newSpell, level: parseInt(value) || 0})}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Школа</FormLabel>
                  <Select
                    value={newSpell.school}
                    onChange={(e) => setNewSpell({...newSpell, school: e.target.value})}
                  >
                    <option value="">Выберите школу</option>
                    {spellSchools.map(school => (
                      <option key={school} value={school}>{school}</option>
                    ))}
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Время накладывания</FormLabel>
                  <Input
                    value={newSpell.casting_time}
                    onChange={(e) => setNewSpell({...newSpell, casting_time: e.target.value})}
                    placeholder="1 действие"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Дистанция</FormLabel>
                  <Input
                    value={newSpell.range}
                    onChange={(e) => setNewSpell({...newSpell, range: e.target.value})}
                    placeholder="150 футов"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Компоненты</FormLabel>
                  <Input
                    value={newSpell.components}
                    onChange={(e) => setNewSpell({...newSpell, components: e.target.value})}
                    placeholder="В, С, М"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Длительность</FormLabel>
                  <Input
                    value={newSpell.duration}
                    onChange={(e) => setNewSpell({...newSpell, duration: e.target.value})}
                    placeholder="Мгновенное"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Описание</FormLabel>
                <Textarea
                  value={newSpell.description}
                  onChange={(e) => setNewSpell({...newSpell, description: e.target.value})}
                  placeholder="Описание эффектов заклинания..."
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <Checkbox
                  isChecked={newSpell.prepared}
                  onChange={(e) => setNewSpell({...newSpell, prepared: e.target.checked})}
                >
                  Подготовлено
                </Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onSpellModalClose}>
              Отмена
            </Button>
            <Button colorScheme="teal" onClick={handleAddSpell}>
              Добавить заклинание
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно добавления предмета */}
      <Modal isOpen={isItemModalOpen} onClose={onItemModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Добавить предмет</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Название предмета</FormLabel>
                <Input
                  value={newItem.name}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  placeholder="Длинный меч"
                />
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Тип</FormLabel>
                  <Select
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                  >
                    {itemTypes.map(type => (
                      <option key={type} value={type.toLowerCase()}>{type}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Количество</FormLabel>
                  <NumberInput
                    min={1}
                    value={newItem.quantity}
                    onChange={(value) => setNewItem({...newItem, quantity: parseInt(value) || 1})}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </HStack>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel>Вес (фунты)</FormLabel>
                  <NumberInput
                    min={0}
                    step={0.1}
                    value={newItem.weight}
                    onChange={(value) => setNewItem({...newItem, weight: parseFloat(value) || 0})}
                  >
                    <NumberInputField />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Экипировать сразу</FormLabel>
                  <Checkbox
                    isChecked={newItem.equipped}
                    onChange={(e) => setNewItem({...newItem, equipped: e.target.checked})}
                    mt={2}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Описание</FormLabel>
                <Textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  placeholder="Описание предмета..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onItemModalClose}>
              Отмена
            </Button>
            <Button colorScheme="teal" onClick={handleAddItem}>
              Добавить предмет
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CharacterSheetPage;