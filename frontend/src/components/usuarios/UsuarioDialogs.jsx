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

const esquemaCreacion = z
  .object({
    nombres: z.string().trim().min(2, 'Ingresa los nombres.'),
    apellidos: z.string().trim().min(2, 'Ingresa los apellidos.'),
    email: z.string().trim().email('Ingresa un correo válido.'),
    identificacion: z
      .string()
      .trim()
      .min(5, 'La identificación debe tener al menos 5 caracteres.')
      .regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones.'),
    telefono: z.string().trim().max(30).optional(),
    rol: z.enum(['ADMINISTRADOR', 'BIBLIOTECARIO']),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra.')
      .regex(/[0-9]/, 'La contraseña debe incluir al menos un número.'),
    confirmar: z.string().min(1, 'Confirma la contraseña.'),
  })
  .refine((datos) => datos.password === datos.confirmar, {
    path: ['confirmar'],
    message: 'Las contraseñas no coinciden.',
  });

const esquemaRol = z.object({
  rol: z.enum(['ADMINISTRADOR', 'BIBLIOTECARIO', 'CLIENTE']),
});

export function CrearUsuarioDialog({ abierto, onCerrar, onCreado }) {
  const [errorGeneral, setErrorGeneral] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaCreacion),
    defaultValues: {
      nombres: '',
      apellidos: '',
      email: '',
      identificacion: '',
      telefono: '',
      rol: 'BIBLIOTECARIO',
      password: '',
      confirmar: '',
    },
  });

  useEffect(() => {
    if (!abierto) return;
    setErrorGeneral('');
    reset({
      nombres: '',
      apellidos: '',
      email: '',
      identificacion: '',
      telefono: '',
      rol: 'BIBLIOTECARIO',
      password: '',
      confirmar: '',
    });
  }, [abierto, reset]);

  const guardar = async ({ confirmar, ...datos }) => {
    setErrorGeneral('');
    try {
      const respuesta = await usuariosService.crear(datos);
      onCreado(respuesta.mensaje);
      onCerrar();
    } catch (error) {
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  return (
    <FormDialog
      abierto={abierto}
      titulo="Crear cuenta de personal"
      descripcion="Solo se pueden crear cuentas de Administrador o Bibliotecario. Las cuentas de cliente se crean desde el registro público."
      onCerrar={onCerrar}
      onSubmit={handleSubmit(guardar)}
      cargando={isSubmitting}
      textoGuardar="Crear cuenta"
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
          requerido
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register('email')}
        />
        <FormTextField
          etiqueta="Identificación"
          requerido
          error={Boolean(errors.identificacion)}
          helperText={errors.identificacion?.message}
          {...register('identificacion')}
        />
        <FormTextField
          etiqueta="Teléfono"
          type="tel"
          error={Boolean(errors.telefono)}
          helperText={errors.telefono?.message ?? 'Opcional.'}
          {...register('telefono')}
        />
        <Controller
          name="rol"
          control={control}
          render={({ field }) => (
            <FormSelect
              etiqueta="Perfil de acceso"
              requerido
              error={Boolean(errors.rol)}
              helperText={errors.rol?.message}
              opciones={[
                { valor: 'BIBLIOTECARIO', etiqueta: 'Bibliotecario' },
                { valor: 'ADMINISTRADOR', etiqueta: 'Administrador' },
              ]}
              {...field}
            />
          )}
        />
        <FormTextField
          etiqueta="Contraseña"
          type="password"
          autoComplete="new-password"
          requerido
          error={Boolean(errors.password)}
          helperText={
            errors.password?.message ??
            'Mínimo 8 caracteres, con al menos una letra y un número.'
          }
          {...register('password')}
        />
        <FormTextField
          etiqueta="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          requerido
          error={Boolean(errors.confirmar)}
          helperText={errors.confirmar?.message}
          {...register('confirmar')}
        />
      </Box>
    </FormDialog>
  );
}

export function CambiarRolDialog({ abierto, usuario, onCerrar, onCambiado }) {
  const [errorGeneral, setErrorGeneral] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaRol),
    defaultValues: { rol: 'CLIENTE' },
  });

  useEffect(() => {
    if (!abierto) return;
    setErrorGeneral('');
    reset({ rol: usuario?.rol ?? 'CLIENTE' });
  }, [abierto, usuario, reset]);

  const guardar = async (datos) => {
    setErrorGeneral('');
    try {
      const respuesta = await usuariosService.cambiarRol(usuario.id, datos.rol);
      onCambiado(respuesta.mensaje);
      onCerrar();
    } catch (error) {
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  return (
    <FormDialog
      abierto={abierto}
      titulo="Cambiar perfil de acceso"
      descripcion={`${usuario?.nombres ?? ''} ${usuario?.apellidos ?? ''} · ${usuario?.email ?? ''}`}
      onCerrar={onCerrar}
      onSubmit={handleSubmit(guardar)}
      cargando={isSubmitting}
      textoGuardar="Guardar perfil"
      maxWidth="sm"
    >
      {errorGeneral ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorGeneral}
        </Alert>
      ) : null}
      <Alert severity="info" sx={{ mb: 2 }}>
        Si asignas el perfil Cliente, la cuenta quedará como Lector general y el
        Bibliotecario podrá actualizar su tipo de cliente. Si asignas un perfil de
        personal, se eliminarán los datos de cliente asociados.
      </Alert>
      <Controller
        name="rol"
        control={control}
        render={({ field }) => (
          <FormSelect
            etiqueta="Perfil de acceso"
            requerido
            error={Boolean(errors.rol)}
            helperText={errors.rol?.message}
            opciones={[
              { valor: 'ADMINISTRADOR', etiqueta: 'Administrador' },
              { valor: 'BIBLIOTECARIO', etiqueta: 'Bibliotecario' },
              { valor: 'CLIENTE', etiqueta: 'Cliente' },
            ]}
            {...field}
          />
        )}
      />
    </FormDialog>
  );
}
