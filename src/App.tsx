
import {
  Box,
  Card,
  CardContent,
  useTheme,
  alpha,
} from '@mui/material';
import BrandingPanel from './components/BrandingPanel';
import LoginFormHeader from './components/LoginFormHeader';
import LoginForm from './components/LoginForm';

function App() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Card
        elevation={24}
        sx={{
          maxWidth: 1000,
          width: '100%',
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        }}
      >
        <Box sx={{ display: 'flex', minHeight: 500 }}>
          <BrandingPanel />
          
          {/* Right Login Form */}
          <Box sx={{ flex: 1, padding: 4 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <LoginFormHeader />
              <LoginForm />
            </CardContent>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}

export default App;