import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';
import TablePaginationBar from '../components/common/TablePaginationBar.jsx';
import FormSelect from '../components/common/FormSelect.jsx';
import { ChipEstadoPrestamo } from '../components/common/StatusChip.jsx';
import { ErrorState } from '../components/common/LoadingState.jsx';
import PrestamoDetalleDrawer from '../components/prestamos/PrestamoDetalleDrawer.jsx';
import { prestamosService } from '../services/prestamos.service.js';
import { formatearFecha } from '../utils/labels.js';

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

export default function MisPrestamosPage() {
  const [estado, setEstado] = useState('');
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
          estado,
          page: pagina,
          pageSize: filasPorPagina,
        });
        setPrestamos(respuesta.data);
        setTotal(respuesta.meta.total);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setError(err?.message ?? 'No se pudo cargar tus préstamos.');
        }
      } finally {
        setCargando(false);
      }
    },
    [estado, pagina, filasPorPagina],
  );

  useEffect(() => {
    const controlador = new AbortController();
    cargar(controlador.signal);
    return () => controlador.abort();
  }, [cargar]);

  const columnas = [
    { key: 'libro', label: 'Libro' },
    { key: 'ejemplar', label: 'Ejemplar' },
    { key: 'estado', label: 'Estado' },
    { key: 'solicitud', label: 'Solicitud' },
    { key: 'entrega', label: 'Entrega' },
    { key: 'limite', label: 'Fecha límite' },
    { key: 'acciones', label: 'Acciones', align: 'right' },
  ];

  return (
    <Box>
      <PageHeader
        titulo="Mis préstamos"
        descripcion="Consulta el estado de tus solicitudes y préstamos registrados."
      />

      <Paper
        variant="outlined"
        sx={{ borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Box sx={{ minWidth: { sm: 260 } }}>
            <FormSelect
              etiqueta="Filtrar por estado"
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
          </Box>
          {estado ? (
            <Button variant="text" color="inherit" onClick={() => setEstado('')}>
              Limpiar filtro
            </Button>
          ) : null}
        </Stack>
      </Paper>

      {error ? (
        <ErrorState mensaje={error} onReintentar={() => cargar()} />
      ) : (
        <>
          <DataTable
            columnas={columnas}
            filas={prestamos}
            cargando={cargando}
            vacioTitulo="Todavía no tienes préstamos"
            vacioDescripcion="Solicita un libro desde el catálogo para comenzar."
            renderFila={(prestamo) => [
              <TableCell key="libro">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {prestamo.libro?.titulo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {prestamo.libro?.isbn}
                </Typography>
              </TableCell>,
              <TableCell key="ejemplar">
                {prestamo.ejemplar?.codigo ?? 'Pendiente de asignación'}
              </TableCell>,
              <TableCell key="estado">
                <ChipEstadoPrestamo estado={prestamo.estadoEfectivo} />
              </TableCell>,
              <TableCell key="solicitud">
                {formatearFecha(prestamo.fechaSolicitud)}
              </TableCell>,
              <TableCell key="entrega">
                {formatearFecha(prestamo.fechaEntrega)}
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
                  Ver detalle
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
        onCerrar={() => setSeleccionado(null)}
        onCambio={cargar}
      />
    </Box>
  );
}
