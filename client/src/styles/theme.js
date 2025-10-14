import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#e6f3ff',
      100: '#b3d9ff',
      500: '#0066cc',
      600: '#0052a3',
    }
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'light' ? 'gray.50' : 'gray.800',
      },
    }),
  },
});

export default theme;