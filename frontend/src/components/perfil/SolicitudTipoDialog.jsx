import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FormDialog from '../common/FormDialog.jsx';
import FormTextField from '../common/FormTextField.jsx';
import FormSelect from '../common/FormSelect.jsx';
import { ETIQUETAS_TIPO_CLIENTE } from '../../utils/labels.js';
import { formatearTamano } from '../../utils/files.js';
import { solicitudesTipoService } from '../../services/solicitudesTipo.service.js';
import { aplicarErroresApi } from '../../utils/formErrors.js';

const MAX_ARCHIVOS = 3;
const MAX_TAMANO = 5 * 1024 * 1024;
const TIPOS_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];

const esquema = z
  .object({
    tipoSolicitado: z.enum(['ESTUDIANTE', 'BECARIO', 'INSTITUCION_EDUCATIVA']),
    motivo: z.string().trim().max(255).optional(),
    institucionNombre: z.string().trim().max(191).optional(),
    institucionRuc: z.string().trim().max(20).optional(),
    responsableNombre: z.string().trim().max(191).optional(),
    responsableCargo: z.string().trim().max(100).optional(),
    responsableEmail: z.string().trim().max(191).optional(),
    responsableTelefono: z.string().trim().max(30).optional(),
  })
  .superRefine((datos, ctx) => {
    if (datos.tipoSolicitado !== 'INSTITUCION_EDUCATIVA') return;

    if (!datos.institucionNombre?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['institucionNombre'],
        message: 'Ingresa el nombre de la institución educativa.',
      });
    }
    if (!datos.responsableNombre?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['responsableNombre'],
        message: 'Ingresa el nombre del responsable.',
      });
    }
    if (
      datos.responsableEmail?.trim() &&
      !z.string().email().safeParse(datos.responsableEmail.trim()).success
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['responsableEmail'],
        message: 'Ingresa un correo válido para el responsable.',
      });
    }
  });

