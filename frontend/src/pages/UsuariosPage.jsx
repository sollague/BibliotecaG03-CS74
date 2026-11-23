import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PageHeader from '../components/common/PageHeader.jsx';
import DataTable from '../components/common/DataTable.jsx';
import TablePaginationBar from '../components/common/TablePaginationBar.jsx';
import FormTextField from '../components/common/FormTextField.jsx';
import FormSelect from '../components/common/FormSelect.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import {
  ChipActivo,
  ChipRol,
  ChipTipoCliente,
} from '../components/common/StatusChip.jsx';
import { ErrorState } from '../components/common/LoadingState.jsx';
import {
  CambiarRolDialog,
  CrearUsuarioDialog,
} from '../components/usuarios/UsuarioDialogs.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { usuariosService } from '../services/usuarios.service.js';
import { nombreCompleto } from '../utils/labels.js';

export default function UsuariosPage() {
  const { usuario: usuarioActual } = useAuth();
  const { mostrarExito, mostrarError } = useFeedback();

  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [rol, setRol] = useState('');
  const [activo, setActivo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [usuarios, setUsuarios] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [crearAbierto, setCrearAbierto] = useState(false);
  const [cambiandoRol, setCambiandoRol] = useState(null);
  const [cambiandoEstado, setCambiandoEstado] = useState(null);
  const [procesandoEstado, setProcesandoEstado] = useState(false);

  const cargar = useCallback(
    async (signal) => {
      setCargando(true);
      setError('');
      try {
        const respuesta = await usuariosService.listar({
          q: busqueda,
          rol,
          activo,
          page: pagina,
          pageSize: filasPorPagina,
        });
        setUsuarios(respuesta.data);
        setTotal(respuesta.meta.total);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setError(err?.message ?? 'No se pudo cargar el listado de usuarios.');
        }
      } finally {
        setCargando(false);
      }
    },
    [busqueda, rol, activo, pagina, filasPorPagina],
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
    setRol('');
    setActivo('');
    setPagina(1);
  };

  const confirmarEstado = async () => {
    if (!cambiandoEstado) return;
    setProcesandoEstado(true);
    try {
      const respuesta = await usuariosService.cambiarEstado(
        cambiandoEstado.id,
        !cambiandoEstado.activo,
      );
      mostrarExito(respuesta.mensaje);
      setCambiandoEstado(null);
      cargar();
    } catch (err) {
      mostrarError(err?.message ?? 'No se pudo cambiar el estado de la cuenta.');
    } finally {
      setProcesandoEstado(false);
    }
  };

  const columnas = [
    { key: 'usuario', label: 'Usuario' },
    { key: 'rol', label: 'Perfil' },
    { key: 'identificacion', label: 'Identificación' },
    { key: 'tipoCliente', label: 'Tipo de cliente' },
    { key: 'estado', label: 'Estado' },
    { key: 'acciones', label: 'Acciones', align: 'right' },
  ];

  return (
    <Box>
      <PageHeader
        titulo="Usuarios"
        descripcion="Administra las cuentas del personal, sus perfiles de acceso y su estado."
        accion={
          <Button
            variant="contained"
            startIcon={<AddOutlinedIcon />}
            onClick={() => setCrearAbierto(true)}
          >
            Crear cuenta
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
            gridTemplateColumns: { xs: '1fr', md: '2fr 1.2fr 1fr auto' },
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
            etiqueta="Perfil"
            value={rol}
            onChange={(evento) => {
              setRol(evento.target.value);
              setPagina(1);
            }}
            opciones={[
              { valor: '', etiqueta: 'Todos los perfiles' },
              { valor: 'ADMINISTRADOR', etiqueta: 'Administrador' },
              { valor: 'BIBLIOTECARIO', etiqueta: 'Bibliotecario' },
              { valor: 'CLIENTE', etiqueta: 'Cliente' },
            ]}
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
            filas={usuarios}
            cargando={cargando}
            vacioTitulo="No se encontraron usuarios"
            vacioDescripcion="Ajusta los filtros o crea una cuenta de personal."
            renderFila={(usuario) => {
              const esPropia = usuario.id === usuarioActual?.id;
              return [
                <TableCell key="usuario">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {nombreCompleto(usuario)}
                    {esPropia ? ' (tú)' : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {usuario.email}
                  </Typography>
                </TableCell>,
                <TableCell key="rol">
                  <ChipRol rol={usuario.rol} />
                </TableCell>,
                <TableCell key="identificacion">{usuario.identificacion}</TableCell>,
                <TableCell key="tipoCliente">
                  {usuario.rol === 'CLIENTE' ? (
                    <ChipTipoCliente tipo={usuario.tipoCliente} />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No aplica
                    </Typography>
                  )}
                </TableCell>,
                <TableCell key="estado">
                  <ChipActivo activo={usuario.activo} />
                </TableCell>,
                <TableCell key="acciones" align="right">
                  <Tooltip
                    title={
                      esPropia
                        ? 'No puedes cambiar el perfil de tu propia cuenta'
                        : 'Cambiar perfil de acceso'
                    }
                  >
                    <span>
                      <Button
                        size="small"
                        disabled={esPropia}
                        onClick={() => setCambiandoRol(usuario)}
                        sx={{ mr: 1 }}
                      >
                        Cambiar perfil
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip
                    title={
                      esPropia
                        ? 'No puedes desactivar tu propia cuenta'
                        : usuario.activo
                          ? 'Desactivar cuenta'
                          : 'Activar cuenta'
                    }
                  >
                    <span>
                      <Button
                        size="small"
                        variant="outlined"
                        color={usuario.activo ? 'error' : 'success'}
                        disabled={esPropia}
                        onClick={() => setCambiandoEstado(usuario)}
                      >
                        {usuario.activo ? 'Desactivar' : 'Activar'}
                      </Button>
                    </span>
                  </Tooltip>
                </TableCell>,
              ];
            }}
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

      <CrearUsuarioDialog
        abierto={crearAbierto}
        onCerrar={() => setCrearAbierto(false)}
        onCreado={(mensaje) => {
          mostrarExito(mensaje ?? 'Cuenta creada correctamente.');
          cargar();
        }}
      />

      <CambiarRolDialog
        abierto={Boolean(cambiandoRol)}
        usuario={cambiandoRol}
        onCerrar={() => setCambiandoRol(null)}
        onCambiado={(mensaje) => {
          mostrarExito(mensaje ?? 'Perfil actualizado correctamente.');
          cargar();
        }}
      />

      <ConfirmDialog
        abierto={Boolean(cambiandoEstado)}
        titulo={
          cambiandoEstado?.activo ? 'Desactivar cuenta' : 'Activar cuenta'
        }
        mensaje={
          cambiandoEstado?.activo
            ? `La cuenta de ${nombreCompleto(cambiandoEstado)} quedará desactivada y no podrá iniciar sesión hasta que se reactive.`
            : `La cuenta de ${nombreCompleto(cambiandoEstado)} podrá iniciar sesión nuevamente.`
        }
        textoConfirmar={cambiandoEstado?.activo ? 'Desactivar' : 'Activar'}
        color={cambiandoEstado?.activo ? 'error' : 'primary'}
        onCerrar={() => setCambiandoEstado(null)}
        onConfirmar={confirmarEstado}
        cargando={procesandoEstado}
      />
    </Box>
  );
}
