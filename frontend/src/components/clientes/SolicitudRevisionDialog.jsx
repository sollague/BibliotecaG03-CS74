import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormDialog from '../common/FormDialog.jsx';
import FormSelect from '../common/FormSelect.jsx';
import FormTextField from '../common/FormTextField.jsx';
import DetailField from '../common/DetailField.jsx';
import { ChipTipoCliente } from '../common/StatusChip.jsx';
import {
  ETIQUETAS_TIPO_CLIENTE,
  formatearFechaHora,
  nombreCompleto,
} from '../../utils/labels.js';
import { formatearTamano } from '../../utils/files.js';
import {
  solicitudesTipoService,
  urlDocumentoSolicitud,
} from '../../services/solicitudesTipo.service.js';
import { aplicarErroresApi } from '../../utils/formErrors.js';

const esquema = z
  .object({
    estado: z.enum(['APROBADA', 'RECHAZADA']),
    observacionRevision: z.string().trim().max(255).optional(),
  })
  .superRefine((datos, ctx) => {
    if (datos.estado === 'RECHAZADA' && !datos.observacionRevision) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['observacionRevision'],
        message: 'Indica el motivo del rechazo para que el cliente pueda corregirlo.',
      });
    }
  });

export default function SolicitudRevisionDialog({
  abierto,
  solicitud,
  onCerrar,
  onRevisada,
}) {
  const [errorGeneral, setErrorGeneral] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { estado: 'APROBADA', observacionRevision: '' },
  });

  const estado = watch('estado');

  useEffect(() => {
    if (!abierto) return;
    setErrorGeneral('');
    reset({ estado: 'APROBADA', observacionRevision: '' });
  }, [abierto, reset]);

  const enviar = async (datos) => {
    setErrorGeneral('');
    try {
      const respuesta = await solicitudesTipoService.revisar(solicitud.id, datos);
      onRevisada(respuesta);
      onCerrar();
    } catch (error) {
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  if (!solicitud) return null;

  return (
    <FormDialog
      abierto={abierto}
      titulo="Revisar solicitud de tipo de cliente"
      descripcion={`${nombreCompleto(solicitud.cliente)} · ${solicitud.cliente?.identificacion ?? ''}`}
      onCerrar={onCerrar}
      onSubmit={handleSubmit(enviar)}
      cargando={isSubmitting}
      textoGuardar={estado === 'APROBADA' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
      maxWidth="md"
    >
      {errorGeneral ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorGeneral}
        </Alert>
      ) : null}

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        <DetailField etiqueta="Tipo actual">
          <ChipTipoCliente tipo={solicitud.cliente?.tipoCliente} />
        </DetailField>
        <DetailField etiqueta="Tipo solicitado">
          <ChipTipoCliente tipo={solicitud.tipoSolicitado} />
        </DetailField>
        <DetailField etiqueta="Documentos adjuntos">
          {solicitud.documentos?.length ? (
            <Stack spacing={0.5}>
              {solicitud.documentos.map((documento) => (
                <Link
                  key={documento.id}
                  href={urlDocumentoSolicitud(solicitud.id, documento.id)}
                  target="_blank"
                  rel="noopener"
                  underline="hover"
                  variant="body2"
                >
                  {documento.nombreOriginal} ({formatearTamano(documento.tamano)})
                </Link>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2">
              {solicitud.documentoValidacion || 'Sin archivos adjuntos'}
            </Typography>
          )}
        </DetailField>
        <DetailField etiqueta="Motivo" valor={solicitud.motivo || 'No indicado'} />
        <DetailField
          etiqueta="Fecha de solicitud"
          valor={formatearFechaHora(solicitud.createdAt)}
        />
        {solicitud.tipoSolicitado === 'INSTITUCION_EDUCATIVA' ? (
          <>
            <Divider />
            <DetailField
              etiqueta="Institución"
              valor={solicitud.institucionNombre || 'No indicada'}
            />
            <DetailField etiqueta="RUC" valor={solicitud.institucionRuc} />
            <DetailField
              etiqueta="Responsable"
              valor={solicitud.responsableNombre || 'No indicado'}
            />
            <DetailField etiqueta="Cargo" valor={solicitud.responsableCargo} />
            <DetailField etiqueta="Correo" valor={solicitud.responsableEmail} />
            <DetailField etiqueta="Teléfono" valor={solicitud.responsableTelefono} />
          </>
        ) : null}
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Controller
          name="estado"
          control={control}
          render={({ field }) => (
            <FormSelect
              etiqueta="Decisión"
              requerido
              error={Boolean(errors.estado)}
              helperText={errors.estado?.message}
              opciones={[
                { valor: 'APROBADA', etiqueta: 'Aprobar y actualizar el tipo' },
                { valor: 'RECHAZADA', etiqueta: 'Rechazar la solicitud' },
              ]}
              {...field}
            />
          )}
        />
        <FormTextField
          etiqueta="Observación para el cliente"
          requerido={estado === 'RECHAZADA'}
          error={Boolean(errors.observacionRevision)}
          helperText={
            errors.observacionRevision?.message ??
            (estado === 'RECHAZADA'
              ? 'Explica qué debe corregir el cliente.'
              : 'Opcional.')
          }
          slotProps={{ htmlInput: { maxLength: 255 } }}
          {...register('observacionRevision')}
        />
      </Box>

      <Alert
        severity={estado === 'APROBADA' ? 'success' : 'warning'}
        sx={{ mt: 2 }}
      >
        {estado === 'APROBADA'
          ? `Al aprobar, el cliente pasará a ${ETIQUETAS_TIPO_CLIENTE[solicitud.tipoSolicitado] ?? solicitud.tipoSolicitado} y se guardarán el documento y los datos de validación.`
          : 'Al rechazar, el cliente conservará su tipo actual y verá la observación registrada.'}
      </Alert>
    </FormDialog>
  );
}
