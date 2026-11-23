import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';

const TODOS = ['ADMINISTRADOR', 'BIBLIOTECARIO', 'CLIENTE'];

export const NAVEGACION = [
  {
    etiqueta: 'Inicio',
    ruta: '/',
    icono: HomeOutlinedIcon,
    roles: TODOS,
  },
  {
    etiqueta: 'Catálogo',
    ruta: '/catalogo',
    icono: MenuBookOutlinedIcon,
    roles: TODOS,
  },
  {
    etiqueta: 'Libros y ejemplares',
    ruta: '/libros',
    icono: LibraryBooksOutlinedIcon,
    roles: ['BIBLIOTECARIO'],
  },
  {
    etiqueta: 'Préstamos',
    ruta: '/prestamos',
    icono: SwapHorizOutlinedIcon,
    roles: ['BIBLIOTECARIO'],
  },
  {
    etiqueta: 'Mis préstamos',
    ruta: '/mis-prestamos',
    icono: AssignmentOutlinedIcon,
    roles: ['CLIENTE'],
  },
  {
    etiqueta: 'Clientes',
    ruta: '/clientes',
    icono: PeopleAltOutlinedIcon,
    roles: ['BIBLIOTECARIO'],
  },
  {
    etiqueta: 'Solicitudes de tipo',
    ruta: '/solicitudes-tipo',
    icono: HowToRegOutlinedIcon,
    roles: ['BIBLIOTECARIO'],
  },
  {
    etiqueta: 'Usuarios',
    ruta: '/usuarios',
    icono: ManageAccountsOutlinedIcon,
    roles: ['ADMINISTRADOR'],
  },
  {
    etiqueta: 'Políticas de préstamo',
    ruta: '/politicas',
    icono: PolicyOutlinedIcon,
    roles: ['ADMINISTRADOR'],
  },
  {
    etiqueta: 'Reportes',
    ruta: '/reportes',
    icono: BarChartOutlinedIcon,
    roles: ['ADMINISTRADOR', 'BIBLIOTECARIO'],
  },
  {
    etiqueta: 'Mi perfil',
    ruta: '/perfil',
    icono: PersonOutlineIcon,
    roles: TODOS,
  },
];

export function navegacionPorRol(rol) {
  return NAVEGACION.filter((item) => item.roles.includes(rol));
}
