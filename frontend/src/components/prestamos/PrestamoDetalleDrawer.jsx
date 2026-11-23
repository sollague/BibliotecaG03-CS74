import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import FormDialog from '../common/FormDialog.jsx';
import FormSelect from '../common/FormSelect.jsx';
import FormTextField from '../common/FormTextField.jsx';
import DetailField from '../common/DetailField.jsx';
import { ChipCondicion, ChipEstadoPrestamo } from '../common/StatusChip.jsx';
import { ErrorState } from '../common/LoadingState.jsx';
import { useFeedback } from '../../context/FeedbackContext.jsx';
import { prestamosService } from '../../services/prestamos.service.js';
import { aplicarErroresApi } from '../../utils/formErrors.js';
import {
  ETIQUETAS_ESTADO,
  formatearFecha,
  formatearFechaHora,
  nombreCompleto,
} from '../../utils/labels.js';

const esquemaDevolucion = z.object({
  condicion: z.enum(['BUENO', 'DANADO', 'PERDIDO'], {
    errorMap: () => ({ message: 'Selecciona la condición del ejemplar.' }),
  }),
  observaciones: z.string().max(500).optional(),
});

const esquemaCancelacion = z.object({
  observaciones: z.string().max(500).optional(),
});

function DevolucionDialog({ abierto, onCerrar, onConfirmar, cargando }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaDevolucion),
    defaultValues: { condicion: 'BUENO', observaciones: '' },
  });
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    if (abierto) {
      reset({ condicion: 'BUENO', observaciones: '' });
      setErrorGeneral('');
    }
  }, [abierto, reset]);

  const enviar = async (datos) => {
    setErrorGeneral('');
    try {
      await onConfirmar(datos);
    } catch (error) {
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  return (
    <FormDialog
      abierto={abierto}
      titulo="Registrar devolución"
      descripcion="Indica la condición en la que se recibe el ejemplar. Si se marca como perdido, el ejemplar no volverá a estar disponible."
      onCerrar={onCerrar}
      onSubmit={handleSubmit(enviar)}
      cargando={cargando}
      textoGuardar="Registrar devolución"
      maxWidth="sm"
    >
      {errorGeneral ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorGeneral}
        </Alert>
      ) : null}
      <Stack spacing={2}>
        <Controller
          name="condicion"
          control={control}
          render={({ field }) => (
            <FormSelect
              etiqueta="Condición del ejemplar"
              requerido
              error={Boolean(errors.condicion)}
              helperText={errors.condicion?.message}
              opciones={[
                { valor: 'BUENO', etiqueta: 'Buen estado' },
                { valor: 'DANADO', etiqueta: 'Dañado' },
                { valor: 'PERDIDO', etiqueta: 'Perdido' },
              ]}
              {...field}
            />
          )}
        />
        <FormTextField
          etiqueta="Observaciones"
          multiline
          minRows={3}
          error={Boolean(errors.observaciones)}
          helperText={errors.observaciones?.message ?? 'Opcional.'}
          {...register('observaciones')}
        />
      </Stack>
    </FormDialog>
  );
}

function CancelacionDialog({ abierto, onCerrar, onConfirmar, cargando }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaCancelacion),
    defaultValues: { observaciones: '' },
  });
  const [errorGeneral, setErrorGeneral] = useState('');

  useEffect(() => {
    if (abierto) {
      reset({ observaciones: '' });
      setErrorGeneral('');
    }
  }, [abierto, reset]);

  const enviar = async (datos) => {
    setErrorGeneral('');
    try {
      await onConfirmar(datos);
    } catch (error) {
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  return (
    <FormDialog
      abierto={abierto}
      titulo="Cancelar préstamo"
      descripcion="El préstamo quedará cancelado y el ejemplar reservado volverá a estar disponible, si corresponde."
      onCerrar={onCerrar}
      onSubmit={handleSubmit(enviar)}
      cargando={cargando}
      textoGuardar="Cancelar préstamo"
      maxWidth="sm"
    >
      {errorGeneral ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorGeneral}
        </Alert>
      ) : null}
      <FormTextField
        etiqueta="Motivo u observaciones"
        multiline
        minRows={3}
        error={Boolean(errors.observaciones)}
        helperText={errors.observaciones?.message ?? 'Opcional.'}
        {...register('observaciones')}
      />
    </FormDialog>
  );
}

