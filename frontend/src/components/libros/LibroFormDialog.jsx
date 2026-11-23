import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import FormDialog from '../common/FormDialog.jsx';
import FormTextField from '../common/FormTextField.jsx';
import FormSelect from '../common/FormSelect.jsx';
import { librosService } from '../../services/libros.service.js';
import { aplicarErroresApi } from '../../utils/formErrors.js';

const anioActual = new Date().getFullYear();

const base = {
  titulo: z.string().trim().min(1, 'Ingresa el título.'),
  autor: z.string().trim().min(1, 'Ingresa el autor.'),
  editorial: z.string().trim().min(1, 'Ingresa la editorial.'),
  categoriaId: z.coerce.number().int().positive('Selecciona una categoría.'),
  anioPublicacion: z.coerce
    .number()
    .int()
    .min(1400, 'El año no es válido.')
    .max(anioActual + 1, 'El año no puede ser futuro.'),
  isbn: z
    .string()
    .trim()
    .min(10, 'Ingresa un ISBN válido.')
    .refine(
      (valor) => /^(?:\d{9}[\dXx]|\d{13})$/.test(valor.replace(/[\s-]/g, '')),
      'El ISBN debe tener 10 o 13 caracteres válidos.',
    ),
  cantidadEjemplares: z.coerce
    .number()
    .int()
    .min(1, 'Registra al menos un ejemplar.')
    .max(100, 'Máximo 100 ejemplares a la vez.'),
};

export default function LibroFormDialog({ abierto, libro, categorias, onCerrar, onGuardado }) {
  const esEdicion = Boolean(libro);
  const [errorGeneral, setErrorGeneral] = useState('');

  const esquema = useMemo(
    () => z.object(esEdicion ? base : { ...base }),
    [esEdicion],
  );

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
      titulo: '',
      autor: '',
      editorial: '',
      categoriaId: '',
      anioPublicacion: anioActual,
      isbn: '',
      cantidadEjemplares: 1,
    },
  });

  useEffect(() => {
    if (!abierto) return;
    setErrorGeneral('');
    reset({
      titulo: libro?.titulo ?? '',
      autor: libro?.autor ?? '',
      editorial: libro?.editorial ?? '',
      categoriaId: libro?.categoriaId ?? '',
      anioPublicacion: libro?.anioPublicacion ?? anioActual,
      isbn: libro?.isbn ?? '',
      cantidadEjemplares: 1,
    });
  }, [abierto, libro, reset]);

  const guardar = async (valores) => {
    setErrorGeneral('');
    const { cantidadEjemplares, ...datos } = valores;
    try {
      const respuesta = esEdicion
        ? await librosService.actualizar(libro.id, datos)
        : await librosService.crear({ ...datos, cantidadEjemplares });
      onGuardado(respuesta.mensaje);
      onCerrar();
    } catch (error) {
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  return (
    <FormDialog
      abierto={abierto}
      titulo={esEdicion ? 'Editar libro' : 'Registrar libro'}
      descripcion={
        esEdicion
          ? 'Actualiza los datos bibliográficos. La cantidad de ejemplares se gestiona por separado.'
          : 'Completa los datos bibliográficos y la cantidad inicial de ejemplares.'
      }
      onCerrar={onCerrar}
      onSubmit={handleSubmit(guardar)}
      cargando={isSubmitting}
      textoGuardar={esEdicion ? 'Guardar cambios' : 'Registrar libro'}
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
        <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
          <FormTextField
            etiqueta="Título"
            requerido
            error={Boolean(errors.titulo)}
            helperText={errors.titulo?.message}
            {...register('titulo')}
          />
        </Box>
        <FormTextField
          etiqueta="Autor"
          requerido
          error={Boolean(errors.autor)}
          helperText={errors.autor?.message}
          {...register('autor')}
        />
        <FormTextField
          etiqueta="Editorial"
          requerido
          error={Boolean(errors.editorial)}
          helperText={errors.editorial?.message}
          {...register('editorial')}
        />
        <Controller
          name="categoriaId"
          control={control}
          render={({ field }) => (
            <FormSelect
              etiqueta="Categoría"
              requerido
              placeholder="Selecciona una categoría"
              error={Boolean(errors.categoriaId)}
              helperText={errors.categoriaId?.message}
              opciones={categorias.map((categoria) => ({
                valor: categoria.id,
                etiqueta: categoria.nombre,
              }))}
              {...field}
            />
          )}
        />
        <FormTextField
          etiqueta="Año de publicación"
          type="number"
          requerido
          slotProps={{ htmlInput: { min: 1400, max: anioActual + 1 } }}
          error={Boolean(errors.anioPublicacion)}
          helperText={errors.anioPublicacion?.message}
          {...register('anioPublicacion')}
        />
        <FormTextField
          etiqueta="ISBN"
          requerido
          error={Boolean(errors.isbn)}
          helperText={errors.isbn?.message ?? 'ISBN de 10 o 13 dígitos.'}
          {...register('isbn')}
        />
        {!esEdicion ? (
          <FormTextField
            etiqueta="Cantidad de ejemplares"
            type="number"
            requerido
            slotProps={{ htmlInput: { min: 1, max: 100 } }}
            error={Boolean(errors.cantidadEjemplares)}
            helperText={
              errors.cantidadEjemplares?.message ??
              'Se generará un código único para cada ejemplar.'
            }
            {...register('cantidadEjemplares')}
          />
        ) : null}
      </Box>
    </FormDialog>
  );
}
