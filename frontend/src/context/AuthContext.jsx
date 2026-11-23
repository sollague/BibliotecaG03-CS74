import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    authService
      .me()
      .then((respuesta) => {
        if (activo) setUsuario(respuesta.data);
      })
      .catch(() => {
        if (activo) setUsuario(null);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const login = useCallback(async (credenciales) => {
    const respuesta = await authService.login(credenciales);
    setUsuario(respuesta.data.usuario);
    return respuesta;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUsuario(null);
    }
  }, []);

  const actualizarUsuario = useCallback((nuevoUsuario) => {
    setUsuario(nuevoUsuario);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, login, logout, actualizarUsuario }),
    [usuario, cargando, login, logout, actualizarUsuario],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }
  return contexto;
}
