import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function SummaryCard({ titulo, valor, icono, descripcion }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: 'divider',
        borderRadius: 2.5,
        p: 2,
        height: '100%',
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
      }}
    >
      {icono ? (
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            backgroundColor: 'primary.light',
            color: 'primary.dark',
            flexShrink: 0,
          }}
        >
          {icono}
        </Box>
      ) : null}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {titulo}
        </Typography>
        <Typography variant="h5" sx={{ lineHeight: 1.3 }}>
          {valor}
        </Typography>
        {descripcion ? (
          <Typography variant="caption" color="text.secondary">
            {descripcion}
          </Typography>
        ) : null}
      </Box>
    </Paper>
  );
}
