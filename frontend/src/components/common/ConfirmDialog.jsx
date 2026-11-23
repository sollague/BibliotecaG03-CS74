import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';

export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  onCerrar,
  onConfirmar,
  cargando = false,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  color = 'primary',
}) {
  return (
    <Dialog
      open={abierto}
      onClose={cargando ? undefined : onCerrar}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.secondary', whiteSpace: 'pre-line' }}>
          {mensaje}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCerrar} disabled={cargando} color="inherit">
          {textoCancelar}
        </Button>
        <Button
          onClick={onConfirmar}
          variant="contained"
          color={color}
          disabled={cargando}
          startIcon={cargando ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {textoConfirmar}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
