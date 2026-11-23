import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LinkMui from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LocalLibraryOutlinedIcon from '@mui/icons-material/LocalLibraryOutlined';
import { useAuth } from '../context/AuthContext.jsx';
import FormTextField from '../components/common/FormTextField.jsx';
import { aplicarErroresApi } from '../utils/formErrors.js';

const esquema = z.object({
  email: z.string().trim().email('Ingresa un correo válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorGeneral, setErrorGeneral] = useState('');
  const [aviso, setAviso] = useState(location.state?.mensaje ?? '');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), defaultValues: { email: '', password: '' } });

  const enviar = async (datos) => {
    setErrorGeneral('');
    setAviso('');
    try {
      await login(datos);
      const destino = location.state?.desde ?? '/';
      navigate(destino, { replace: true });
    } catch (error) {
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 430,
          p: { xs: 3, sm: 4 },
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Stack alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.dark',
            }}
          >
            <LocalLibraryOutlinedIcon fontSize="large" />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h1">
              Biblioteca Virtual G03
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sistema de administración bibliotecaria
            </Typography>
          </Box>
        </Stack>

        {aviso ? (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAviso('')}>
            {aviso}
          </Alert>
        ) : null}

        {errorGeneral ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGeneral}
          </Alert>
        ) : null}

        <Box component="form" onSubmit={handleSubmit(enviar)} noValidate>
          <Stack spacing={2}>
            <FormTextField
              etiqueta="Correo electrónico"
              type="email"
              autoComplete="email"
              autoFocus
              requerido
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email')}
            />
            <FormTextField
              etiqueta="Contraseña"
              type="password"
              autoComplete="current-password"
              requerido
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register('password')}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 1 }}
            >
              {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          ¿No tienes una cuenta?{' '}
          <LinkMui component={Link} to="/registro" sx={{ fontWeight: 600 }}>
            Regístrate
          </LinkMui>
        </Typography>
      </Paper>
    </Box>
  );
}
