import { createContext, useContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';

const ThemeContext = createContext(null);

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#F5A623' },
      secondary: { main: '#F7B731' },
      success: { main: '#4CAF50' },
      error: { main: '#E74C3C' },
      info: { main: '#5B9BD5' },
      ...(mode === 'dark'
        ? {
            background: { default: '#1a1a1a', paper: '#2a2a2a' },
            text: { primary: '#FFFFFF', secondary: '#AAAAAA' },
          }
        : {
            background: { default: '#FAFAFA', paper: '#FFFFFF' },
            text: { primary: '#333333', secondary: '#888888' },
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: { borderRadius: 10 },
    components: {
      MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
      MuiCard: { styleOverrides: { root: { borderRadius: 12 } } },
    },
  });

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  const toggleTheme = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    localStorage.setItem('themeMode', next);
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeContext);
