import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import LocalLibraryOutlinedIcon from '@mui/icons-material/LocalLibraryOutlined';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { navegacionPorRol } from '../../config/navigation.js';

export const ANCHO_SIDEBAR = 256;

export default function Sidebar({ movilAbierto, onCerrar }) {
  const { usuario } = useAuth();
  const opciones = usuario ? navegacionPorRol(usuario.rol) : [];

  const contenido = (
    <Box
      sx={{
        width: ANCHO_SIDEBAR,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.dark',
            }}
          >
            <LocalLibraryOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              Biblioteca Virtual
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sistema G03
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider />
      <List sx={{ px: 1.5, py: 1.5, flexGrow: 1 }}>
        {opciones.map((opcion) => {
          const Icono = opcion.icono;
          return (
            <ListItemButton
              key={opcion.ruta}
              component={NavLink}
              to={opcion.ruta}
              end
              onClick={onCerrar}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                borderLeft: '3px solid transparent',
                color: 'text.secondary',
                '& .MuiListItemIcon-root': { color: 'text.secondary', minWidth: 38 },
                '&.active': {
                  backgroundColor: 'primary.light',
                  color: 'primary.dark',
                  borderLeftColor: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.dark' },
                  '& .MuiListItemText-primary': { fontWeight: 600 },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <Icono fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={opcion.etiqueta}
                primaryTypographyProps={{ fontSize: '0.875rem' }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Universidad de Guayaquil
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        component="nav"
        className="app-sidebar"
        sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}
      >
        <Box
          sx={{
            width: ANCHO_SIDEBAR,
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            zIndex: (theme) => theme.zIndex.drawer,
          }}
        >
          {contenido}
        </Box>
      </Box>

      {movilAbierto !== undefined ? (
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            inset: 0,
            zIndex: (theme) => theme.zIndex.drawer,
            visibility: movilAbierto ? 'visible' : 'hidden',
          }}
        >
          <Box
            onClick={onCerrar}
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(37, 37, 37, 0.35)',
              opacity: movilAbierto ? 1 : 0,
              transition: 'opacity 200ms',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              transform: movilAbierto ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 220ms ease',
              boxShadow: movilAbierto ? 4 : 0,
            }}
          >
            {contenido}
          </Box>
        </Box>
      ) : null}
    </>
  );
}
