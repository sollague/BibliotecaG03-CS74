import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import FormDialog from '../common/FormDialog.jsx';
import FormTextField from '../common/FormTextField.jsx';
import FormSelect from '../common/FormSelect.jsx';
import { usuariosService } from '../../services/usuarios.service.js';
import { aplicarErroresApi } from '../../utils/formErrors.js';

const esquema = z
  .object({
    tipoCliente: z.enum([
      'LECTOR_GENERAL',
      'ESTUDIANTE',
      'BECARIO',
      'INSTITUCION_EDUCATIVA',
    ]),
    documentoValidacion: z.string().max(255).optional(),
    institucionNombre: z.string().max(191).optional(),
    institucionRuc: z.string().max(20).optional(),
    responsableNombre: z.string().max(191).optional(),
    responsableCargo: z.string().max(100).optional(),
    responsableEmail: z.string().max(191).optional(),
    responsableTelefono: z.string().max(30).optional(),
  })
  .superRefine((datos, ctx) => {
    if (datos.tipoCliente === 'LECTOR_GENERAL') return;

    if (!datos.documentoValidacion?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['documentoValidacion'],
        message: 'El documento de validación es obligatorio para este tipo de cliente.',
      });
    }

    if (datos.tipoCliente === 'INSTITUCION_EDUCATIVA') {
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
    }
  });

export default function ClienteDialog({ abierto, cliente, onCerrar, onGuardado }) {
  const [errorGeneral, setErrorGeneral] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      tipoCliente: 'LECTOR_GENERAL',
      documentoValidacion: '',
      institucionNombre: '',
      institucionRuc: '',
      responsableNombre: '',
      responsableCargo: '',
      responsableEmail: '',
      responsableTelefono: '',
    },
  });

  const tipoCliente = watch('tipoCliente');

  useEffect(() => {
    if (!abierto) return;
    setErrorGeneral('');
    reset({
      tipoCliente: cliente?.tipoCliente ?? 'LECTOR_GENERAL',
      documentoValidacion: cliente?.documentoValidacion ?? '',
      institucionNombre: cliente?.institucionNombre ?? '',
      institucionRuc: cliente?.institucionRuc ?? '',
      responsableNombre: cliente?.responsableNombre ?? '',
      responsableCargo: cliente?.responsableCargo ?? '',
      responsableEmail: cliente?.responsableEmail ?? '',
      responsableTelefono: cliente?.responsableTelefono ?? '',
    });
  }, [abierto, cliente, reset]);

  const guardar = async (datos) => {
    setErrorGeneral('');
    try {
      const respuesta = await usuariosService.actualizarCliente(cliente.id, datos);
      onGuardado(respuesta.mensaje);
      onCerrar();
    } catch (error) {
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  const esInstitucion = tipoCliente === 'INSTITUCION_EDUCATIVA';
  const requiereDocumento = tipoCliente !== 'LECTOR_GENERAL';

  return (
    <FormDialog
      abierto={abierto}
      titulo="Datos del cliente"
      descripcion={`${cliente?.nombres ?? ''} ${cliente?.apellidos ?? ''} · ${cliente?.identificacion ?? ''}`}
      onCerrar={onCerrar}
      onSubmit={handleSubmit(guardar)}
      cargando={isSubmitting}
      textoGuardar="Guardar cambios"
      maxWidth="md"
    >
      {errorGeneral ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorGeneral}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Controller
          name="tipoCliente"
          control={control}
          render={({ field }) => (
            <FormSelect
              etiqueta="Tipo de cliente"
              requerido
              error={Boolean(errors.tipoCliente)}
              helperText={errors.tipoCliente?.message}
              opciones={[
                { valor: 'LECTOR_GENERAL', etiqueta: 'Lector general' },
                { valor: 'ESTUDIANTE', etiqueta: 'Estudiante' },
                { valor: 'BECARIO', etiqueta: 'Becario' },
                { valor: 'INSTITUCION_EDUCATIVA', etiqueta: 'Institución educativa' },
              ]}
              {...field}
            />
          )}
        />
        <FormTextField
          etiqueta="Documento de validación"
          requerido={requiereDocumento}
          error={Boolean(errors.documentoValidacion)}
          helperText={
            errors.documentoValidacion?.message ??
            (requiereDocumento
              ? 'Registra la referencia del documento presentado.'
              : 'Opcional para lector general.')
          }
          {...register('documentoValidacion')}
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
