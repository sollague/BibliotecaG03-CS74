import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';

export default function FormDialog({
  abierto,
  titulo,
  descripcion,
  onCerrar,
  onSubmit,
  cargando = false,
  textoGuardar = 'Guardar',
  textoCancelar = 'Cancelar',
  maxWidth = 'sm',
  children,
}) {
  return (
    <Dialog
      open={abierto}
      onClose={cargando ? undefined : onCerrar}
      maxWidth={maxWidth}
      fullWidth
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <DialogTitle>{titulo}</DialogTitle>
        <DialogContent dividers>
          {descripcion ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {descripcion}
            </Typography>
          ) : null}
          {children}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onCerrar} disabled={cargando} color="inherit">
            {textoCancelar}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={cargando}
            startIcon={cargando ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {textoGuardar}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
