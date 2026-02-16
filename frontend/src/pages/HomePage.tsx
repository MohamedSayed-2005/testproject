import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Favorite,
  GraphicEq,
  ShowChart,
  Biotech,
} from '@mui/icons-material';

const features = [
  {
    title: 'Medical Signals',
    description:
      'Advanced ECG signal analysis with AI classification, multiple viewer modes, and classic ML comparison',
    icon: <Favorite sx={{ fontSize: 60 }} />,
    path: '/medical',
    features: [
      'Multi-channel ECG visualization',
      'AI-powered arrhythmia detection',
      'XOR, Polar, and Recurrence graphs',
      'Real-time HRV analysis',
    ],
  },
  {
    title: 'Acoustic Signals',
    description:
      'Doppler effect simulation and analysis, drone/submarine sound detection with spectrograms',
    icon: <GraphicEq sx={{ fontSize: 60 }} />,
    path: '/acoustic',
    features: [
      'Doppler effect simulation',
      'Vehicle velocity estimation',
      'Drone sound detection',
      'Real-time spectrogram',
    ],
  },
  {
    title: 'Stock Market',
    description:
      'Real-time stock, currency, and commodity data with AI-powered price predictions',
    icon: <ShowChart sx={{ fontSize: 60 }} />,
    path: '/stock',
    features: [
      'Real-time market data',
      'Candlestick charts',
      'LSTM price predictions',
      'Moving averages',
    ],
  },
  {
    title: 'Microbiome Analysis',
    description:
      'Microbiome data visualization and patient profile estimation using machine learning',
    icon: <Biotech sx={{ fontSize: 60 }} />,
    path: '/microbiome',
    features: [
      'Bacterial composition analysis',
      'PCA visualization',
      'Diversity metrics',
      'Disease prediction',
    ],
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom align="center">
          Multi-Domain Signal Viewer
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom align="center" color="text.secondary">
          A comprehensive platform for analyzing medical, acoustic, financial, and biological signals
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} key={feature.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography gutterBottom variant="h5" component="h2" align="center">
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {feature.description}
                </Typography>
                <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                  {feature.features.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="large"
                  fullWidth
                  variant="contained"
                  onClick={() => navigate(feature.path)}
                >
                  Open {feature.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Features
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  AI-Powered Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Deep learning models for ECG classification, stock prediction, and microbiome profiling
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Interactive Visualizations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time charts with Plotly.js and D3.js, supporting multiple visualization modes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Professional Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Compare AI predictions with classic ML methods for comprehensive insights
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
