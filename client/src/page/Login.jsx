import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Container,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormErrorMessage
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  
  const { login, register, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Проверяем, если пользователь уже авторизован
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email) newErrors.loginEmail = 'Email обязателен';
    if (!loginData.password) newErrors.loginPassword = 'Пароль обязателен';
    if (loginData.email && !/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.loginEmail = 'Некорректный email';
    }
    return newErrors;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!registerData.username) newErrors.registerUsername = 'Имя пользователя обязательно';
    if (!registerData.email) newErrors.registerEmail = 'Email обязателен';
    if (!registerData.password) newErrors.registerPassword = 'Пароль обязателен';
    if (registerData.email && !/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.registerEmail = 'Некорректный email';
    }
    if (registerData.password && registerData.password.length < 6) {
      newErrors.registerPassword = 'Пароль должен быть не менее 6 символов';
    }
    return newErrors;
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при изменении поля
    if (errors[`login${name.charAt(0).toUpperCase() + name.slice(1)}`]) {
      setErrors(prev => ({
        ...prev,
        [`login${name.charAt(0).toUpperCase() + name.slice(1)}`]: ''
      }));
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при изменении поля
    if (errors[`register${name.charAt(0).toUpperCase() + name.slice(1)}`]) {
      setErrors(prev => ({
        ...prev,
        [`register${name.charAt(0).toUpperCase() + name.slice(1)}`]: ''
      }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateLogin();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login({
        email: loginData.email,
        password: loginData.password
      });
      
      if (result.success) {
        toast({
          title: 'Успешный вход!',
          status: 'success',
          duration: 3000,
        });
        navigate('/');
      } else {
        toast({
          title: 'Ошибка входа',
          description: result.error || 'Неверные учетные данные',
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка входа',
        description: 'Произошла ошибка при входе',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateRegister();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      });
      
      if (result.success) {
        toast({
          title: 'Регистрация успешна!',
          status: 'success',
          duration: 3000,
        });
        navigate('/');
      } else {
        toast({
          title: 'Ошибка регистрации',
          description: result.error || 'Произошла ошибка при регистрации',
          status: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка регистрации',
        description: 'Произошла ошибка при регистрации',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (index) => {
    setActiveTab(index);
    // Очищаем ошибки при переключении вкладок
    setErrors({});
  };

  return (
    <Container maxW="md" height="100vh" display="flex" alignItems="center" justifyContent="center">
      <Card width="100%">
        <CardBody>
          <VStack spacing={6}>
            <Heading size="lg">TRPG Table Online</Heading>
            <Text color="gray.600">Войдите в свой аккаунт или создайте новый</Text>
            
            <Tabs 
              isFitted 
              variant="enclosed" 
              width="100%" 
              index={activeTab}
              onChange={handleTabChange}
            >
              <TabList mb="1em">
                <Tab>Вход</Tab>
                <Tab>Регистрация</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <form onSubmit={handleLogin}>
                    <VStack spacing={4}>
                      <FormControl isRequired isInvalid={errors.loginEmail}>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          name="email"
                          value={loginData.email}
                          onChange={handleLoginChange}
                          placeholder="your@email.com"
                        />
                        <FormErrorMessage>{errors.loginEmail}</FormErrorMessage>
                      </FormControl>
                      <FormControl isRequired isInvalid={errors.loginPassword}>
                        <FormLabel>Пароль</FormLabel>
                        <Input
                          type="password"
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          placeholder="Ваш пароль"
                        />
                        <FormErrorMessage>{errors.loginPassword}</FormErrorMessage>
                      </FormControl>
                      <Button
                        type="submit"
                        colorScheme="blue"
                        width="100%"
                        isLoading={isLoading}
                      >
                        Войти
                      </Button>
                    </VStack>
                  </form>
                </TabPanel>
                <TabPanel>
                  <form onSubmit={handleRegister}>
                    <VStack spacing={4}>
                      <FormControl isRequired isInvalid={errors.registerUsername}>
                        <FormLabel>Имя пользователя</FormLabel>
                        <Input
                          type="text"
                          name="username"
                          value={registerData.username}
                          onChange={handleRegisterChange}
                          placeholder="Ваше имя"
                        />
                        <FormErrorMessage>{errors.registerUsername}</FormErrorMessage>
                      </FormControl>
                      <FormControl isRequired isInvalid={errors.registerEmail}>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          name="email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          placeholder="your@email.com"
                        />
                        <FormErrorMessage>{errors.registerEmail}</FormErrorMessage>
                      </FormControl>
                      <FormControl isRequired isInvalid={errors.registerPassword}>
                        <FormLabel>Пароль</FormLabel>
                        <Input
                          type="password"
                          name="password"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          placeholder="Придумайте пароль (мин. 6 символов)"
                        />
                        <FormErrorMessage>{errors.registerPassword}</FormErrorMessage>
                      </FormControl>
                      <Button
                        type="submit"
                        colorScheme="green"
                        width="100%"
                        isLoading={isLoading}
                      >
                        Зарегистрироваться
                      </Button>
                    </VStack>
                  </form>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default Login;