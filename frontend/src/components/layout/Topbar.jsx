import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../../context/AuthContext.jsx';
import { NAVEGACION } from '../../config/navigation.js';
import { ETIQUETAS_ROL, iniciales, nombreCompleto } from '../../utils/labels.js';
import { ANCHO_SIDEBAR } from './Sidebar.jsx';

export default function Topbar({ onAbrirMenu }) {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [ancla, setAncla] = useState(null);

  const seccion =
    NAVEGACION.find(
      (item) =>
        item.ruta === location.pathname ||
        (item.ruta !== '/' && location.pathname.startsWith(item.ruta)),
    )?.etiqueta ?? 'Biblioteca Virtual G03';

  const cerrarMenu = () => setAncla(null);

  const manejarSalir = async () => {
    cerrarMenu();
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      className="app-topbar"
      sx={{
        width: { md: `calc(100% - ${ANCHO_SIDEBAR}px)` },
        ml: { md: `${ANCHO_SIDEBAR}px` },
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ minHeight: 64, gap: 1.5 }}>
        <IconButton
          edge="start"
          onClick={onAbrirMenu}
          sx={{ display: { md: 'none' } }}
          aria-label="Abrir menú de navegación"
        >
          <MenuOutlinedIcon />
        </IconButton>

        <Typography variant="h6" component="p" sx={{ flexGrow: 1 }} noWrap>
          {seccion}
        </Typography>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              {nombreCompleto(usuario)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ETIQUETAS_ROL[usuario?.rol] ?? ''}
            </Typography>
          </Box>
          <Tooltip title="Opciones de cuenta">
            <IconButton onClick={(evento) => setAncla(evento.currentTarget)}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                {iniciales(usuario)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Stack>

        <Menu
          anchorEl={ancla}
          open={Boolean(ancla)}
          onClose={cerrarMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem component={Link} to="/perfil" onClick={cerrarMenu}>
            <PersonOutlineOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
            Mi perfil
          </MenuItem>
          <Divider />
          <MenuItem onClick={manejarSalir}>
            <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
            Cerrar sesión
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
