import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PageHeader from '../components/common/PageHeader.jsx';
import SectionCard from '../components/common/SectionCard.jsx';
import FormTextField from '../components/common/FormTextField.jsx';
import DetailField from '../components/common/DetailField.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import {
  ChipActivo,
  ChipEstadoSolicitudTipo,
  ChipRol,
  ChipTipoCliente,
} from '../components/common/StatusChip.jsx';
import SolicitudTipoDialog from '../components/perfil/SolicitudTipoDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { perfilService } from '../services/perfil.service.js';
import {
  solicitudesTipoService,
  urlDocumentoSolicitud,
} from '../services/solicitudesTipo.service.js';
import {
  ETIQUETAS_TIPO_CLIENTE,
  formatearFechaHora,
} from '../utils/labels.js';
import { formatearTamano } from '../utils/files.js';
import { aplicarErroresApi } from '../utils/formErrors.js';

const esquema = z.object({
  nombres: z.string().trim().min(2, 'Ingresa tus nombres.'),
  apellidos: z.string().trim().min(2, 'Ingresa tus apellidos.'),
  email: z.string().trim().email('Ingresa un correo válido.'),
  telefono: z.string().trim().max(30).optional(),
  direccion: z.string().trim().max(255).optional(),
});

const OPCIONES_POR_TIPO = {
  LECTOR_GENERAL: ['ESTUDIANTE', 'BECARIO', 'INSTITUCION_EDUCATIVA'],
  ESTUDIANTE: ['BECARIO', 'INSTITUCION_EDUCATIVA'],
  BECARIO: ['INSTITUCION_EDUCATIVA'],
  INSTITUCION_EDUCATIVA: [],
};

