import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export default function EmptyState({
  titulo = 'No hay información para mostrar',
  descripcion,
  icono,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: 6,
        px: 2,
        color: 'text.secondary',
      }}
    >
      <Box sx={{ color: 'text.disabled', mb: 1 }}>
        {icono ?? <InboxOutlinedIcon fontSize="large" />}
      </Box>
      <Typography variant="h6" sx={{ color: 'text.primary', mb: 0.5 }}>
        {titulo}
      </Typography>
      {descripcion ? <Typography variant="body2">{descripcion}</Typography> : null}
    </Box>
  );
}
