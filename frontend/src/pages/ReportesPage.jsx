import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import TableCell from '@mui/material/TableCell';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';
import SummaryCard from '../components/common/SummaryCard.jsx';
import FormTextField from '../components/common/FormTextField.jsx';
import FormSelect from '../components/common/FormSelect.jsx';
import { ChipEstadoPrestamo } from '../components/common/StatusChip.jsx';
import { ErrorState } from '../components/common/LoadingState.jsx';
import { catalogosService } from '../services/catalogos.service.js';
import { reportesService } from '../services/reportes.service.js';
import {
  ETIQUETAS_ESTADO,
  formatearFecha,
  nombreCompleto,
} from '../utils/labels.js';

const ESTADOS = [
  'SOLICITADO',
  'APROBADO',
  'PRESTADO',
  'POR_VENCER',
  'RENOVADO',
  'VENCIDO',
  'DEVUELTO',
  'DEVUELTO_CON_RETRASO',
  'CANCELADO',
  'PERDIDO',
];

function ResumenLibros({ resumen }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, minmax(0, 1fr))' },
        gap: 1.5,
        mb: 2,
      }}
    >
      <SummaryCard
        titulo="Libros en catálogo"
        valor={resumen?.totalLibros ?? 0}
        icono={<MenuBookOutlinedIcon fontSize="small" />}
      />
      <SummaryCard
        titulo="Ejemplares registrados"
        valor={resumen?.totalEjemplares ?? 0}
        icono={<LibraryBooksOutlinedIcon fontSize="small" />}
      />
      <SummaryCard
        titulo="Ejemplares disponibles"
        valor={resumen?.ejemplaresDisponibles ?? 0}
        icono={<CheckCircleOutlineIcon fontSize="small" />}
      />
      <SummaryCard
        titulo="Libros con disponibilidad"
        valor={resumen?.librosConDisponibles ?? 0}
        icono={<Inventory2OutlinedIcon fontSize="small" />}
      />
    </Box>
  );
}

function ReporteLibrosTab({ soloDisponibles, categorias }) {
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(
    async (signal) => {
      setCargando(true);
      setError('');
      try {
        const servicio = soloDisponibles
          ? reportesService.disponibilidad
          : reportesService.libros;
        const respuesta = await servicio({ q: busqueda, categoriaId });
        setDatos(respuesta.data);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setError(err?.message ?? 'No se pudo generar el reporte.');
        }
      } finally {
        setCargando(false);
      }
    },
    [busqueda, categoriaId, soloDisponibles],
  );

  useEffect(() => {
    const controlador = new AbortController();
    cargar(controlador.signal);
    return () => controlador.abort();
  }, [cargar]);

  const buscar = (evento) => {
    evento.preventDefault();
    setBusqueda(texto.trim());
  };

  return (
    <Box>
      <Paper
        variant="outlined"
        className="no-print"
        sx={{ borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}
      >
        <Box
          component="form"
          onSubmit={buscar}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1.2fr auto' },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <FormTextField
            etiqueta="Buscar por título o autor"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
          <FormSelect
            etiqueta="Categoría"
            value={categoriaId}
            onChange={(evento) => setCategoriaId(evento.target.value)}
            opciones={[
              { valor: '', etiqueta: 'Todas las categorías' },
              ...categorias.map((categoria) => ({
                valor: categoria.id,
                etiqueta: categoria.nombre,
              })),
            ]}
          />
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" startIcon={<SearchOutlinedIcon />}>
              Generar
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={() => {
                setTexto('');
                setBusqueda('');
                setCategoriaId('');
              }}
            >
              Limpiar
            </Button>
          </Stack>
        </Box>
      </Paper>

      {error ? (
        <ErrorState mensaje={error} onReintentar={() => cargar()} />
      ) : (
        <>
          <ResumenLibros resumen={datos?.resumen} />
          <DataTable
            columnas={[
              { key: 'libro', label: 'Libro' },
              { key: 'categoria', label: 'Categoría' },
              { key: 'isbn', label: 'ISBN' },
              { key: 'ejemplares', label: 'Ejemplares', align: 'right' },
              { key: 'disponibles', label: 'Disponibles', align: 'right' },
            ]}
            filas={datos?.libros ?? []}
            cargando={cargando}
            vacioTitulo="Sin resultados"
            vacioDescripcion="No hay libros que coincidan con los filtros aplicados."
            renderFila={(libro) => [
              <TableCell key="libro">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {libro.titulo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {libro.autor} · {libro.editorial} · {libro.anioPublicacion}
                </Typography>
              </TableCell>,
              <TableCell key="categoria">{libro.categoriaNombre}</TableCell>,
              <TableCell key="isbn">{libro.isbn}</TableCell>,
              <TableCell key="ejemplares" align="right">
                {libro.totalEjemplares}
              </TableCell>,
              <TableCell key="disponibles" align="right">
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: libro.disponibles > 0 ? 'success.dark' : 'error.dark' }}
                >
                  {libro.disponibles}
                </Typography>
              </TableCell>,
            ]}
          />
        </>
      )}
    </Box>
  );
}

