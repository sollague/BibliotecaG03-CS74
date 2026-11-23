import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import { ChipDisponibilidad } from '../components/common/StatusChip.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { catalogosService } from '../services/catalogos.service.js';
import { librosService } from '../services/libros.service.js';
import { prestamosService } from '../services/prestamos.service.js';
import {
  ETIQUETAS_ROL,
  ETIQUETAS_TIPO_CLIENTE,
} from '../utils/labels.js';

const ACCESOS = {
  ADMINISTRADOR: [
    {
      titulo: 'Usuarios y perfiles',
      descripcion: 'Crea cuentas del personal, cambia perfiles de acceso y activa o desactiva cuentas.',
      ruta: '/usuarios',
      icono: ManageAccountsOutlinedIcon,
    },
    {
      titulo: 'Políticas de préstamo',
      descripcion: 'Revisa y actualiza los límites y plazos de cada tipo de cliente.',
      ruta: '/politicas',
      icono: PolicyOutlinedIcon,
    },
    {
      titulo: 'Reportes',
      descripcion: 'Consulta la información consolidada de libros y préstamos.',
      ruta: '/reportes',
      icono: BarChartOutlinedIcon,
    },
  ],
  BIBLIOTECARIO: [
    {
      titulo: 'Libros y ejemplares',
      descripcion: 'Registra, edita y elimina libros; administra los ejemplares del catálogo.',
      ruta: '/libros',
      icono: LibraryBooksOutlinedIcon,
    },
    {
      titulo: 'Préstamos',
      descripcion: 'Aprueba solicitudes y registra entregas, renovaciones y devoluciones.',
      ruta: '/prestamos',
      icono: SwapHorizOutlinedIcon,
    },
    {
      titulo: 'Solicitudes de tipo',
      descripcion: 'Revisa los cambios de tipo de cliente y valida los documentos presentados.',
      ruta: '/solicitudes-tipo',
      icono: HowToRegOutlinedIcon,
    },
    {
      titulo: 'Clientes',
      descripcion: 'Asigna el tipo de cliente y registra el documento de validación.',
      ruta: '/clientes',
      icono: PeopleAltOutlinedIcon,
    },
    {
      titulo: 'Reportes',
      descripcion: 'Revisa los reportes operativos de libros y préstamos.',
      ruta: '/reportes',
      icono: BarChartOutlinedIcon,
    },
  ],
  CLIENTE: [
    {
      titulo: 'Mis préstamos',
      descripcion: 'Consulta el estado de tus solicitudes y préstamos registrados.',
      ruta: '/mis-prestamos',
      icono: AssignmentOutlinedIcon,
    },
    {
      titulo: 'Mi perfil',
      descripcion: 'Actualiza tus datos y solicita un cambio de tipo de cliente.',
      ruta: '/perfil',
      icono: PersonOutlineOutlinedIcon,
    },
  ],
};

const LIMITE_LIBROS = 6;

