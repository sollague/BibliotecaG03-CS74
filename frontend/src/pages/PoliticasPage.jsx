import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PageHeader from '../components/common/PageHeader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { ErrorState } from '../components/common/LoadingState.jsx';
import PoliticaDialog from '../components/politicas/PoliticaDialog.jsx';
import { useFeedback } from '../context/FeedbackContext.jsx';
import { catalogosService } from '../services/catalogos.service.js';
import { ETIQUETAS_TIPO_CLIENTE } from '../utils/labels.js';

const ORDEN = [
  'LECTOR_GENERAL',
  'ESTUDIANTE',
  'BECARIO',
  'INSTITUCION_EDUCATIVA',
];

function Fila({ etiqueta, valor }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {etiqueta}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
        {valor}
      </Typography>
    </Stack>
  );
}

export default function PoliticasPage() {
  const { mostrarExito } = useFeedback();
  const [politicas, setPoliticas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const respuesta = await catalogosService.politicas();
      const ordenadas = [...respuesta.data].sort(
        (a, b) => ORDEN.indexOf(a.tipoCliente) - ORDEN.indexOf(b.tipoCliente),
      );
      setPoliticas(ordenadas);
    } catch (err) {
      setError(err?.message ?? 'No se pudieron cargar las políticas de préstamo.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <Box>
      <PageHeader
        titulo="Políticas de préstamo"
        descripcion="Revisa y actualiza los límites, plazos y renovaciones de cada tipo de cliente."
      />

      <Alert severity="info" sx={{ mb: 2.5 }}>
        Los cambios se aplican a las solicitudes que se aprueben y a las entregas y
        renovaciones que se registren a partir de su actualización. Los préstamos ya
        entregados conservan la fecha límite calculada al momento de la entrega.
      </Alert>

      {error ? (
        <ErrorState mensaje={error} onReintentar={cargar} />
      ) : cargando ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <Typography variant="body2" color="text.secondary">
            Cargando políticas...
          </Typography>
        </Box>
      ) : politicas.length === 0 ? (
        <EmptyState
          titulo="No hay políticas configuradas"
          descripcion="Ejecuta el seed del backend para crear las políticas iniciales."
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {politicas.map((politica) => (
            <Paper
              key={politica.id}
              variant="outlined"
              sx={{
                borderColor: 'divider',
                borderRadius: 2.5,
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6">
                    {ETIQUETAS_TIPO_CLIENTE[politica.tipoCliente] ??
                      politica.tipoCliente}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Política de préstamo
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<EditOutlinedIcon fontSize="small" />}
                  onClick={() => setEditando(politica)}
                >
                  Editar
                </Button>
              </Stack>

              <Divider />

              <Stack spacing={1.25}>
                <Fila
                  etiqueta="Préstamos simultáneos"
                  valor={politica.maxLibrosSimultaneos}
                />
                <Fila etiqueta="Plazo de préstamo" valor={`${politica.plazoDias} días`} />
                <Fila
                  etiqueta="Renovaciones permitidas"
                  valor={politica.renovacionesPermitidas}
                />
                <Fila
                  etiqueta="Días por renovación"
                  valor={`${politica.diasRenovacion} días`}
                />
                <Fila
                  etiqueta="Documento de validación"
                  valor={politica.requiereDocumento ? 'Requerido' : 'No requerido'}
                />
              </Stack>

              <Box
                sx={{
                  mt: 'auto',
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'background.default',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Documento
                </Typography>
                <Typography variant="body2">{politica.documentoDescripcion}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <PoliticaDialog
        abierto={Boolean(editando)}
        politica={editando}
        etiquetaTipo={
          editando ? ETIQUETAS_TIPO_CLIENTE[editando.tipoCliente] ?? editando.tipoCliente : ''
        }
        onCerrar={() => setEditando(null)}
        onGuardado={(mensaje) => {
          mostrarExito(mensaje ?? 'Política actualizada correctamente.');
          cargar();
        }}
      />
    </Box>
  );
}