function ReportePrestamosTab() {
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(
    async (signal) => {
      setCargando(true);
      setError('');
      try {
        const respuesta = await reportesService.prestamos({
          q: busqueda,
          estado,
          desde,
          hasta,
        });
        setDatos(respuesta.data);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setError(err?.message ?? 'No se pudo generar el reporte de préstamos.');
        }
      } finally {
        setCargando(false);
      }
    },
    [busqueda, estado, desde, hasta],
  );

  useEffect(() => {
    const controlador = new AbortController();
    cargar(controlador.signal);
    return () => controlador.abort();
  }, [cargar]);

  const buscar = (evento) => {
    evento.preventDefault();
    setBusqueda(texto.trim());
  };

  const porEstado = datos?.resumen?.porEstado ?? {};

  return (
    <Box>
      <Paper
        variant="outlined"
        className="no-print"
        sx={{ borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}
      >
        <Box
          component="form"
          onSubmit={buscar}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1.2fr 1fr 1fr auto' },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <FormTextField
            etiqueta="Buscar por cliente, libro o ISBN"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
          <FormSelect
            etiqueta="Estado"
            value={estado}
            onChange={(evento) => setEstado(evento.target.value)}
            opciones={[
              { valor: '', etiqueta: 'Todos los estados' },
              ...ESTADOS.map((valor) => ({
                valor,
                etiqueta: ETIQUETAS_ESTADO[valor],
              })),
            ]}
          />
          <FormTextField
            etiqueta="Desde"
            type="date"
            value={desde}
            onChange={(evento) => setDesde(evento.target.value)}
          />
          <FormTextField
            etiqueta="Hasta"
            type="date"
            value={hasta}
            onChange={(evento) => setHasta(evento.target.value)}
          />
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" startIcon={<SearchOutlinedIcon />}>
              Generar
            </Button>
            <Button
              variant="text"
              color="inherit"
              onClick={() => {
                setTexto('');
                setBusqueda('');
                setEstado('');
                setDesde('');
                setHasta('');
              }}
            >
              Limpiar
            </Button>
          </Stack>
        </Box>
      </Paper>

      {error ? (
        <ErrorState mensaje={error} onReintentar={() => cargar()} />
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
              gap: 1.5,
              mb: 2,
            }}
          >
            <SummaryCard
              titulo="Préstamos en el reporte"
              valor={datos?.resumen?.totalPrestamos ?? 0}
              descripcion={`Límite de filas: ${datos?.resumen?.limiteFilas ?? 1000}`}
              icono={<LibraryBooksOutlinedIcon fontSize="small" />}
            />
            {Object.entries(porEstado)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(0, 5)
              .map(([clave, cantidad]) => (
                <SummaryCard
                  key={clave}
                  titulo={ETIQUETAS_ESTADO[clave] ?? clave}
                  valor={cantidad}
                />
              ))}
          </Box>

          <DataTable
            columnas={[
              { key: 'cliente', label: 'Cliente' },
              { key: 'libro', label: 'Libro' },
              { key: 'ejemplar', label: 'Ejemplar' },
              { key: 'estado', label: 'Estado' },
              { key: 'solicitud', label: 'Solicitud' },
              { key: 'limite', label: 'Fecha límite' },
              { key: 'devolucion', label: 'Devolución' },
            ]}
            filas={datos?.prestamos ?? []}
            cargando={cargando}
            vacioTitulo="Sin resultados"
            vacioDescripcion="No hay préstamos que coincidan con los filtros aplicados."
            renderFila={(prestamo) => [
              <TableCell key="cliente">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {nombreCompleto(prestamo.cliente)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {prestamo.cliente?.identificacion}
                </Typography>
              </TableCell>,
              <TableCell key="libro">
                <Typography variant="body2">{prestamo.libro?.titulo}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {prestamo.libro?.isbn}
                </Typography>
              </TableCell>,
              <TableCell key="ejemplar">{prestamo.ejemplar?.codigo ?? '—'}</TableCell>,
              <TableCell key="estado">
                <ChipEstadoPrestamo estado={prestamo.estadoEfectivo} />
              </TableCell>,
              <TableCell key="solicitud">
                {formatearFecha(prestamo.fechaSolicitud)}
              </TableCell>,
              <TableCell key="limite">{formatearFecha(prestamo.fechaLimite)}</TableCell>,
              <TableCell key="devolucion">
                {formatearFecha(prestamo.fechaDevolucion)}
              </TableCell>,
            ]}
          />
        </>
      )}
    </Box>
  );
}

export default function ReportesPage() {
  const [tab, setTab] = useState('libros');
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    catalogosService
      .categorias()
      .then((respuesta) => setCategorias(respuesta.data))
      .catch(() => setCategorias([]));
  }, []);

  return (
    <Box>
      <PageHeader
        titulo="Reportes"
        descripcion="Consulta los reportes operativos de libros, disponibilidad y préstamos."
        accion={
          <Tooltip title="Imprimir o guardar como PDF el reporte visible">
            <Button
              className="no-print"
              variant="outlined"
              startIcon={<PrintOutlinedIcon />}
              onClick={() => window.print()}
            >
              Imprimir
            </Button>
          </Tooltip>
        }
      />

      <Alert severity="info" className="no-print" sx={{ mb: 2 }}>
        Los reportes muestran hasta 1000 filas y usan fechas de Ecuador (UTC-5). La
        impresión incluye únicamente el contenido del reporte activo.
      </Alert>

      <Paper variant="outlined" className="no-print" sx={{ borderColor: 'divider', borderRadius: 2, mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(evento, valor) => setTab(valor)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1 }}
        >
          <Tab value="libros" label="Catálogo de libros" />
          <Tab value="disponibilidad" label="Disponibilidad" />
          <Tab value="prestamos" label="Préstamos" />
        </Tabs>
      </Paper>

      {tab === 'libros' ? (
        <ReporteLibrosTab soloDisponibles={false} categorias={categorias} />
      ) : null}
      {tab === 'disponibilidad' ? (
        <ReporteLibrosTab soloDisponibles categorias={categorias} />
      ) : null}
      {tab === 'prestamos' ? <ReportePrestamosTab /> : null}
    </Box>
  );
}
