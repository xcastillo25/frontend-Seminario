import React, { useState, useRef, useEffect } from 'react';
import '../design/Dashboard.css';
import Logo from '../../assets/paseo.jpg';
import { useNavigate } from 'react-router-dom';
import Empleados from './Empleados';
import Configuracion from './Configuracion';
import Roles from './Roles';
import Clientes from './Clientes';
import Pagos from './Pagos'
import Usuarios from './Usuarios';
import Servicios from './Servicios';  
import Lotes from './Lotes';
import Lecturas from './Lecturas';
import Perfil from './Perfil';
import ViewPagos from './ViewPagos';
import Inicio from './Inicio';
import { useAuth } from './ContextAuth';

const Dashboard = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');
  const [topBarTitle, setTopBarTitle] = useState('Inicio');
  const [topBarIcon, setTopBarIcon] = useState('home');
  const { user } = useAuth();


  const [plataformaVisible, setPlataformaVisible] = useState('plataformaInicio');
  const [asideVisible, setAsideVisible] = useState(true);
  const asideRef = useRef(null);

  useEffect(() => {
    console.log('Usuario cargado:', user); // Verificar si el usuario está cargado
  }, [user]);

  const mostrarPlataforma = (plataforma) => {
    setPlataformaVisible(plataforma);
    console.log("Usuarios", user)
  };

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/session');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const handleMenuClick = (menuItem, title, icon) => {
    setActiveMenuItem(menuItem);
    setTopBarTitle(title);
    setTopBarIcon(icon);
    if (menuItem === 'Empleados') {
      mostrarPlataforma('plataformaEmpleados');
    } else if (menuItem === 'Configuracion') {
        mostrarPlataforma('plataformaConfiguracion');
    } else if(menuItem === 'Roles'){
        mostrarPlataforma('plataformaRoles');
    } else if(menuItem === 'Clientes'){
      mostrarPlataforma('plataformaClientes');
    } else if (menuItem === 'Pagos'){
      mostrarPlataforma('plataformaPagos');
    } else if (menuItem === 'Usuarios'){
      mostrarPlataforma('plataformaUsuarios')
    } else if (menuItem === 'Servicios'){
      mostrarPlataforma('plataformaServicios')
    }else if (menuItem === 'Lotes'){
    mostrarPlataforma('plataformaLotes')
    }else if (menuItem === 'Lecturas'){
      mostrarPlataforma('plataformaLecturas')
    }else if (menuItem === 'Perfil') {
      const idempleado = user?.usuario?.idempleado;  // Verifica si existe idempleado
      if (idempleado) {
        mostrarPlataforma('plataformaPerfil');
      } else {
        console.error('El idempleado no está definido');
      }
    }else if (menuItem === 'ViewPagos') {
      mostrarPlataforma('plataformaViewPagos');
    }else if (menuItem === 'Inicio') {
      mostrarPlataforma('plataformaInicio');
    }
  };

  return (
    <div className={`dashboard-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="logo">
          <img src={Logo} alt="null" className="user-avatar" />
          <p>Paseo Las Lomas Salamá B. V.</p>
        </div>
        <div className="user-profile">
          <div className="user-info">
          <h4>Hola {user.usuario.nombre}</h4>
          <p>Rol: {user.usuario.rol}</p>
          </div>
        </div>
        <nav className="menu">
          <h4>MENU</h4>
          {/* 
              <a 
                href="#perfil" 
                className={`menu-item ${activeMenuItem === 'Perfil' ? 'active' : ''}`} 
                onClick={() => handleMenuClick('Perfil', 'Perfil', 'manage_accounts')}
              >
                <span className="material-icons">manage_accounts</span>
                <span>Perfil</span>
              </a>
          */}
          <a 
            href="#inicio" 
            className={`menu-item ${activeMenuItem === 'Inicio' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Inicio', 'Inicio', 'home')}
          >
            <span className="material-icons">home</span>
            <span>Inicio</span>
          </a>
          <a 
            href="#clientes" 
            className={`menu-item ${activeMenuItem === 'Clientes' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Clientes', 'Clientes', 'person')}
          >
            <span className="material-icons">person</span>
            <span>Clientes</span>
          </a>
          <a 
            href="#empleados" 
            className={`menu-item ${activeMenuItem === 'Empleados' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Empleados', 'Empleados', 'group')}
          >
            <span className="material-icons">group</span>
            <span>Empleados</span>
          </a>
          <a 
            href="#lotes" 
            className={`menu-item ${activeMenuItem === 'Lotes' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Lotes', 'Lotes', 'map')}
          >
            <span className="material-icons">map</span>
            <span>Lotes</span>
          </a>
          <a 
            href="#servicios" 
            className={`menu-item ${activeMenuItem === 'Servicios' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Servicios', 'Servicios', 'build')}
          >
            <span className="material-icons">build</span>
            <span>Servicios</span>
          </a>
          <a 
            href="#roles" 
            className={`menu-item ${activeMenuItem === 'Roles' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Roles', 'Roles', 'admin_panel_settings')}
          >
            <span className="material-icons">admin_panel_settings</span>
            <span>Roles</span>
          </a>
          <a 
            href="#usuarios" 
            className={`menu-item ${activeMenuItem === 'Usuarios' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Usuarios', 'Usuarios', 'account_circle')}
          >
            <span className="material-icons">account_circle</span>
            <span>Usuarios</span>
          </a>
          <a 
            href="#pagos" 
            className={`menu-item ${activeMenuItem === 'Pagos' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Pagos', 'Pagos', 'payment')}
          >
            <span className="material-icons">payment</span>
            <span>Pagos</span>
          </a>
          <a 
            href="#lecturas" 
            className={`menu-item ${activeMenuItem === 'Lecturas' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Lecturas', 'Lecturas', 'table_rows')}
          >
            <span className="material-icons">table_rows</span>
            <span>Lecturas</span>
          </a>
          <a 
            href="#ViewPagos" 
            className={`menu-item ${activeMenuItem === 'ViewPagos' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('ViewPagos', 'ViewPagos', 'request_quote')}
          >
            <span className="material-icons">request_quote</span>
            <span>View Pagos</span>
          </a>
          
        </nav>

        <div className="community">
          <h4>Reportes</h4>
          <a 
            href="#historial-servicios" 
            className={`menu-item ${activeMenuItem === 'Historial Servicios' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Historial Servicios', 'Historial Servicios', 'history')}
          >
            <span className="material-icons">history</span>
            <span>Historial Servicios</span>
          </a>
          <a 
            href="#historial-acciones" 
            className={`menu-item ${activeMenuItem === 'Historial Acciones' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Historial Acciones', 'Historial Acciones', 'timeline')}
          >
            <span className="material-icons">timeline</span>
            <span>Historial Acciones</span>
          </a>
          <a 
            href="#historial-lecturas" 
            className={`menu-item ${activeMenuItem === 'Historial Lecturas' ? 'active' : ''}`} 
            onClick={() => handleMenuClick('Historial Lecturas', 'Historial Lecturas', 'book')}
          >
            <span className="material-icons">book</span>
            <span>Historial Lecturas</span>
          </a>
        </div>

      </aside>
      <main className="main-content">
        <div className="top-bar">
          <h1>
            <span className="material-icons top-bar-icon">{topBarIcon}</span> 
            {topBarTitle}
          </h1>
          <div className="top-bar-buttons">
            <span className="top-bar-button material-icons" onClick={toggleSidebar}>
              menu
            </span>
            <span className="top-bar-button material-icons" onClick={toggleTheme}>
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
            <span onClick={() => handleMenuClick('Perfil', 'Perfil', 'manage_accounts')} className="top-bar-button material-icons" >
              manage_accounts
            </span>
            <span onClick={() => handleMenuClick('Configuracion', 'Configuracion', 'settings')} className="top-bar-button material-icons" >
              settings
            </span>
            <span className="top-bar-button material-icons" onClick={logout}>
              logout
            </span>
          </div>
        </div>
        <section className='middle'>
          {plataformaVisible === 'plataformaEmpleados' && <Empleados setPlataformaVisible={setPlataformaVisible}/>}
          {plataformaVisible === 'plataformaConfiguracion' && <Configuracion setPlataformaVisible={setPlataformaVisible}/>}
          {plataformaVisible === 'plataformaRoles' && <Roles setPlataformaVisible={setPlataformaVisible}/>}
          {plataformaVisible === 'plataformaClientes' && <Clientes setPlataformaVisible={setPlataformaVisible}/>}
          {plataformaVisible === 'plataformaPagos' && <Pagos setPlataformaVisible={setPlataformaVisible}/>}
          {plataformaVisible === 'plataformaUsuarios' && <Usuarios setPlataformaVisible={setPlataformaVisible}/>}
          {plataformaVisible === 'plataformaServicios' && <Servicios setPlataformaVisible={setPlataformaVisible}/>}
          {plataformaVisible === 'plataformaLotes' && <Lotes setPlataformaVisible={setPlataformaVisible}/>}
          {plataformaVisible === 'plataformaLecturas' && <Lecturas setPlataformaVisible={setPlataformaVisible}/>}
          {plataformaVisible === 'plataformaPerfil' && user?.usuario?.idempleado && (
            <Perfil idempleado={user.usuario.idempleado} setPlataformaVisible={setPlataformaVisible} />
          )}
          {plataformaVisible === 'plataformaViewPagos' && <ViewPagos setPlataformaVisible={setPlataformaVisible}/>}
          {plataformaVisible === 'plataformaInicio' && <Inicio setPlataformaVisible={setPlataformaVisible}/>}

        </section> 
      </main>
    </div>
  );
};

export default Dashboard;
