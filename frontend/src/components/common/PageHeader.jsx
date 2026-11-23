import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function PageHeader({ titulo, descripcion, accion }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" component="h1">
          {titulo}
        </Typography>
        {descripcion ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {descripcion}
          </Typography>
        ) : null}
      </Box>
      {accion ? <Box sx={{ flexShrink: 0 }}>{accion}</Box> : null}
    </Stack>
  );
}
