import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../../config';
import axios from 'axios';

const GlassBox = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  padding: theme.spacing(4),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: theme.palette.common.white
}));

const GlassInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}));

const PageWrapper = styled(Box)({
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #1a237e 0%, #000000 100%)',
  '& #particles-js': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1
  }
});

const ContentWrapper = styled(Box)({
  position: 'relative',
  zIndex: 2,
  width: '100%'
});

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const adminToken = localStorage.getItem('adminToken');
    console.log('Admin token from localStorage:', adminToken);
    
    if (adminToken) {
      console.log('Admin already logged in, redirecting to dashboard');
      navigate('/admin/dashboard');
      return;
    }

    // Initialize particles.js
    if ((window as any).particlesJS) {
      (window as any).particlesJS.load('particles-js', '/particles.json', function() {
        console.log('particles.js loaded');
      });
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with:', formData);
      console.log('API URL:', API_URL);
      
      // Use axios instead of fetch for better error handling
      const response = await axios.post(`${API_URL}/admin/login`, formData);
      
      console.log('Login response:', response.data);

      // Store token in localStorage
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminRole', response.data.role);

      console.log('Token stored in localStorage');
      
      // Redirect to admin dashboard using React Router
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div id="particles-js"></div>
      <ContentWrapper>
        <Container maxWidth="xs">
          <GlassBox>
            <Typography variant="h4" align="center" gutterBottom>
              Admin Login
            </Typography>
            <Typography variant="body1" align="center" sx={{ mb: 4, color: 'rgba(255,255,255,0.7)' }}>
              Enter your credentials to access the admin panel
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(211, 47, 47, 0.1)' }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <GlassInput
                name="username"
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <GlassInput
                name="password"
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  borderRadius: 2,
                  height: 56,
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                  }
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </GlassBox>
        </Container>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default AdminLogin;