function TarjetaLibro({ libro, puedeSolicitar, onSolicitar }) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 2,
        },
      }}
    >
      <Box
        sx={{
          height: 92,
          background:
            'linear-gradient(135deg, rgba(232,117,36,0.16) 0%, rgba(232,117,36,0.04) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
        }}
      >
        <AutoStoriesOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Chip
          size="small"
          label={libro.categoriaNombre}
          sx={{
            backgroundColor: 'background.paper',
            color: 'text.secondary',
            fontWeight: 600,
          }}
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="body1"
          sx={{ fontWeight: 700, lineHeight: 1.35 }}
          noWrap
          title={libro.titulo}
        >
          {libro.titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
          {libro.autor} · {libro.anioPublicacion}
        </Typography>
        <Box sx={{ mt: 1.5 }}>
          <ChipDisponibilidad disponibles={libro.disponibles} />
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        {puedeSolicitar ? (
          <Button
            size="small"
            variant="contained"
            fullWidth
            disabled={libro.disponibles === 0}
            onClick={() => onSolicitar(libro)}
          >
            {libro.disponibles === 0 ? 'Sin ejemplares' : 'Solicitar'}
          </Button>
        ) : (
          <Button
            size="small"
            variant="outlined"
            fullWidth
            component={RouterLink}
            to="/catalogo"
          >
            Ver en catálogo
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

export default function InicioPage() {
  const { usuario } = useAuth();
  const { mostrarExito, mostrarError } = useFeedback();
  const [categorias, setCategorias] = useState([]);
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [libros, setLibros] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [solicitud, setSolicitud] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const esCliente = usuario?.rol === 'CLIENTE';
  const accesos = ACCESOS[usuario?.rol] ?? [];

  useEffect(() => {
    catalogosService
      .categorias()
      .then((respuesta) => setCategorias(respuesta.data))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    const temporizador = setTimeout(() => setBusqueda(texto.trim()), 350);
    return () => clearTimeout(temporizador);
  }, [texto]);

  const cargar = useCallback(
    async (signal) => {
      setCargando(true);
      setError('');
      try {
        const respuesta = await librosService.listar({
          q: busqueda,
          categoriaId,
          page: 1,
          pageSize: LIMITE_LIBROS,
        });
        setLibros(respuesta.data);
        setTotal(respuesta.meta.total);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setError(err?.message ?? 'No se pudo cargar el catálogo.');
        }
      } finally {
        setCargando(false);
      }
    },
    [busqueda, categoriaId],
  );

  useEffect(() => {
    const controlador = new AbortController();
    cargar(controlador.signal);
    return () => controlador.abort();
  }, [cargar]);

  const confirmarSolicitud = async () => {
    if (!solicitud) return;
    setEnviando(true);
    try {
      const respuesta = await prestamosService.solicitar({
        libroIds: [solicitud.id],
      });
      mostrarExito(respuesta.mensaje);
      setSolicitud(null);
      cargar();
    } catch (err) {
      mostrarError(err?.message ?? 'No se pudo registrar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  const limpiarFiltros = () => {
    setTexto('');
    setBusqueda('');
    setCategoriaId('');
  };

  const hayFiltros = Boolean(busqueda || categoriaId);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Hola, {usuario?.nombres}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Has iniciado sesión como {ETIQUETAS_ROL[usuario?.rol]?.toLowerCase()}
          {esCliente && usuario?.tipoCliente
            ? ` · ${ETIQUETAS_TIPO_CLIENTE[usuario.tipoCliente]}`
            : ''}
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          borderColor: 'divider',
          borderRadius: 3,
          p: { xs: 2.5, sm: 3 },
          mb: 3,
          background:
            'linear-gradient(120deg, rgba(232,117,36,0.12) 0%, rgba(255,255,255,0.9) 62%)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Box sx={{ maxWidth: 640 }}>
            <Typography variant="h5" component="h2" sx={{ color: 'primary.dark' }}>
              Explora el catálogo bibliográfico
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Busca por título o autor, filtra por categoría y revisa la disponibilidad
              antes de solicitar un libro.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/catalogo"
            variant="outlined"
            endIcon={<ArrowForwardOutlinedIcon />}
            sx={{ flexShrink: 0 }}
          >
            Ver catálogo completo
          </Button>
        </Stack>

        <Stack spacing={1.5} sx={{ mt: 2.5 }}>
          <TextField
            placeholder="Buscar por título o autor..."
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              label="Todas las categorías"
              clickable
              color={categoriaId === '' ? 'primary' : 'default'}
              variant={categoriaId === '' ? 'filled' : 'outlined'}
              onClick={() => setCategoriaId('')}
            />
            {categorias.map((categoria) => (
              <Chip
                key={categoria.id}
                label={categoria.nombre}
                clickable
                color={categoriaId === categoria.id ? 'primary' : 'default'}
                variant={categoriaId === categoria.id ? 'filled' : 'outlined'}
                onClick={() => setCategoriaId(categoria.id)}
              />
            ))}
            {hayFiltros ? (
              <Chip
                label="Limpiar filtros"
                clickable
                variant="outlined"
                onClick={limpiarFiltros}
                sx={{ borderStyle: 'dashed' }}
              />
            ) : null}
          </Box>
        </Stack>
      </Paper>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 1.5 }}
      >
        <Typography variant="h6">Libros destacados</Typography>
        <Typography variant="body2" color="text.secondary">
          {total > 0
            ? `Mostrando ${libros.length} de ${total} libros`
            : 'Sin resultados'}
        </Typography>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {cargando ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
            mb: 4,
          }}
        >
          {Array.from({ length: LIMITE_LIBROS }).map((_, indice) => (
            <Skeleton key={indice} variant="rounded" height={250} />
          ))}
        </Box>
      ) : libros.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ borderColor: 'divider', borderRadius: 2.5, p: 4, mb: 4 }}
        >
          <Stack alignItems="center" spacing={1} textAlign="center">
            <MenuBookOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography variant="h6">No encontramos libros con ese filtro</Typography>
            <Typography variant="body2" color="text.secondary">
              Prueba con otro título, autor o categoría.
            </Typography>
            {hayFiltros ? (
              <Button onClick={limpiarFiltros} sx={{ mt: 1 }}>
                Limpiar filtros
              </Button>
            ) : null}
          </Stack>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
            mb: 4,
          }}
        >
          {libros.map((libro) => (
            <TarjetaLibro
              key={libro.id}
              libro={libro}
              puedeSolicitar={esCliente}
              onSolicitar={setSolicitud}
            />
          ))}
        </Box>
      )}

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Accesos rápidos
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {accesos.map((acceso) => {
          const Icono = acceso.icono;
          return (
            <Paper
              key={acceso.ruta}
              variant="outlined"
              sx={{
                borderColor: 'divider',
                borderRadius: 2.5,
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                height: '100%',
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2,
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: 'primary.light',
                  color: 'primary.dark',
                }}
              >
                <Icono />
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{acceso.titulo}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {acceso.descripcion}
                </Typography>
              </Box>
              <Box>
                <Button component={RouterLink} to={acceso.ruta} variant="outlined" size="small">
                  Ingresar
                </Button>
              </Box>
            </Paper>
          );
        })}
      </Box>

      <ConfirmDialog
        abierto={Boolean(solicitud)}
        titulo="Registrar solicitud"
        mensaje={`Se registrará la solicitud del libro «${solicitud?.titulo ?? ''}». La aprobación queda a cargo del Bibliotecario.`}
        textoConfirmar="Registrar solicitud"
        onCerrar={() => setSolicitud(null)}
        onConfirmar={confirmarSolicitud}
        cargando={enviando}
      />
    </Box>
  );
}
