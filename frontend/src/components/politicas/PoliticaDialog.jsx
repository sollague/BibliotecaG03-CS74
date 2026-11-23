import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FormDialog from '../common/FormDialog.jsx';
import FormTextField from '../common/FormTextField.jsx';
import { catalogosService } from '../../services/catalogos.service.js';
import { aplicarErroresApi } from '../../utils/formErrors.js';

const esquema = z
  .object({
    maxLibrosSimultaneos: z.coerce
      .number()
      .int()
      .min(1, 'El máximo debe ser al menos 1.')
      .max(50, 'El máximo no puede superar 50.'),
    plazoDias: z.coerce
      .number()
      .int()
      .min(1, 'El plazo debe ser al menos 1 día.')
      .max(365, 'El plazo no puede superar 365 días.'),
    renovacionesPermitidas: z.coerce
      .number()
      .int()
      .min(0, 'Las renovaciones no pueden ser negativas.')
      .max(10, 'No se permiten más de 10 renovaciones.'),
    diasRenovacion: z.coerce
      .number()
      .int()
      .min(1, 'La renovación debe extender al menos 1 día.')
      .max(365, 'La renovación no puede superar 365 días.'),
    requiereDocumento: z.boolean(),
    documentoDescripcion: z
      .string()
      .trim()
      .min(3, 'Describe el documento de validación.')
      .max(255),
  })
  .refine(
    (datos) => datos.renovacionesPermitidas === 0 || datos.diasRenovacion > 0,
    {
      message: 'Si se permiten renovaciones, la extensión debe ser mayor que cero.',
      path: ['diasRenovacion'],
    },
  );

export default function PoliticaDialog({
  abierto,
  politica,
  etiquetaTipo,
  onCerrar,
  onGuardado,
}) {
  const [errorGeneral, setErrorGeneral] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      maxLibrosSimultaneos: 1,
      plazoDias: 1,
      renovacionesPermitidas: 0,
      diasRenovacion: 1,
      requiereDocumento: true,
      documentoDescripcion: '',
    },
  });

  useEffect(() => {
    if (!abierto || !politica) return;
    setErrorGeneral('');
    reset({
      maxLibrosSimultaneos: politica.maxLibrosSimultaneos,
      plazoDias: politica.plazoDias,
      renovacionesPermitidas: politica.renovacionesPermitidas,
      diasRenovacion: politica.diasRenovacion,
      requiereDocumento: politica.requiereDocumento,
      documentoDescripcion: politica.documentoDescripcion,
    });
  }, [abierto, politica, reset]);

  const guardar = async (datos) => {
    setErrorGeneral('');
    try {
      const respuesta = await catalogosService.actualizarPolitica(
        politica.tipoCliente,
        datos,
      );
      onGuardado(respuesta.mensaje);
      onCerrar();
    } catch (error) {
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  return (
    <FormDialog
      abierto={abierto}
      titulo="Editar política de préstamo"
      descripcion={etiquetaTipo}
      onCerrar={onCerrar}
      onSubmit={handleSubmit(guardar)}
      cargando={isSubmitting}
      textoGuardar="Guardar política"
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
        <FormTextField
          etiqueta="Máximo de préstamos simultáneos"
          type="number"
          requerido
          slotProps={{ htmlInput: { min: 1, max: 50 } }}
          error={Boolean(errors.maxLibrosSimultaneos)}
          helperText={errors.maxLibrosSimultaneos?.message}
          {...register('maxLibrosSimultaneos')}
        />
        <FormTextField
          etiqueta="Plazo de préstamo (días)"
          type="number"
          requerido
          slotProps={{ htmlInput: { min: 1, max: 365 } }}
          error={Boolean(errors.plazoDias)}
          helperText={errors.plazoDias?.message}
          {...register('plazoDias')}
        />
        <FormTextField
          etiqueta="Renovaciones permitidas"
          type="number"
          requerido
          slotProps={{ htmlInput: { min: 0, max: 10 } }}
          error={Boolean(errors.renovacionesPermitidas)}
          helperText={errors.renovacionesPermitidas?.message}
          {...register('renovacionesPermitidas')}
        />
        <FormTextField
          etiqueta="Días por renovación"
          type="number"
          requerido
          slotProps={{ htmlInput: { min: 1, max: 365 } }}
          error={Boolean(errors.diasRenovacion)}
          helperText={errors.diasRenovacion?.message}
          {...register('diasRenovacion')}
        />
        <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
          <FormTextField
            etiqueta="Documento de validación requerido"
            requerido
            error={Boolean(errors.documentoDescripcion)}
            helperText={errors.documentoDescripcion?.message}
            {...register('documentoDescripcion')}
          />
        </Box>
        <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
          <Controller
            name="requiereDocumento"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(evento) => field.onChange(evento.target.checked)}
                  />
                }
                label="Exigir documento de validación al asignar este tipo de cliente"
              />
            )}
          />
        </Box>
      </Box>
    </FormDialog>
  );
}
