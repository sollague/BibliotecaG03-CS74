import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function SectionCard({ titulo, descripcion, accion, children, sx }) {
  return (
    <Paper
      variant="outlined"
      sx={{ borderColor: 'divider', borderRadius: 2.5, p: { xs: 2, sm: 2.5 }, ...sx }}
    >
      {titulo || accion ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Box>
            {titulo ? (
              <Typography variant="h6" component="h2">
                {titulo}
              </Typography>
            ) : null}
            {descripcion ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {descripcion}
              </Typography>
            ) : null}
          </Box>
          {accion}
        </Stack>
      ) : null}
      {children}
    </Paper>
  );
}
