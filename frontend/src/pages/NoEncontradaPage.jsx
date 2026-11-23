import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function NoEncontradaPage() {
  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h3" sx={{ color: 'primary.main', mb: 1 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Página no encontrada
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        La dirección que intentaste abrir no existe o no está disponible para tu perfil.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Volver al inicio
      </Button>
    </Box>
  );
}
