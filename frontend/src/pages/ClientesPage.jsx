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
import {
  ChipActivo,
  ChipTipoCliente,
} from '../components/common/StatusChip.jsx';
import { ErrorState } from '../components/common/LoadingState.jsx';
import ClienteDialog from '../components/clientes/ClienteDialog.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { usuariosService } from '../services/usuarios.service.js';
import { nombreCompleto } from '../utils/labels.js';

export default function ClientesPage() {
  const { mostrarExito } = useFeedback();

  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [activo, setActivo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [clientes, setClientes] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);

  const cargar = useCallback(
    async (signal) => {
      setCargando(true);
      setError('');
      try {
        const respuesta = await usuariosService.listarClientes({
          q: busqueda,
          activo,
          page: pagina,
          pageSize: filasPorPagina,
        });
        setClientes(respuesta.data);
        setTotal(respuesta.meta.total);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setError(err?.message ?? 'No se pudo cargar el listado de clientes.');
        }
      } finally {
        setCargando(false);
      }
    },
    [busqueda, activo, pagina, filasPorPagina],
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
    setActivo('');
    setPagina(1);
  };

  const columnas = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'identificacion', label: 'Identificación' },
    { key: 'tipo', label: 'Tipo de cliente' },
    { key: 'documento', label: 'Documento de validación' },
    { key: 'estado', label: 'Estado' },
    { key: 'acciones', label: 'Acciones', align: 'right' },
  ];

  return (
    <Box>
      <PageHeader
        titulo="Clientes"
        descripcion="Asigna el tipo de cliente y registra el documento de validación presentado."
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
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr auto' },
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <FormTextField
            etiqueta="Buscar por nombre, correo o identificación"
            value={texto}
            onChange={(evento) => setTexto(evento.target.value)}
          />
          <FormSelect
            etiqueta="Estado"
            value={activo}
            onChange={(evento) => {
              setActivo(evento.target.value);
              setPagina(1);
            }}
            opciones={[
              { valor: '', etiqueta: 'Todas las cuentas' },
              { valor: 'true', etiqueta: 'Activas' },
              { valor: 'false', etiqueta: 'Inactivas' },
            ]}
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
            filas={clientes}
            cargando={cargando}
            vacioTitulo="No se encontraron clientes"
            vacioDescripcion="Los clientes se registran desde la pantalla pública de registro."
            renderFila={(cliente) => [
              <TableCell key="cliente">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {nombreCompleto(cliente)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {cliente.email}
                </Typography>
              </TableCell>,
              <TableCell key="identificacion">{cliente.identificacion}</TableCell>,
              <TableCell key="tipo">
                <ChipTipoCliente tipo={cliente.tipoCliente} />
              </TableCell>,
              <TableCell key="documento">
                <Typography variant="body2" color="text.secondary">
                  {cliente.documentoValidacion || 'Sin registrar'}
                </Typography>
              </TableCell>,
              <TableCell key="estado">
                <ChipActivo activo={cliente.activo} />
              </TableCell>,
              <TableCell key="acciones" align="right">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setEditando(cliente)}
                >
                  Editar
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

      <ClienteDialog
        abierto={Boolean(editando)}
        cliente={editando}
        onCerrar={() => setEditando(null)}
        onGuardado={(mensaje) => {
          mostrarExito(mensaje ?? 'Datos del cliente actualizados.');
          cargar();
        }}
      />
    </Box>
  );
}
