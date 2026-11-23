import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function DetailField({ etiqueta, valor, children }) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 0.25, fontWeight: 500 }}
      >
        {etiqueta}
      </Typography>
      {children ?? (
        <Typography variant="body2" sx={{ color: 'text.primary' }}>
          {valor === null || valor === undefined || valor === '' ? '—' : valor}
        </Typography>
      )}
    </Box>
  );
}