export default function PrestamoDetalleDrawer({
  abierto,
  prestamoId,
  onCerrar,
  onCambio,
  esStaff,
}) {
  const { mostrarExito, mostrarError } = useFeedback();
  const [prestamo, setPrestamo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);
  const [devolucionAbierta, setDevolucionAbierta] = useState(false);
  const [cancelacionAbierta, setCancelacionAbierta] = useState(false);

  const cargar = useCallback(async () => {
    if (!prestamoId) return;
    setCargando(true);
    setError('');
    try {
      const respuesta = await prestamosService.obtener(prestamoId);
      setPrestamo(respuesta.data);
    } catch (err) {
      setError(err?.message ?? 'No se pudo cargar el préstamo.');
    } finally {
      setCargando(false);
    }
  }, [prestamoId]);

  useEffect(() => {
    if (abierto && prestamoId) cargar();
  }, [abierto, prestamoId, cargar]);

  const ejecutar = async (fn, mensajeExito) => {
    setProcesando(true);
    try {
      const respuesta = await fn();
      mostrarExito(respuesta?.mensaje ?? mensajeExito);
      setConfirmacion(null);
      setDevolucionAbierta(false);
      setCancelacionAbierta(false);
      await cargar();
      onCambio?.();
    } catch (err) {
      mostrarError(err?.message ?? 'No se pudo completar la acción.');
    } finally {
      setProcesando(false);
    }
  };

  const acciones = [];
  if (prestamo && esStaff) {
    if (prestamo.estado === 'SOLICITADO') {
      acciones.push({
        clave: 'aprobar',
        texto: 'Aprobar solicitud',
        variante: 'contained',
        onClick: () =>
          setConfirmacion({
            titulo: 'Aprobar solicitud',
            mensaje: `Se aprobará la solicitud de «${prestamo.libro.titulo}» y se reservará un ejemplar disponible.`,
            textoConfirmar: 'Aprobar',
            accion: () => prestamosService.aprobar(prestamo.id),
            mensajeExito: 'Solicitud aprobada correctamente.',
          }),
      });
    }
    if (prestamo.estado === 'APROBADO') {
      acciones.push({
        clave: 'entregar',
        texto: 'Registrar entrega',
        variante: 'contained',
        onClick: () =>
          setConfirmacion({
            titulo: 'Registrar entrega',
            mensaje: `Se registrará la entrega del ejemplar ${prestamo.ejemplar?.codigo ?? ''} y se calculará la fecha límite según la política del cliente.`,
            textoConfirmar: 'Registrar entrega',
            accion: () => prestamosService.entregar(prestamo.id),
            mensajeExito: 'Entrega registrada correctamente.',
          }),
      });
    }
    if (['PRESTADO', 'RENOVADO'].includes(prestamo.estado)) {
      acciones.push({
        clave: 'renovar',
        texto: 'Renovar',
        variante: 'outlined',
        onClick: () =>
          setConfirmacion({
            titulo: 'Renovar préstamo',
            mensaje: `Se extenderá la fecha límite del préstamo según los días de renovación configurados para el tipo de cliente. Renovaciones realizadas: ${prestamo.renovacionesRealizadas}.`,
            textoConfirmar: 'Renovar',
            accion: () => prestamosService.renovar(prestamo.id),
            mensajeExito: 'Préstamo renovado correctamente.',
          }),
      });
      acciones.push({
        clave: 'devolver',
        texto: 'Registrar devolución',
        variante: 'contained',
        color: 'success',
        onClick: () => setDevolucionAbierta(true),
      });
    }
    if (['SOLICITADO', 'APROBADO'].includes(prestamo.estado)) {
      acciones.push({
        clave: 'cancelar',
        texto: 'Cancelar',
        variante: 'text',
        color: 'error',
        onClick: () => setCancelacionAbierta(true),
      });
    }
  } else if (prestamo && !esStaff && prestamo.estado === 'SOLICITADO') {
    acciones.push({
      clave: 'cancelar',
      texto: 'Cancelar solicitud',
      variante: 'outlined',
      color: 'error',
      onClick: () => setCancelacionAbierta(true),
    });
  }

  const confirmarAccion = async () => {
    if (!confirmacion) return;
    await ejecutar(confirmacion.accion, confirmacion.mensajeExito);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={abierto}
        onClose={procesando ? undefined : onCerrar}
        PaperProps={{ sx: { width: { xs: '100%', sm: 460 } } }}
      >
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Detalle del préstamo
          </Typography>
          <IconButton onClick={onCerrar} disabled={procesando} aria-label="Cerrar detalle">
            <CloseOutlinedIcon />
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ p: 2.5, flexGrow: 1, overflowY: 'auto' }}>
          {cargando && !prestamo ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
              <CircularProgress size={28} />
            </Box>
          ) : error ? (
            <ErrorState mensaje={error} onReintentar={cargar} />
          ) : prestamo ? (
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <ChipEstadoPrestamo estado={prestamo.estadoEfectivo} />
                <ChipCondicion condicion={prestamo.condicionDevolucion} />
              </Stack>

              <Box>
                <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                  {prestamo.libro.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {prestamo.libro.autor} · {prestamo.libro.editorial}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ISBN {prestamo.libro.isbn}
                </Typography>
              </Box>

              <Divider />

              <Stack spacing={1.75}>
                <DetailField etiqueta="Cliente">
                  {nombreCompleto(prestamo.cliente)}
                </DetailField>
                <DetailField
                  etiqueta="Identificación"
                  valor={prestamo.cliente?.identificacion}
                />
                <DetailField etiqueta="Correo" valor={prestamo.cliente?.email} />
                <DetailField
                  etiqueta="Ejemplar"
                  valor={prestamo.ejemplar?.codigo ?? 'Sin ejemplar asignado'}
                />
                <DetailField
                  etiqueta="Categoría"
                  valor={prestamo.libro.categoria?.nombre}
                />
              </Stack>

              <Divider />

              <Stack spacing={1.75}>
                <DetailField
                  etiqueta="Fecha de solicitud"
                  valor={formatearFechaHora(prestamo.fechaSolicitud)}
                />
                <DetailField
                  etiqueta="Fecha de aprobación"
                  valor={formatearFechaHora(prestamo.fechaAprobacion)}
                />
                <DetailField
                  etiqueta="Fecha de entrega"
                  valor={formatearFechaHora(prestamo.fechaEntrega)}
                />
                <DetailField
                  etiqueta="Fecha límite"
                  valor={formatearFecha(prestamo.fechaLimite)}
                />
                <DetailField
                  etiqueta="Fecha de devolución"
                  valor={formatearFechaHora(prestamo.fechaDevolucion)}
                />
                <DetailField
                  etiqueta="Renovaciones realizadas"
                  valor={prestamo.renovacionesRealizadas}
                />
                <DetailField etiqueta="Observaciones">
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-line', color: 'text.primary' }}
                  >
                    {prestamo.observaciones || '—'}
                  </Typography>
                </DetailField>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  Historial de estados
                </Typography>
                <Stack spacing={1.5}>
                  {(prestamo.historial ?? []).map((evento) => (
                    <Box
                      key={evento.id}
                      sx={{
                        borderLeft: '3px solid',
                        borderColor: 'primary.main',
                        pl: 1.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {ETIQUETAS_ESTADO[evento.estadoNuevo] ?? evento.estadoNuevo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatearFechaHora(evento.createdAt)}
                        {evento.usuario
                          ? ` · ${nombreCompleto(evento.usuario)}`
                          : ''}
                      </Typography>
                      {evento.observacion ? (
                        <Typography variant="body2" color="text.secondary">
                          {evento.observacion}
                        </Typography>
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : null}
        </Box>

        {prestamo && acciones.length > 0 ? (
          <>
            <Divider />
            <Stack
              direction="row"
              spacing={1}
              sx={{ p: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}
            >
              {acciones.map((accion) => (
                <Button
                  key={accion.clave}
                  variant={accion.variante}
                  color={accion.color ?? 'primary'}
                  onClick={accion.onClick}
                  disabled={procesando}
                >
                  {accion.texto}
                </Button>
              ))}
            </Stack>
          </>
        ) : null}
      </Drawer>

      <ConfirmDialog
        abierto={Boolean(confirmacion)}
        titulo={confirmacion?.titulo}
        mensaje={confirmacion?.mensaje}
        textoConfirmar={confirmacion?.textoConfirmar ?? 'Confirmar'}
        onCerrar={() => setConfirmacion(null)}
        onConfirmar={confirmarAccion}
        cargando={procesando}
      />

      <DevolucionDialog
        abierto={devolucionAbierta}
        onCerrar={() => setDevolucionAbierta(false)}
        onConfirmar={(datos) =>
          ejecutar(
            () => prestamosService.devolver(prestamo.id, datos),
            'Devolución registrada correctamente.',
          )
        }
        cargando={procesando}
      />

      <CancelacionDialog
        abierto={cancelacionAbierta}
        onCerrar={() => setCancelacionAbierta(false)}
        onConfirmar={(datos) =>
          ejecutar(
            () => prestamosService.cancelar(prestamo.id, datos),
            'Préstamo cancelado correctamente.',
          )
        }
        cargando={procesando}
      />
    </>
  );
}