export default function SolicitudTipoDialog({
  abierto,
  tiposDisponibles,
  onCerrar,
  onEnviada,
}) {
  const [errorGeneral, setErrorGeneral] = useState('');
  const [archivos, setArchivos] = useState([]);
  const [errorArchivos, setErrorArchivos] = useState('');

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
    defaultValues: {
      tipoSolicitado: tiposDisponibles?.[0] ?? 'ESTUDIANTE',
      motivo: '',
      institucionNombre: '',
      institucionRuc: '',
      responsableNombre: '',
      responsableCargo: '',
      responsableEmail: '',
      responsableTelefono: '',
    },
  });

  const tipoSolicitado = watch('tipoSolicitado');
  const esInstitucion = tipoSolicitado === 'INSTITUCION_EDUCATIVA';

  useEffect(() => {
    if (!abierto) return;
    setErrorGeneral('');
    setErrorArchivos('');
    setArchivos([]);
    reset({
      tipoSolicitado: tiposDisponibles?.[0] ?? 'ESTUDIANTE',
      motivo: '',
      institucionNombre: '',
      institucionRuc: '',
      responsableNombre: '',
      responsableCargo: '',
      responsableEmail: '',
      responsableTelefono: '',
    });
  }, [abierto, reset, tiposDisponibles]);

  const agregarArchivos = (evento) => {
    const seleccionados = Array.from(evento.target.files ?? []);
    evento.target.value = '';
    setErrorArchivos('');

    const siguientes = [...archivos];
    for (const archivo of seleccionados) {
      if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
        setErrorArchivos('Solo se permiten documentos PDF, JPG o PNG.');
        continue;
      }
      if (archivo.size > MAX_TAMANO) {
        setErrorArchivos('Cada documento puede pesar como máximo 5 MB.');
        continue;
      }
      if (siguientes.length >= MAX_ARCHIVOS) {
        setErrorArchivos('Puedes adjuntar hasta 3 documentos.');
        break;
      }
      const repetido = siguientes.some(
        (item) => item.name === archivo.name && item.size === archivo.size,
      );
      if (!repetido) siguientes.push(archivo);
    }
    setArchivos(siguientes);
  };

  const quitarArchivo = (indice) => {
    setArchivos((actuales) => actuales.filter((_, posicion) => posicion !== indice));
    setErrorArchivos('');
  };

  const enviar = async (datos) => {
    setErrorGeneral('');
    if (archivos.length === 0) {
      setErrorArchivos('Adjunta al menos un documento de validación.');
      return;
    }

    const formulario = new FormData();
    for (const [clave, valor] of Object.entries(datos)) {
      if (valor !== undefined && valor !== null && String(valor).trim() !== '') {
        formulario.append(clave, valor);
      }
    }
    for (const archivo of archivos) {
      formulario.append('documentos', archivo);
    }

    try {
      const respuesta = await solicitudesTipoService.crear(formulario);
      onEnviada(respuesta);
      onCerrar();
    } catch (error) {
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  return (
    <FormDialog
      abierto={abierto}
      titulo="Solicitar cambio de tipo de cliente"
      descripcion="Adjunta los documentos de respaldo. El Bibliotecario los revisará antes de aprobar el cambio."
      onCerrar={onCerrar}
      onSubmit={handleSubmit(enviar)}
      cargando={isSubmitting}
      textoGuardar="Enviar solicitud"
      maxWidth="md"
    >
      {errorGeneral ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorGeneral}
        </Alert>
      ) : null}

      <Alert severity="info" sx={{ mb: 2 }}>
        El cambio no es automático. Mientras la solicitud esté pendiente conservarás
        tu tipo de cliente actual.
      </Alert>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Controller
          name="tipoSolicitado"
          control={control}
          render={({ field }) => (
            <FormSelect
              etiqueta="Tipo de cliente solicitado"
              requerido
              error={Boolean(errors.tipoSolicitado)}
              helperText={errors.tipoSolicitado?.message}
              opciones={(tiposDisponibles ?? []).map((tipo) => ({
                valor: tipo,
                etiqueta: ETIQUETAS_TIPO_CLIENTE[tipo] ?? tipo,
              }))}
              {...field}
            />
          )}
        />
        <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, mb: 0.5 }}
          >
            Documentos de validación *
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PDF, JPG o PNG · hasta 3 archivos de 5 MB cada uno.
          </Typography>

          <Box sx={{ mt: 1 }}>
            <Button
              component="label"
              variant="outlined"
              size="small"
              startIcon={<AttachFileOutlinedIcon />}
              disabled={archivos.length >= MAX_ARCHIVOS}
            >
              Adjuntar documentos
              <input
                hidden
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={agregarArchivos}
              />
            </Button>
          </Box>

          {errorArchivos ? (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              {errorArchivos}
            </Typography>
          ) : null}

          {archivos.length > 0 ? (
            <Stack spacing={0.75} sx={{ mt: 1.25 }}>
              {archivos.map((archivo, indice) => (
                <Stack
                  key={`${archivo.name}-${archivo.size}`}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                    px: 1.25,
                    py: 0.75,
                  }}
                >
                  <InsertDriveFileOutlinedIcon
                    fontSize="small"
                    sx={{ color: 'text.secondary' }}
                  />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {archivo.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatearTamano(archivo.size)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    aria-label={`Quitar ${archivo.name}`}
                    onClick={() => quitarArchivo(indice)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          ) : null}
        </Box>
        <FormTextField
          etiqueta="Motivo de la solicitud"
          error={Boolean(errors.motivo)}
          helperText={errors.motivo?.message ?? 'Opcional.'}
          slotProps={{ htmlInput: { maxLength: 255 } }}
          sx={{ gridColumn: { sm: '1 / -1' } }}
          {...register('motivo')}
        />

        {esInstitucion ? (
          <>
            <FormTextField
              etiqueta="Nombre de la institución"
              requerido
              error={Boolean(errors.institucionNombre)}
              helperText={errors.institucionNombre?.message}
              {...register('institucionNombre')}
            />
            <FormTextField
              etiqueta="RUC de la institución"
              error={Boolean(errors.institucionRuc)}
              helperText={errors.institucionRuc?.message ?? 'Opcional.'}
              {...register('institucionRuc')}
            />
            <FormTextField
              etiqueta="Nombre del responsable"
              requerido
              error={Boolean(errors.responsableNombre)}
              helperText={errors.responsableNombre?.message}
              {...register('responsableNombre')}
            />
            <FormTextField
              etiqueta="Cargo del responsable"
              error={Boolean(errors.responsableCargo)}
              helperText={errors.responsableCargo?.message ?? 'Opcional.'}
              {...register('responsableCargo')}
            />
            <FormTextField
              etiqueta="Correo del responsable"
              type="email"
              error={Boolean(errors.responsableEmail)}
              helperText={errors.responsableEmail?.message ?? 'Opcional.'}
              {...register('responsableEmail')}
            />
            <FormTextField
              etiqueta="Teléfono del responsable"
              type="tel"
              error={Boolean(errors.responsableTelefono)}
              helperText={errors.responsableTelefono?.message ?? 'Opcional.'}
              {...register('responsableTelefono')}
            />
          </>
        ) : null}
      </Box>
    </FormDialog>
  );
}