export default function PerfilPage() {
  const { usuario, actualizarUsuario } = useAuth();
  const { mostrarExito, mostrarError } = useFeedback();
  const [errorGeneral, setErrorGeneral] = useState('');
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargandoSolicitudes, setCargandoSolicitudes] = useState(false);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [porCancelar, setPorCancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);

  const esCliente = usuario?.rol === 'CLIENTE';

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombres: usuario?.nombres ?? '',
      apellidos: usuario?.apellidos ?? '',
      email: usuario?.email ?? '',
      telefono: usuario?.telefono ?? '',
      direccion: usuario?.direccion ?? '',
    },
  });

  useEffect(() => {
    reset({
      nombres: usuario?.nombres ?? '',
      apellidos: usuario?.apellidos ?? '',
      email: usuario?.email ?? '',
      telefono: usuario?.telefono ?? '',
      direccion: usuario?.direccion ?? '',
    });
  }, [usuario, reset]);

  const cargarSolicitudes = useCallback(async () => {
    if (!esCliente) {
      setSolicitudes([]);
      return;
    }
    setCargandoSolicitudes(true);
    try {
      const respuesta = await solicitudesTipoService.mias();
      setSolicitudes(respuesta.data);
    } catch {
      setSolicitudes([]);
    } finally {
      setCargandoSolicitudes(false);
    }
  }, [esCliente]);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  const pendiente = solicitudes.find((solicitud) => solicitud.estado === 'PENDIENTE');
  const tiposDisponibles = useMemo(
    () => OPCIONES_POR_TIPO[usuario?.tipoCliente] ?? [],
    [usuario?.tipoCliente],
  );

  const guardar = async (datos) => {
    setErrorGeneral('');
    try {
      const respuesta = await perfilService.actualizar(datos);
      actualizarUsuario(respuesta.data);
      reset({
        nombres: respuesta.data.nombres,
        apellidos: respuesta.data.apellidos,
        email: respuesta.data.email,
        telefono: respuesta.data.telefono ?? '',
        direccion: respuesta.data.direccion ?? '',
      });
      mostrarExito(respuesta.mensaje ?? 'Perfil actualizado correctamente.');
    } catch (error) {
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  const cancelarSolicitud = async () => {
    if (!porCancelar) return;
    setCancelando(true);
    try {
      const respuesta = await solicitudesTipoService.cancelar(porCancelar.id);
      mostrarExito(respuesta.mensaje ?? 'Solicitud cancelada.');
      setPorCancelar(null);
      cargarSolicitudes();
    } catch (error) {
      mostrarError(error?.message ?? 'No se pudo cancelar la solicitud.');
    } finally {
      setCancelando(false);
    }
  };

  return (
    <Box>
      <PageHeader
        titulo="Mi perfil"
        descripcion="Actualiza tus datos personales y gestiona tu tipo de cliente."
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1.35fr)' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <Stack spacing={2.5}>
          <SectionCard titulo="Datos de la cuenta">
            <Stack spacing={2}>
              <DetailField etiqueta="Identificación" valor={usuario?.identificacion} />
              <DetailField etiqueta="Perfil de acceso">
                <ChipRol rol={usuario?.rol} />
              </DetailField>
              {esCliente ? (
                <DetailField etiqueta="Tipo de cliente">
                  <ChipTipoCliente tipo={usuario?.tipoCliente} />
                </DetailField>
              ) : null}
              <DetailField etiqueta="Estado de la cuenta">
                <ChipActivo activo={usuario?.activo} />
              </DetailField>
              {usuario?.documentoValidacion ? (
                <DetailField
                  etiqueta="Documento de validación"
                  valor={usuario.documentoValidacion}
                />
              ) : null}
              {usuario?.tipoCliente === 'INSTITUCION_EDUCATIVA' ? (
                <>
                  <Divider />
                  <DetailField
                    etiqueta="Institución educativa"
                    valor={usuario.institucionNombre}
                  />
                  <DetailField etiqueta="RUC" valor={usuario.institucionRuc} />
                  <DetailField etiqueta="Responsable" valor={usuario.responsableNombre} />
                  <DetailField etiqueta="Cargo" valor={usuario.responsableCargo} />
                  <DetailField etiqueta="Correo" valor={usuario.responsableEmail} />
                  <DetailField etiqueta="Teléfono" valor={usuario.responsableTelefono} />
                </>
              ) : null}
            </Stack>
            <Alert severity="info" sx={{ mt: 2.5 }}>
              Puedes actualizar tus datos personales. La identificación y el perfil de
              acceso solo los modifica el personal autorizado.
            </Alert>
          </SectionCard>

          {esCliente ? (
            <SectionCard
              titulo="Tipo de cliente"
              descripcion="Solicita tu clasificación como Estudiante, Becario o Institución educativa."
              accion={
                tiposDisponibles.length > 0 && !pendiente ? (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setDialogoAbierto(true)}
                  >
                    Solicitar cambio
                  </Button>
                ) : null
              }
            >
              {pendiente ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Tienes una solicitud pendiente para{' '}
                  <strong>
                    {ETIQUETAS_TIPO_CLIENTE[pendiente.tipoSolicitado] ??
                      pendiente.tipoSolicitado}
                  </strong>
                  . El Bibliotecario la revisará y te mantendrás en tu tipo actual
                  mientras tanto.
                </Alert>
              ) : null}

              {!pendiente && tiposDisponibles.length === 0 ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Tu tipo de cliente actual no requiere cambios adicionales.
                </Alert>
              ) : null}

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Los cambios de tipo se aprueban con el documento de validación. Para
                Institución educativa también se solicitan los datos del responsable.
              </Typography>

              {cargandoSolicitudes ? (
                <Typography variant="body2" color="text.secondary">
                  Cargando solicitudes...
                </Typography>
              ) : solicitudes.length === 0 ? (
                <EmptyState
                  titulo="Sin solicitudes registradas"
                  descripcion="Cuando solicites un cambio de tipo aparecerá aquí su estado."
                />
              ) : (
                <Stack spacing={1.5}>
                  {solicitudes.map((solicitud) => (
                    <Box
                      key={solicitud.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1.75,
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {ETIQUETAS_TIPO_CLIENTE[solicitud.tipoSolicitado] ??
                              solicitud.tipoSolicitado}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Solicitada el {formatearFechaHora(solicitud.createdAt)}
                          </Typography>
                        </Box>
                        <ChipEstadoSolicitudTipo estado={solicitud.estado} />
                      </Stack>

                      {solicitud.documentos?.length ? (
                        <Stack spacing={0.25} sx={{ mt: 1 }}>
                          {solicitud.documentos.map((documento) => (
                            <Link
                              key={documento.id}
                              href={urlDocumentoSolicitud(
                                solicitud.id,
                                documento.id,
                              )}
                              target="_blank"
                              rel="noopener"
                              variant="body2"
                              underline="hover"
                            >
                              {documento.nombreOriginal} (
                              {formatearTamano(documento.tamano)})
                            </Link>
                          ))}
                        </Stack>
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Documento: {solicitud.documentoValidacion}
                        </Typography>
                      )}

                      {solicitud.observacionRevision ? (
                        <Alert
                          severity={
                            solicitud.estado === 'RECHAZADA' ? 'error' : 'info'
                          }
                          sx={{ mt: 1.25 }}
                        >
                          {solicitud.observacionRevision}
                        </Alert>
                      ) : null}

                      {solicitud.estado === 'PENDIENTE' ? (
                        <Button
                          size="small"
                          color="inherit"
                          sx={{ mt: 1 }}
                          onClick={() => setPorCancelar(solicitud)}
                        >
                          Cancelar solicitud
                        </Button>
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              )}
            </SectionCard>
          ) : null}
        </Stack>

        <SectionCard
          titulo="Información personal"
          descripcion="Actualiza tus nombres, correo y datos de contacto."
        >
          {errorGeneral ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral}
            </Alert>
          ) : null}
          <Box component="form" onSubmit={handleSubmit(guardar)} noValidate>
            <Stack spacing={2.5}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <FormTextField
                  etiqueta="Nombres"
                  requerido
                  error={Boolean(errors.nombres)}
                  helperText={errors.nombres?.message}
                  {...register('nombres')}
                />
                <FormTextField
                  etiqueta="Apellidos"
                  requerido
                  error={Boolean(errors.apellidos)}
                  helperText={errors.apellidos?.message}
                  {...register('apellidos')}
                />
                <FormTextField
                  etiqueta="Correo electrónico"
                  type="email"
                  autoComplete="email"
                  requerido
                  error={Boolean(errors.email)}
                  helperText={
                    errors.email?.message ??
                    'Este correo se usa para iniciar sesión.'
                  }
                  {...register('email')}
                />
                <FormTextField
                  etiqueta="Teléfono"
                  type="tel"
                  error={Boolean(errors.telefono)}
                  helperText={errors.telefono?.message}
                  {...register('telefono')}
                />
                <FormTextField
                  etiqueta="Dirección"
                  error={Boolean(errors.direccion)}
                  helperText={errors.direccion?.message}
                  sx={{ gridColumn: { sm: '1 / -1' } }}
                  {...register('direccion')}
                />
              </Box>
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !isDirty}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </SectionCard>
      </Box>

      <SolicitudTipoDialog
        abierto={dialogoAbierto}
        tiposDisponibles={tiposDisponibles}
        onCerrar={() => setDialogoAbierto(false)}
        onEnviada={(respuesta) => {
          mostrarExito(respuesta.mensaje ?? 'Solicitud enviada.');
          cargarSolicitudes();
        }}
      />

      <ConfirmDialog
        abierto={Boolean(porCancelar)}
        titulo="Cancelar solicitud"
        mensaje={`Se cancelará la solicitud para ${ETIQUETAS_TIPO_CLIENTE[porCancelar?.tipoSolicitado] ?? 'el tipo seleccionado'}. Podrás presentar una nueva solicitud cuando lo necesites.`}
        textoConfirmar="Cancelar solicitud"
        color="error"
        onCerrar={() => setPorCancelar(null)}
        onConfirmar={cancelarSolicitud}
        cargando={cancelando}
      />
    </Box>
  );
}
