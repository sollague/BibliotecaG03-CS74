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
import {
  ChipEstadoSolicitudTipo,
  ChipTipoCliente,
} from '../components/common/StatusChip.jsx';
import { ErrorState } from '../components/common/LoadingState.jsx';
import SolicitudRevisionDialog from '../components/clientes/SolicitudRevisionDialog.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { solicitudesTipoService } from '../services/solicitudesTipo.service.js';
import { formatearFechaHora, nombreCompleto } from '../utils/labels.js';

export default function SolicitudesTipoPage() {
  const { mostrarExito } = useFeedback();

  const [estado, setEstado] = useState('PENDIENTE');
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [solicitudes, setSolicitudes] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [revisando, setRevisando] = useState(null);

  const cargar = useCallback(
    async (signal) => {
      setCargando(true);
      setError('');
      try {
        const respuesta = await solicitudesTipoService.listar({
          estado,
          page: pagina,
          pageSize: filasPorPagina,
        });
        setSolicitudes(respuesta.data);
        setTotal(respuesta.meta.total);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setError(err?.message ?? 'No se pudieron cargar las solicitudes.');
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
    { key: 'cliente', label: 'Cliente' },
    { key: 'tipos', label: 'Tipo actual / solicitado' },
    { key: 'documento', label: 'Documento de validación' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'estado', label: 'Estado' },
    { key: 'acciones', label: 'Acciones', align: 'right' },
  ];

  return (
    <Box>
      <PageHeader
        titulo="Solicitudes de tipo de cliente"
        descripcion="Revisa las solicitudes enviadas por los clientes y actualiza su clasificación con el documento de validación."
      />

      <Paper
        variant="outlined"
        sx={{ borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '260px' },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <FormSelect
            etiqueta="Estado de la solicitud"
            value={estado}
            onChange={(evento) => {
              setEstado(evento.target.value);
              setPagina(1);
            }}
            opciones={[
              { valor: 'PENDIENTE', etiqueta: 'Pendientes' },
              { valor: 'APROBADA', etiqueta: 'Aprobadas' },
              { valor: 'RECHAZADA', etiqueta: 'Rechazadas' },
              { valor: 'CANCELADA', etiqueta: 'Canceladas' },
              { valor: '', etiqueta: 'Todas' },
            ]}
          />
        </Box>
      </Paper>

      {error ? (
        <ErrorState mensaje={error} onReintentar={() => cargar()} />
      ) : (
        <>
          <DataTable
            columnas={columnas}
            filas={solicitudes}
            cargando={cargando}
            vacioTitulo="No hay solicitudes en este estado"
            vacioDescripcion="Cuando un cliente solicite un cambio de tipo aparecerá en este listado."
            renderFila={(solicitud) => [
              <TableCell key="cliente">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {nombreCompleto(solicitud.cliente)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {solicitud.cliente?.email}
                </Typography>
              </TableCell>,
              <TableCell key="tipos">
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                  <ChipTipoCliente tipo={solicitud.cliente?.tipoCliente} />
                  <Typography variant="caption" color="text.secondary">
                    →
                  </Typography>
                  <ChipTipoCliente tipo={solicitud.tipoSolicitado} />
                </Stack>
              </TableCell>,
              <TableCell key="documento">
                <Typography variant="body2">
                  {solicitud.documentos?.length
                    ? `${solicitud.documentos[0].nombreOriginal}${
                        solicitud.documentos.length > 1
                          ? ` +${solicitud.documentos.length - 1}`
                          : ''
                      }`
                    : solicitud.documentoValidacion}
                </Typography>
                {solicitud.institucionNombre ? (
                  <Typography variant="caption" color="text.secondary">
                    {solicitud.institucionNombre}
                  </Typography>
                ) : null}
              </TableCell>,
              <TableCell key="fecha">
                <Typography variant="body2" color="text.secondary">
                  {formatearFechaHora(solicitud.createdAt)}
                </Typography>
              </TableCell>,
              <TableCell key="estado">
                <ChipEstadoSolicitudTipo estado={solicitud.estado} />
              </TableCell>,
              <TableCell key="acciones" align="right">
                {solicitud.estado === 'PENDIENTE' ? (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => setRevisando(solicitud)}
                  >
                    Revisar
                  </Button>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Revisada
                  </Typography>
                )}
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

      <SolicitudRevisionDialog
        abierto={Boolean(revisando)}
        solicitud={revisando}
        onCerrar={() => setRevisando(null)}
        onRevisada={(respuesta) => {
          mostrarExito(respuesta.mensaje ?? 'Solicitud revisada.');
          cargar();
        }}
      />
    </Box>
  );
}
