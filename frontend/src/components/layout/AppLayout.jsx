import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Sidebar, { ANCHO_SIDEBAR } from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  const [menuMovil, setMenuMovil] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar movilAbierto={menuMovil} onCerrar={() => setMenuMovil(false)} />
      <Topbar onAbrirMenu={() => setMenuMovil(true)} />
      <Box
        component="main"
        className="app-main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          ml: { md: `${ANCHO_SIDEBAR}px` },
          pt: '64px',
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3, lg: 4 }, maxWidth: 1440, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
