import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import EmptyState from './EmptyState.jsx';

export default function DataTable({
  columnas,
  filas,
  renderFila,
  cargando = false,
  vacioTitulo,
  vacioDescripcion,
  vacioIcono,
}) {
  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}
    >
      <Table size="medium" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            {columnas.map((columna) => (
              <TableCell
                key={columna.key}
                align={columna.align ?? 'left'}
                sx={columna.sx}
              >
                {columna.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {cargando ? (
            <TableRow>
              <TableCell colSpan={columnas.length} align="center">
                <Box sx={{ py: 5 }}>
                  <CircularProgress size={28} />
                </Box>
              </TableCell>
            </TableRow>
          ) : filas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnas.length} sx={{ p: 0 }}>
                <EmptyState
                  titulo={vacioTitulo}
                  descripcion={vacioDescripcion}
                  icono={vacioIcono}
                />
              </TableCell>
            </TableRow>
          ) : (
            filas.map((fila, indice) => (
              <TableRow hover key={fila.id ?? indice}>
                {renderFila(fila, indice)}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
