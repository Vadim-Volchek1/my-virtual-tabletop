import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  useToast,
  Grid,
  Card,
  CardBody,
  IconButton
} from '@chakra-ui/react';
import { DeleteIcon, AddIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { tokenAPI } from '../../services/tokenService';
import { useSocketEvent } from '../../hooks/useSocket';

const TokenTool = ({ sessionId, onTokenSelect }) => {
  const [tokens, setTokens] = React.useState([]);
  const [newToken, setNewToken] = React.useState({
    name: '',
    imageUrl: '',
    width: 50,
    height: 50
  });
  const { user } = useAuth();
  const toast = useToast();

  React.useEffect(() => {
    loadTokens();
  }, [sessionId]);

  useSocketEvent('token-created', (token) => {
    setTokens(prev => [...prev, token]);
  });

  useSocketEvent('token-updated', (updatedToken) => {
    setTokens(prev => prev.map(token => 
      token._id === updatedToken._id ? updatedToken : token
    ));
  });

  useSocketEvent('token-deleted', (tokenId) => {
    setTokens(prev => prev.filter(token => token._id !== tokenId));
  });

  const loadTokens = async () => {
    try {
      const response = await tokenAPI.getTokens(sessionId);
      setTokens(response.data);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки токенов',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleCreateToken = async () => {
    try {
      await tokenAPI.createToken(sessionId, newToken);
      setNewToken({
        name: '',
        imageUrl: '',
        width: 50,
        height: 50
      });
      toast({
        title: 'Токен создан',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Ошибка создания токена',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDeleteToken = async (tokenId) => {
    try {
      await tokenAPI.deleteToken(sessionId, tokenId);
      toast({
        title: 'Токен удален',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Ошибка удаления токена',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text fontWeight="bold" mb={2}>Создать новый токен</Text>
        <VStack spacing={3}>
          <FormControl>
            <FormLabel>Название</FormLabel>
            <Input
              value={newToken.name}
              onChange={(e) => setNewToken({...newToken, name: e.target.value})}
              placeholder="Название токена"
            />
          </FormControl>
          <FormControl>
            <FormLabel>URL изображения</FormLabel>
            <Input
              value={newToken.imageUrl}
              onChange={(e) => setNewToken({...newToken, imageUrl: e.target.value})}
              placeholder="https://example.com/image.png"
            />
          </FormControl>
          <HStack>
            <FormControl>
              <FormLabel>Ширина</FormLabel>
              <NumberInput value={newToken.width} min={10} max={200}>
                <NumberInputField
                  onChange={(e) => setNewToken({...newToken, width: parseInt(e.target.value) || 50})}
                />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Высота</FormLabel>
              <NumberInput value={newToken.height} min={10} max={200}>
                <NumberInputField
                  onChange={(e) => setNewToken({...newToken, height: parseInt(e.target.value) || 50})}
                />
              </NumberInput>
            </FormControl>
          </HStack>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleCreateToken}
            isDisabled={!newToken.name || !newToken.imageUrl}
          >
            Создать токен
          </Button>
        </VStack>
      </Box>

      <Box>
        <Text fontWeight="bold" mb={2}>Мои токены</Text>
        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
          {tokens.filter(token => token.ownerId?._id === user?.id).map(token => (
            <Card key={token._id} size="sm">
              <CardBody p={2}>
                <VStack spacing={1}>
                  <Box
                    width="40px"
                    height="40px"
                    bg="gray.200"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backgroundImage={token.imageUrl ? `url(${token.imageUrl})` : 'none'}
                    backgroundSize="cover"
                    backgroundPosition="center"
                  >
                    {!token.imageUrl && (
                      <Text fontSize="xs" color="gray.500">
                        {token.name.charAt(0)}
                      </Text>
                    )}
                  </Box>
                  <Text fontSize="xs" textAlign="center">
                    {token.name}
                  </Text>
                  <HStack>
                    <Button
                      size="xs"
                      onClick={() => onTokenSelect(token)}
                    >
                      Выбрать
                    </Button>
                    <IconButton
                      size="xs"
                      icon={<DeleteIcon />}
                      colorScheme="red"
                      onClick={() => handleDeleteToken(token._id)}
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Box>
    </VStack>
  );
};

export default TokenTool;