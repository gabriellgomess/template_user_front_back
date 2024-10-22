// src/MenuItems.jsx
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

const MenuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    name: 'Usuários',
    path: '/users',
    icon: <PeopleIcon />,
  },  
  {
    name: 'Sair',
    action: 'logout',
    icon: <LogoutIcon />,
  },
];

export default MenuItems;
