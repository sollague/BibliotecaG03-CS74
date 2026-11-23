import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

export default function LoadingState({ mensaje = 'Cargando información...' }) {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
      <CircularProgress size={30} />
      <Typography variant="body2" color="text.secondary">
        {mensaje}
      </Typography>
    </Stack>
  );
}

export function ErrorState({ mensaje, onReintentar }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 5,
        px: 2,
        border: '1px solid',
        borderColor: 'error.light',
        borderRadius: 2,
        backgroundColor: 'error.light',
      }}
    >
      <Typography variant="body1" sx={{ color: 'error.dark', mb: 1.5 }}>
        {mensaje}
      </Typography>
      {onReintentar ? (
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<RefreshOutlinedIcon />}
          onClick={onReintentar}
        >
          Reintentar
        </Button>
      ) : null}
    </Box>
  );
}
