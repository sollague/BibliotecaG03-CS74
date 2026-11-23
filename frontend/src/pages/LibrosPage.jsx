import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';
import TablePaginationBar from '../components/common/TablePaginationBar.jsx';
import FormTextField from '../components/common/FormTextField.jsx';
import FormSelect from '../components/common/FormSelect.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { ChipDisponibilidad } from '../components/common/StatusChip.jsx';
import { ErrorState } from '../components/common/LoadingState.jsx';
import LibroFormDialog from '../components/libros/LibroFormDialog.jsx';
import EjemplaresDialog from '../components/libros/EjemplaresDialog.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { catalogosService } from '../services/catalogos.service.js';
import { librosService } from '../services/libros.service.js';

export default function LibrosPage() {
  const { mostrarExito, mostrarError } = useFeedback();

  const [categorias, setCategorias] = useState([]);
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [libros, setLibros] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [dialogoLibro, setDialogoLibro] = useState({ abierto: false, libro: null });
  const [dialogoEjemplares, setDialogoEjemplares] = useState({ abierto: false, libro: null });
  const [porEliminar, setPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    catalogosService
      .categorias()
      .then((respuesta) => setCategorias(respuesta.data))
      .catch(() => setCategorias([]));
  }, []);

  const cargar = useCallback(
    async (signal) => {
      setCargando(true);
      setError('');
      try {
        const respuesta = await librosService.listar({
          q: busqueda,
          categoriaId,
          incluirInactivos: incluirInactivos ? 'true' : undefined,
          page: pagina,
          pageSize: filasPorPagina,
        });
        setLibros(respuesta.data);
        setTotal(respuesta.meta.total);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setError(err?.message ?? 'No se pudo cargar el listado de libros.');
        }
      } finally {
        setCargando(false);
      }
    },
    [busqueda, categoriaId, incluirInactivos, pagina, filasPorPagina],
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
    setCategoriaId('');
    setIncluirInactivos(false);
    setPagina(1);
  };

  const eliminar = async () => {
    if (!porEliminar) return;
    setEliminando(true);
    try {
      const respuesta = await librosService.eliminar(porEliminar.id);
      mostrarExito(respuesta.mensaje);
      setPorEliminar(null);
      await cargar();
    } catch (err) {
      mostrarError(err?.message ?? 'No se pudo eliminar el libro.');
    } finally {
      setEliminando(false);
    }
  };

  const columnas = [
    { key: 'libro', label: 'Libro' },
    { key: 'editorial', label: 'Editorial' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'ejemplares', label: 'Ejemplares', align: 'right' },
    { key: 'disponibles', label: 'Disponibilidad' },
    { key: 'estado', label: 'Estado' },
    { key: 'acciones', label: 'Acciones', align: 'right' },
  ];

  return (
    <Box>
      <PageHeader
        titulo="Libros y ejemplares"
        descripcion="Registra el material bibliográfico y administra las copias disponibles."
        accion={
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setDialogoLibro({ abierto: true, libro: null })}
          >
            Registrar libro
          </Button>
        }
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
            gridTemplateColumns: { xs: '1fr', md: '2fr 1.2fr auto' },
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
            onChange={(evento) => {
              setCategoriaId(evento.target.value);
              setPagina(1);
            }}
            opciones={[
              { valor: '', etiqueta: 'Todas las categorías' },
              ...categorias.map((categoria) => ({
                valor: categoria.id,
                etiqueta: categoria.nombre,
              })),
            ]}
          />
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Button type="submit" variant="contained" startIcon={<SearchOutlinedIcon />}>
              Buscar
            </Button>
            <Button variant="text" color="inherit" onClick={limpiar}>
              Limpiar
            </Button>
          </Stack>
        </Box>
        <FormControlLabel
          sx={{ mt: 1, ml: 0 }}
          control={
            <Checkbox
              size="small"
              checked={incluirInactivos}
              onChange={(evento) => {
                setIncluirInactivos(evento.target.checked);
                setPagina(1);
              }}
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              Mostrar libros eliminados del catálogo
            </Typography>
          }
        />
      </Paper>

      {error ? (
        <ErrorState mensaje={error} onReintentar={() => cargar()} />
      ) : (
        <>
          <DataTable
            columnas={columnas}
            filas={libros}
            cargando={cargando}
            vacioTitulo="No hay libros registrados"
            vacioDescripcion="Registra el primer libro para que esté disponible en el catálogo."
            renderFila={(libro) => [
              <TableCell key="libro">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {libro.titulo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {libro.autor} · {libro.anioPublicacion}
                </Typography>
              </TableCell>,
              <TableCell key="editorial">{libro.editorial}</TableCell>,
              <TableCell key="categoria">{libro.categoriaNombre}</TableCell>,
              <TableCell key="isbn">{libro.isbn}</TableCell>,
              <TableCell key="ejemplares" align="right">
                {libro.totalEjemplares}
              </TableCell>,
              <TableCell key="disponibles">
                <ChipDisponibilidad disponibles={libro.disponibles} />
              </TableCell>,
              <TableCell key="estado">
                <Typography
                  variant="body2"
                  sx={{
                    color: libro.activo ? 'success.dark' : 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  {libro.activo ? 'En catálogo' : 'Eliminado'}
                </Typography>
              </TableCell>,
              <TableCell key="acciones" align="right">
                <Tooltip title="Editar datos del libro">
                  <IconButton
                    size="small"
                    onClick={() => setDialogoLibro({ abierto: true, libro })}
                    aria-label={`Editar ${libro.titulo}`}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Gestionar ejemplares">
                  <span>
                    <IconButton
                      size="small"
                      disabled={!libro.activo}
                      onClick={() => setDialogoEjemplares({ abierto: true, libro })}
                      aria-label={`Gestionar ejemplares de ${libro.titulo}`}
                    >
                      <Inventory2OutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip
                  title={
                    libro.activo
                      ? 'Eliminar del catálogo'
                      : 'Este libro ya fue eliminado del catálogo'
                  }
                >
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={!libro.activo}
                      onClick={() => setPorEliminar(libro)}
                      aria-label={`Eliminar ${libro.titulo}`}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
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

      <LibroFormDialog
        abierto={dialogoLibro.abierto}
        libro={dialogoLibro.libro}
        categorias={categorias}
        onCerrar={() => setDialogoLibro({ abierto: false, libro: null })}
        onGuardado={(mensaje) => {
          mostrarExito(mensaje ?? 'Libro guardado correctamente.');
          cargar();
        }}
      />

      <EjemplaresDialog
        abierto={dialogoEjemplares.abierto}
        libro={dialogoEjemplares.libro}
        onCerrar={() => setDialogoEjemplares({ abierto: false, libro: null })}
        onCambio={cargar}
      />

      <ConfirmDialog
        abierto={Boolean(porEliminar)}
        titulo="Eliminar libro del catálogo"
        mensaje={`El libro «${porEliminar?.titulo ?? ''}» dejará de mostrarse en el catálogo. No se puede eliminar si tiene préstamos activos o solicitudes pendientes.`}
        textoConfirmar="Eliminar libro"
        color="error"
        onCerrar={() => setPorEliminar(null)}
        onConfirmar={eliminar}
        cargando={eliminando}
      />
    </Box>
  );
}
