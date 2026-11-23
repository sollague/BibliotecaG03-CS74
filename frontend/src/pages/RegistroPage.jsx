import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import LinkMui from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LocalLibraryOutlinedIcon from '@mui/icons-material/LocalLibraryOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import FormTextField from '../components/common/FormTextField.jsx';
import { authService } from '../services/auth.service.js';
import { aplicarErroresApi } from '../utils/formErrors.js';

const PASOS = [
  {
    etiqueta: 'Cédula',
    titulo: 'Ingresa tu cédula',
    campos: ['identificacion'],
  },
  {
    etiqueta: 'Nombre',
    titulo: 'Tus nombres y apellidos',
    campos: ['nombres', 'apellidos'],
  },
  {
    etiqueta: 'Contacto',
    titulo: 'Correo y dirección',
    campos: ['email', 'direccion', 'telefono'],
  },
  {
    etiqueta: 'Clave',
    titulo: 'Crea tu contraseña',
    campos: ['password', 'confirmar'],
  },
];

const esquema = z
  .object({
    identificacion: z
      .string()
      .trim()
      .min(5, 'La identificación debe tener al menos 5 caracteres.')
      .max(30, 'La identificación no puede superar 30 caracteres.')
      .regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones.'),
    nombres: z
      .string()
      .trim()
      .min(2, 'Ingresa tus nombres.')
      .max(100, 'Los nombres no pueden superar 100 caracteres.'),
    apellidos: z
      .string()
      .trim()
      .min(2, 'Ingresa tus apellidos.')
      .max(100, 'Los apellidos no pueden superar 100 caracteres.'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Ingresa un correo válido.')
      .max(191, 'El correo no puede superar 191 caracteres.'),
    telefono: z
      .string()
      .trim()
      .max(30, 'El teléfono no puede superar 30 caracteres.')
      .optional(),
    direccion: z
      .string()
      .trim()
      .max(255, 'La dirección no puede superar 255 caracteres.')
      .optional(),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres.')
      .max(72, 'La contraseña no puede superar 72 caracteres.')
      .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra.')
      .regex(/[0-9]/, 'La contraseña debe incluir al menos un número.'),
    confirmar: z.string().min(1, 'Confirma tu contraseña.'),
  })
  .refine((datos) => datos.password === datos.confirmar, {
    path: ['confirmar'],
    message: 'Las contraseñas no coinciden.',
  });

function medirFuerza(password) {
  if (!password) return 0;
  let puntos = 0;
  if (password.length >= 8) puntos += 1;
  if (/[A-Za-z]/.test(password)) puntos += 1;
  if (/[0-9]/.test(password)) puntos += 1;
  if (/[^A-Za-z0-9]/.test(password)) puntos += 1;
  return puntos;
}

const FUERZA = [
  { etiqueta: 'Muy débil', color: 'error' },
  { etiqueta: 'Débil', color: 'error' },
  { etiqueta: 'Aceptable', color: 'warning' },
  { etiqueta: 'Buena', color: 'info' },
  { etiqueta: 'Fuerte', color: 'success' },
];

export default function RegistroPage() {
  const navigate = useNavigate();
  const [errorGeneral, setErrorGeneral] = useState('');
  const [errorPaso, setErrorPaso] = useState('');
  const [paso, setPaso] = useState(0);
  const [verPassword, setVerPassword] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(esquema), mode: 'onTouched' });

  const password = watch('password') ?? '';
  const pasoActual = PASOS[paso];
  const progreso = ((paso + 1) / PASOS.length) * 100;
  const nivelFuerza = FUERZA[medirFuerza(password)];
  const requisitos = useMemo(
    () => [
      { cumplido: password.length >= 8, texto: 'Al menos 8 caracteres' },
      { cumplido: /[A-Za-z]/.test(password), texto: 'Al menos una letra' },
      { cumplido: /[0-9]/.test(password), texto: 'Al menos un número' },
    ],
    [password],
  );

  const irAPaso = (indice) => {
    if (indice < 0 || indice >= paso) return;
    setErrorPaso('');
    setErrorGeneral('');
    setPaso(indice);
  };

  const avanzar = async () => {
    setErrorPaso('');
    setErrorGeneral('');
    const valido = await trigger(PASOS[paso].campos, { shouldFocus: true });
    if (!valido) {
      setErrorPaso('Revisa los campos marcados antes de continuar.');
      return;
    }
    setPaso((actual) => Math.min(actual + 1, PASOS.length - 1));
  };

  const enviar = async ({ confirmar, ...datos }) => {
    setErrorGeneral('');
    setErrorPaso('');
    try {
      const respuesta = await authService.registro(datos);
      navigate('/login', {
        replace: true,
        state: { mensaje: respuesta.mensaje },
      });
    } catch (error) {
      const campoConError = (error?.detalles ?? []).find(
        (detalle) => detalle.campo,
      );
      if (campoConError) {
        const indice = PASOS.findIndex((pasoActual) =>
          pasoActual.campos.includes(campoConError.campo),
        );
        if (indice >= 0 && indice !== paso) {
          setPaso(indice);
        }
      }
      aplicarErroresApi(error, setError, setErrorGeneral);
    }
  };

  const manejarInvalido = (errores) => {
    const primerCampo = Object.keys(errores).find((campo) =>
      PASOS.some((pasoActual) => pasoActual.campos.includes(campo)),
    );
    const indice = PASOS.findIndex((pasoActual) =>
      pasoActual.campos.includes(primerCampo),
    );
    if (indice >= 0 && indice !== paso) {
      setPaso(indice);
      setErrorPaso('Revisa el dato marcado y vuelve a intentarlo.');
      return;
    }
    setErrorPaso('Revisa los campos marcados antes de crear tu cuenta.');
  };

  const alEnviarFormulario = async (evento) => {
    evento.preventDefault();
    if (paso < PASOS.length - 1) {
      await avanzar();
      return;
    }
    await handleSubmit(enviar, manejarInvalido)();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'linear-gradient(135deg, #FFF7F0 0%, #F7F7F8 55%, #F0F2F5 100%)',
        p: { xs: 0, sm: 3 },
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 520,
          borderColor: 'divider',
          borderRadius: { xs: 0, sm: 4 },
          p: { xs: 3, sm: 4 },
          minHeight: { xs: '100vh', sm: 'auto' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.dark',
              flexShrink: 0,
            }}
          >
            <LocalLibraryOutlinedIcon />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h1" sx={{ lineHeight: 1.2 }}>
              Crear cuenta
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Biblioteca Virtual G03
            </Typography>
          </Box>
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`Paso ${paso + 1} de ${PASOS.length}`}
          />
        </Stack>

        <LinearProgress
          variant="determinate"
          value={progreso}
          sx={{ height: 6, borderRadius: 3, mb: 1 }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 3 }}
        >
          {pasoActual.etiqueta} · {Math.round(progreso)}%
        </Typography>

        {errorPaso ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {errorPaso}
          </Alert>
        ) : null}

        {errorGeneral ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGeneral}
          </Alert>
        ) : null}

        <Box component="form" onSubmit={alEnviarFormulario} noValidate>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            {pasoActual.titulo}
          </Typography>

          {paso === 0 ? (
            <FormTextField
              etiqueta="Cédula o pasaporte"
              autoFocus
              autoComplete="off"
              requerido
              error={Boolean(errors.identificacion)}
              helperText={
                errors.identificacion?.message ?? 'Sin puntos ni espacios.'
              }
              slotProps={{ htmlInput: { maxLength: 30 } }}
              {...register('identificacion')}
            />
          ) : null}

          {paso === 1 ? (
            <Stack spacing={2}>
              <FormTextField
                etiqueta="Nombres"
                autoFocus
                autoComplete="given-name"
                requerido
                error={Boolean(errors.nombres)}
                helperText={errors.nombres?.message}
                slotProps={{ htmlInput: { maxLength: 100 } }}
                {...register('nombres')}
              />
              <FormTextField
                etiqueta="Apellidos"
                autoComplete="family-name"
                requerido
                error={Boolean(errors.apellidos)}
                helperText={errors.apellidos?.message}
                slotProps={{ htmlInput: { maxLength: 100 } }}
                {...register('apellidos')}
              />
            </Stack>
          ) : null}

          {paso === 2 ? (
            <Stack spacing={2}>
              <FormTextField
                etiqueta="Correo electrónico"
                type="email"
                autoFocus
                autoComplete="email"
                requerido
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                slotProps={{ htmlInput: { maxLength: 191 } }}
                {...register('email')}
              />
              <FormTextField
                etiqueta="Dirección"
                autoComplete="street-address"
                error={Boolean(errors.direccion)}
                helperText={errors.direccion?.message ?? 'Opcional.'}
                slotProps={{ htmlInput: { maxLength: 255 } }}
                {...register('direccion')}
              />
              <FormTextField
                etiqueta="Teléfono"
                type="tel"
                autoComplete="tel"
                error={Boolean(errors.telefono)}
                helperText={errors.telefono?.message ?? 'Opcional.'}
                slotProps={{ htmlInput: { maxLength: 30 } }}
                {...register('telefono')}
              />
            </Stack>
          ) : null}

          {paso === 3 ? (
            <Stack spacing={2}>
              <FormTextField
                etiqueta="Contraseña"
                type={verPassword ? 'text' : 'password'}
                autoComplete="new-password"
                autoFocus
                requerido
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                slotProps={{
                  htmlInput: { maxLength: 72 },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          aria-label={
                            verPassword
                              ? 'Ocultar contraseña'
                              : 'Mostrar contraseña'
                          }
                          onClick={() => setVerPassword((valor) => !valor)}
                        >
                          {verPassword ? (
                            <VisibilityOffOutlinedIcon />
                          ) : (
                            <VisibilityOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                {...register('password')}
              />

              <Box>
                <LinearProgress
                  variant="determinate"
                  value={medirFuerza(password) * 25}
                  color={nivelFuerza.color}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  Seguridad: {nivelFuerza.etiqueta}
                </Typography>
              </Box>

              <Stack spacing={0.5}>
                {requisitos.map((requisito) => (
                  <Stack
                    key={requisito.texto}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    {requisito.cumplido ? (
                      <CheckCircleOutlineIcon color="success" fontSize="small" />
                    ) : (
                      <RadioButtonUncheckedIcon
                        color="disabled"
                        fontSize="small"
                      />
                    )}
                    <Typography
                      variant="body2"
                      color={
                        requisito.cumplido ? 'success.main' : 'text.secondary'
                      }
                    >
                      {requisito.texto}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <FormTextField
                etiqueta="Confirmar contraseña"
                type={verConfirmar ? 'text' : 'password'}
                autoComplete="new-password"
                requerido
                error={Boolean(errors.confirmar)}
                helperText={errors.confirmar?.message}
                slotProps={{
                  htmlInput: { maxLength: 72 },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          aria-label={
                            verConfirmar
                              ? 'Ocultar confirmación'
                              : 'Mostrar confirmación'
                          }
                          onClick={() => setVerConfirmar((valor) => !valor)}
                        >
                          {verConfirmar ? (
                            <VisibilityOffOutlinedIcon />
                          ) : (
                            <VisibilityOutlinedIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                {...register('confirmar')}
              />
            </Stack>
          ) : null}

          <Stack
            direction={{ xs: 'column-reverse', sm: 'row' }}
            spacing={1.5}
            sx={{ mt: 3 }}
          >
            {paso > 0 ? (
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                startIcon={<ArrowBackOutlinedIcon />}
                onClick={() => irAPaso(paso - 1)}
                disabled={isSubmitting}
                sx={{ flexShrink: 0 }}
              >
                Atrás
              </Button>
            ) : null}
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isSubmitting}
              endIcon={
                paso < PASOS.length - 1 ? (
                  <ArrowForwardOutlinedIcon />
                ) : undefined
              }
            >
              {paso < PASOS.length - 1
                ? 'Continuar'
                : isSubmitting
                  ? 'Creando cuenta...'
                  : 'Crear cuenta'}
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          ¿Ya tienes una cuenta?{' '}
          <LinkMui component={Link} to="/login" sx={{ fontWeight: 600 }}>
            Inicia sesión
          </LinkMui>
        </Typography>
      </Paper>
    </Box>
  );
}
