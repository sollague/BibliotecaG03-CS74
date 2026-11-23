import { Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import { RutaProtegida, RutaPublica } from './ProtectedRoute.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegistroPage from '../pages/RegistroPage.jsx';
import InicioPage from '../pages/InicioPage.jsx';
import CatalogoPage from '../pages/CatalogoPage.jsx';
import LibrosPage from '../pages/LibrosPage.jsx';
import PrestamosPage from '../pages/PrestamosPage.jsx';
import MisPrestamosPage from '../pages/MisPrestamosPage.jsx';
import ClientesPage from '../pages/ClientesPage.jsx';
import SolicitudesTipoPage from '../pages/SolicitudesTipoPage.jsx';
import UsuariosPage from '../pages/UsuariosPage.jsx';
import PoliticasPage from '../pages/PoliticasPage.jsx';
import ReportesPage from '../pages/ReportesPage.jsx';
import PerfilPage from '../pages/PerfilPage.jsx';
import NoEncontradaPage from '../pages/NoEncontradaPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<RutaPublica />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
      </Route>

      <Route element={<RutaProtegida />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<InicioPage />} />
          <Route element={<RutaProtegida roles={['BIBLIOTECARIO', 'CLIENTE', 'ADMINISTRADOR']} />}>
            <Route path="/catalogo" element={<CatalogoPage />} />
          </Route>
          <Route element={<RutaProtegida roles={['BIBLIOTECARIO']} />}>
            <Route path="/libros" element={<LibrosPage />} />
            <Route path="/prestamos" element={<PrestamosPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/solicitudes-tipo" element={<SolicitudesTipoPage />} />
          </Route>
          <Route element={<RutaProtegida roles={['CLIENTE']} />}>
            <Route path="/mis-prestamos" element={<MisPrestamosPage />} />
          </Route>
          <Route element={<RutaProtegida roles={['ADMINISTRADOR']} />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/politicas" element={<PoliticasPage />} />
          </Route>
          <Route element={<RutaProtegida roles={['ADMINISTRADOR', 'BIBLIOTECARIO']} />}>
            <Route path="/reportes" element={<ReportesPage />} />
          </Route>
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="*" element={<NoEncontradaPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
