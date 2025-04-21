import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    secondary: '#6C757D',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    error: '#DC3545',
    success: '#28A745',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#2196F3',
    secondary: '#6C757D',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#DC3545',
    success: '#28A745',
  },
};