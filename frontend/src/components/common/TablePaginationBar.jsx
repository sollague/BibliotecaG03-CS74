import TablePagination from '@mui/material/TablePagination';

export default function TablePaginationBar({
  total,
  pagina,
  filasPorPagina,
  onCambiarPagina,
  onCambiarFilasPorPagina,
}) {
  return (
    <TablePagination
      component="div"
      count={total}
      page={pagina}
      rowsPerPage={filasPorPagina}
      onPageChange={(evento, nuevaPagina) => onCambiarPagina(nuevaPagina + 1)}
      onRowsPerPageChange={(evento) => {
        onCambiarFilasPorPagina(Number(evento.target.value));
        onCambiarPagina(1);
      }}
      rowsPerPageOptions={[10, 20, 50]}
      labelRowsPerPage="Filas por página"
      labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 0 }}
    />
  );
}
