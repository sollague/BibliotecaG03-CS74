import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';
import FormTextField from '../components/common/FormTextField.jsx';
import FormSelect from '../components/common/FormSelect.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { ChipDisponibilidad } from '../components/common/StatusChip.jsx';
import { ErrorState } from '../components/common/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { catalogosService } from '../services/catalogos.service.js';
import { librosService } from '../services/libros.service.js';
import { prestamosService } from '../services/prestamos.service.js';

export default function CatalogoPage() {
  const { usuario } = useAuth();
  const { mostrarExito, mostrarError } = useFeedback();

  const [categorias, setCategorias] = useState([]);
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [libros, setLibros] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [seleccion, setSeleccion] = useState([]);
  const [solicitud, setSolicitud] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const esInstitucion = usuario?.tipoCliente === 'INSTITUCION_EDUCATIVA';
  const esBibliotecario = usuario?.rol === 'BIBLIOTECARIO';
  const esCliente = usuario?.rol === 'CLIENTE';

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
          page: pagina,
          pageSize: filasPorPagina,
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
    [busqueda, categoriaId, pagina, filasPorPagina],
  );

  useEffect(() => {
    const controlador = new AbortController();
    cargar(controlador.signal);
    return () => controlador.abort();
  }, [cargar]);

  useEffect(() => {
    setSeleccion([]);
  }, [busqueda, categoriaId, pagina]);

  const buscar = (evento) => {
    evento.preventDefault();
    setPagina(1);
    setBusqueda(texto.trim());
  };

  const limpiar = () => {
    setTexto('');
    setBusqueda('');
    setCategoriaId('');
    setPagina(1);
  };

  const alternarSeleccion = (id) => {
    setSeleccion((previo) =>
      previo.includes(id) ? previo.filter((valor) => valor !== id) : [...previo, id],
    );
  };

  const disponiblesPagina = libros.filter((libro) => libro.disponibles > 0);
  const todosSeleccionados =
    disponiblesPagina.length > 0 &&
    disponiblesPagina.every((libro) => seleccion.includes(libro.id));
  const algunoSeleccionado = disponiblesPagina.some((libro) =>
    seleccion.includes(libro.id),
  );

  const alternarPagina = () => {
    if (todosSeleccionados) {
      setSeleccion((previo) =>
        previo.filter((id) => !disponiblesPagina.some((libro) => libro.id === id)),
      );
    } else {
      setSeleccion((previo) => [
        ...new Set([...previo, ...disponiblesPagina.map((libro) => libro.id)]),
      ]);
    }
  };

  const confirmarSolicitud = async () => {
    if (!solicitud?.length) return;
    setEnviando(true);
    try {
      const respuesta = await prestamosService.solicitar({
        libroIds: solicitud.map((libro) => libro.id),
      });
      mostrarExito(respuesta.mensaje);
      setSolicitud(null);
      setSeleccion([]);
      cargar();
    } catch (err) {
      mostrarError(err?.message ?? 'No se pudo registrar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  const columnas = [
    ...(esInstitucion
      ? [
          {
            key: 'seleccion',
            label: (
              <Checkbox
                size="small"
                checked={todosSeleccionados}
                indeterminate={!todosSeleccionados && algunoSeleccionado}
                onChange={alternarPagina}
                inputProps={{ 'aria-label': 'Seleccionar libros disponibles de la página' }}
              />
            ),
            sx: { width: 44 },
          },
        ]
      : []),
    { key: 'libro', label: 'Libro' },
    { key: 'editorial', label: 'Editorial' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'isbn', label: 'ISBN' },
    { key: 'disponibles', label: 'Disponibilidad' },
    { key: 'acciones', label: 'Acciones', align: 'right' },
  ];

  return (
    <Box>
      <PageHeader
        titulo="Catálogo bibliográfico"
        descripcion="Consulta los libros registrados y la disponibilidad de sus ejemplares."
        accion={
          esInstitucion && seleccion.length > 0 ? (
            <Button
              variant="contained"
              onClick={() => setSolicitud(libros.filter((l) => seleccion.includes(l.id)))}
            >
              Solicitar lote ({seleccion.length})
            </Button>
          ) : null
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
            filas={libros}
            cargando={cargando}
            vacioTitulo="No se encontraron libros"
            vacioDescripcion="Prueba con otro título, autor o categoría."
            renderFila={(libro) => {
              const celdas = [];
              if (esInstitucion) {
                celdas.push(
                  <TableCell key="seleccion" padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={seleccion.includes(libro.id)}
                      disabled={libro.disponibles === 0}
                      onChange={() => alternarSeleccion(libro.id)}
                      inputProps={{ 'aria-label': `Seleccionar ${libro.titulo}` }}
                    />
                  </TableCell>,
                );
              }
              celdas.push(
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
                <TableCell key="disponibilidad">
                  <ChipDisponibilidad disponibles={libro.disponibles} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {libro.disponibles} de {libro.totalEjemplares} ejemplares
                  </Typography>
                </TableCell>,
                <TableCell key="acciones" align="right">
                  {esBibliotecario ? (
                    <Button
                      component={RouterLink}
                      to="/libros"
                      size="small"
                      variant="outlined"
                    >
                      Gestionar
                    </Button>
                  ) : esCliente ? (
                    <Button
                      size="small"
                      variant="contained"
                      disabled={libro.disponibles === 0}
                      onClick={() => setSolicitud([libro])}
                    >
                      Solicitar
                    </Button>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Solo consulta
                    </Typography>
                  )}
                </TableCell>,
              );
              return celdas;
            }}
          />
          <TablePagination
            component="div"
            count={total}
            page={pagina - 1}
            rowsPerPage={filasPorPagina}
            onPageChange={(evento, nueva) => setPagina(nueva + 1)}
            onRowsPerPageChange={(evento) => {
              setFilasPorPagina(Number(evento.target.value));
              setPagina(1);
            }}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            sx={{ borderTop: '1px solid', borderColor: 'divider' }}
          />
        </>
      )}

      <ConfirmDialog
        abierto={Boolean(solicitud)}
        titulo={
          solicitud?.length > 1 ? 'Registrar solicitud por lote' : 'Registrar solicitud'
        }
        mensaje={
          solicitud?.length > 1
            ? `Se registrará una solicitud para ${solicitud.length} libros. La aprobación queda a cargo del Bibliotecario.`
            : `Se registrará la solicitud del libro «${solicitud?.[0]?.titulo ?? ''}». La aprobación queda a cargo del Bibliotecario.`
        }
        textoConfirmar="Registrar solicitud"
        onCerrar={() => setSolicitud(null)}
        onConfirmar={confirmarSolicitud}
        cargando={enviando}
      />
    </Box>
  );
}
