import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';
import TablePaginationBar from '../components/common/TablePaginationBar.jsx';
import FormTextField from '../components/common/FormTextField.jsx';
import FormSelect from '../components/common/FormSelect.jsx';
import { ChipEstadoPrestamo } from '../components/common/StatusChip.jsx';
import { ErrorState } from '../components/common/LoadingState.jsx';
import PrestamoDetalleDrawer from '../components/prestamos/PrestamoDetalleDrawer.jsx';
import { prestamosService } from '../services/prestamos.service.js';
import { formatearFecha, nombreCompleto } from '../utils/labels.js';

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

const ETIQUETAS_FILTRO = {
  SOLICITADO: 'Solicitado',
  APROBADO: 'Aprobado',
  PRESTADO: 'Prestado',
  POR_VENCER: 'Por vencer',
  RENOVADO: 'Renovado',
  VENCIDO: 'Vencido',
  DEVUELTO: 'Devuelto',
  DEVUELTO_CON_RETRASO: 'Devuelto con retraso',
  CANCELADO: 'Cancelado',
  PERDIDO: 'Perdido',
};

export default function PrestamosPage() {
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [prestamos, setPrestamos] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);

  const cargar = useCallback(
    async (signal) => {
      setCargando(true);
      setError('');
      try {
        const respuesta = await prestamosService.listar({
          q: busqueda,
          estado,
          desde,
          hasta,
          page: pagina,
          pageSize: filasPorPagina,
        });
        setPrestamos(respuesta.data);
        setTotal(respuesta.meta.total);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setError(err?.message ?? 'No se pudo cargar el listado de préstamos.');
        }
      } finally {
        setCargando(false);
      }
    },
    [busqueda, estado, desde, hasta, pagina, filasPorPagina],
  );

  useEffect(() => {
    const controlador = new AbortController();
    cargar(controlador.signal);
    return () => controlador.abort();
  }, [cargar]);

  const buscar = (evento) => {
    evento.preventDefault();
    setPagina(1);
    setBusqueda(texto.trim());
  };

  const limpiar = () => {
    setTexto('');
    setBusqueda('');
    setEstado('');
    setDesde('');
    setHasta('');
    setPagina(1);
  };

  const columnas = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'libro', label: 'Libro' },
    { key: 'ejemplar', label: 'Ejemplar' },
    { key: 'estado', label: 'Estado' },
    { key: 'solicitud', label: 'Solicitud' },
    { key: 'limite', label: 'Fecha límite' },
    { key: 'acciones', label: 'Acciones', align: 'right' },
  ];

  return (
    <Box>
      <PageHeader
        titulo="Préstamos"
        descripcion="Aprueba solicitudes y registra entregas, renovaciones y devoluciones."
      />

      <Paper
        variant="outlined"
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
            onChange={(evento) => {
              setEstado(evento.target.value);
              setPagina(1);
            }}
            opciones={[
              { valor: '', etiqueta: 'Todos los estados' },
              ...ESTADOS.map((valor) => ({
                valor,
                etiqueta: ETIQUETAS_FILTRO[valor],
              })),
            ]}
          />
          <FormTextField
            etiqueta="Desde"
            type="date"
            value={desde}
            onChange={(evento) => {
              setDesde(evento.target.value);
              setPagina(1);
            }}
          />
          <FormTextField
            etiqueta="Hasta"
            type="date"
            value={hasta}
            onChange={(evento) => {
              setHasta(evento.target.value);
              setPagina(1);
            }}
          />
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" startIcon={<SearchOutlinedIcon />}>
              Buscar
            </Button>
            <Button variant="text" color="inherit" onClick={limpiar}>
              Limpiar
            </Button>
          </Stack>
        </Box>
      </Paper>

      {error ? (
        <ErrorState mensaje={error} onReintentar={() => cargar()} />
      ) : (
        <>
          <DataTable
            columnas={columnas}
            filas={prestamos}
            cargando={cargando}
            vacioTitulo="No hay préstamos registrados"
            vacioDescripcion="Cuando los clientes registren solicitudes aparecerán en este listado."
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
              <TableCell key="ejemplar">
                {prestamo.ejemplar?.codigo ?? '—'}
              </TableCell>,
              <TableCell key="estado">
                <ChipEstadoPrestamo estado={prestamo.estadoEfectivo} />
              </TableCell>,
              <TableCell key="solicitud">
                {formatearFecha(prestamo.fechaSolicitud)}
              </TableCell>,
              <TableCell key="limite">
                {formatearFecha(prestamo.fechaLimite)}
              </TableCell>,
              <TableCell key="acciones" align="right">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSeleccionado(prestamo.id)}
                >
                  Gestionar
                </Button>
              </TableCell>,
            ]}
          />
          <TablePaginationBar
            total={total}
            pagina={pagina - 1}
            filasPorPagina={filasPorPagina}
            onCambiarPagina={(nueva) => setPagina(nueva)}
            onCambiarFilasPorPagina={setFilasPorPagina}
          />
        </>
      )}

      <PrestamoDetalleDrawer
        abierto={Boolean(seleccionado)}
        prestamoId={seleccionado}
        esStaff
        onCerrar={() => setSeleccionado(null)}
        onCambio={cargar}
      />
    </Box>
  );
}
