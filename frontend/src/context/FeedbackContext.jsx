import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [estado, setEstado] = useState({
    abierto: false,
    mensaje: '',
    severidad: 'success',
  });

  const cerrar = useCallback((evento, motivo) => {
    if (motivo === 'clickaway') return;
    setEstado((previo) => ({ ...previo, abierto: false }));
  }, []);

  const mostrar = useCallback((mensaje, severidad) => {
    setEstado({ abierto: true, mensaje, severidad });
  }, []);

  const valor = useMemo(
    () => ({
      mostrarExito: (mensaje) => mostrar(mensaje, 'success'),
      mostrarError: (mensaje) => mostrar(mensaje, 'error'),
      mostrarInfo: (mensaje) => mostrar(mensaje, 'info'),
    }),
    [mostrar],
  );

  return (
    <FeedbackContext.Provider value={valor}>
      {children}
      <Snackbar
        open={estado.abierto}
        autoHideDuration={5000}
        onClose={cerrar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={cerrar}
          severity={estado.severidad}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {estado.mensaje}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const contexto = useContext(FeedbackContext);
  if (!contexto) {
    throw new Error('useFeedback debe usarse dentro de FeedbackProvider.');
  }
  return contexto;
}
