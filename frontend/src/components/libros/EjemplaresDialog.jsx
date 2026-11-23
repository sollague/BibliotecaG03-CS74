import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { ChipCondicion, ChipEstadoPrestamo } from '../common/StatusChip.jsx';
import { librosService } from '../../services/libros.service.js';
import { useFeedback } from '../../context/FeedbackContext.jsx';
import { nombreCompleto } from '../../utils/labels.js';

export default function EjemplaresDialog({ abierto, libro, onCerrar, onCambio }) {
  const { mostrarExito, mostrarError } = useFeedback();
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);
  const [porEliminar, setPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(async () => {
    if (!libro) return;
    setCargando(true);
    setError('');
    try {
      const respuesta = await librosService.ejemplares(libro.id);
      setDatos(respuesta.data);
    } catch (err) {
      setError(err?.message ?? 'No se pudieron cargar los ejemplares.');
    } finally {
      setCargando(false);
    }
  }, [libro]);

  useEffect(() => {
    if (abierto) {
      setCantidad(1);
      cargar();
    }
  }, [abierto, cargar]);

  const agregar = async () => {
    const numero = Number(cantidad);
    if (!Number.isInteger(numero) || numero < 1) {
      mostrarError('Ingresa una cantidad válida de ejemplares.');
      return;
    }
    setAgregando(true);
    try {
      const respuesta = await librosService.agregarEjemplares(libro.id, numero);
      mostrarExito(respuesta.mensaje);
      setCantidad(1);
      await cargar();
      onCambio?.();
    } catch (err) {
      mostrarError(err?.message ?? 'No se pudieron agregar los ejemplares.');
    } finally {
      setAgregando(false);
    }
  };

  const eliminar = async () => {
    if (!porEliminar) return;
    setEliminando(true);
    try {
      const respuesta = await librosService.eliminarEjemplar(porEliminar.id);
      mostrarExito(respuesta.mensaje);
      setPorEliminar(null);
      await cargar();
      onCambio?.();
    } catch (err) {
      mostrarError(err?.message ?? 'No se pudo eliminar el ejemplar.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      <Dialog open={abierto} onClose={cargando ? undefined : onCerrar} maxWidth="md" fullWidth>
        <DialogTitle>Ejemplares del libro</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {libro?.titulo} · ISBN {libro?.isbn}
          </Typography>

          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 2 }}
          >
            <TextField
              label="Cantidad a agregar"
              type="number"
              size="small"
              value={cantidad}
              onChange={(evento) => setCantidad(evento.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: 1, max: 100 },
              }}
              sx={{ maxWidth: { sm: 200 } }}
            />
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={agregar}
              disabled={agregando}
            >
              {agregando ? 'Agregando...' : 'Agregar ejemplares'}
            </Button>
          </Stack>

          {cargando ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : datos?.ejemplares?.length ? (
            <TableContainer sx={{ maxHeight: 340, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Condición</TableCell>
                    <TableCell>Préstamo activo</TableCell>
                    <TableCell align="right">Historial</TableCell>
                    <TableCell align="right">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datos.ejemplares.map((ejemplar) => (
                    <TableRow key={ejemplar.id}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        {ejemplar.codigo}
                      </TableCell>
                      <TableCell>
                        <ChipCondicion condicion={ejemplar.condicion} />
                      </TableCell>
                      <TableCell>
                        {ejemplar.prestamoActivo ? (
                          <Stack spacing={0.5} alignItems="flex-start">
                            <ChipEstadoPrestamo estado={ejemplar.prestamoActivo.estado} />
                            <Typography variant="caption" color="text.secondary">
                              {nombreCompleto(ejemplar.prestamoActivo.cliente)}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sin préstamo activo
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">{ejemplar.totalPrestamos}</TableCell>
                      <TableCell align="right">
                        <Tooltip
                          title={
                            ejemplar.totalPrestamos > 0
                              ? 'No se puede eliminar un ejemplar con historial de préstamos'
                              : 'Eliminar ejemplar'
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={ejemplar.totalPrestamos > 0}
                              onClick={() => setPorEliminar(ejemplar)}
                              aria-label={`Eliminar ejemplar ${ejemplar.codigo}`}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <EmptyState
              titulo="No hay ejemplares registrados"
              descripcion="Agrega al menos un ejemplar para que el libro esté disponible."
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onCerrar} color="inherit">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        abierto={Boolean(porEliminar)}
        titulo="Eliminar ejemplar"
        mensaje={`Se eliminará el ejemplar ${porEliminar?.codigo ?? ''}. Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        color="error"
        onCerrar={() => setPorEliminar(null)}
        onConfirmar={eliminar}
        cargando={eliminando}
      />
    </>
  );
}
