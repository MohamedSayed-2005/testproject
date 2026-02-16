import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MedicalPage from './pages/MedicalPage';
import AcousticPage from './pages/AcousticPage';
import StockPage from './pages/StockPage';
import MicrobiomePage from './pages/MicrobiomePage';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [darkMode, setDarkMode] = React.useState(true);

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/medical" element={<MedicalPage />} />
            <Route path="/acoustic" element={<AcousticPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/microbiome" element={<MicrobiomePage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
