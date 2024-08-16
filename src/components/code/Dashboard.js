import React, { useState } from 'react';
import '../design/Dashboard.css';
import Logo from '../../assets/paseo.jpg';

const Dashboard = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('light');

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  return (
    <div className={`dashboard-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="logo">
          <img src={Logo} alt="null" className="user-avatar"></img>
          <p>Paseo Las Lomas Salamá B. V.</p>
        </div>
        <div className="user-profile">
          <div className="user-info">
            <h4>Hola Alexis Castillo</h4>
            <p>Rol: Administrador</p>
          </div>
        </div>
        <nav className="menu">
          <h4>MENU</h4>
          <a 
            href="#clientes" 
            className={`menu-item ${activeMenuItem === 'Clientes' ? 'active' : ''}`} 
            onClick={() => setActiveMenuItem('Clientes')}
          >
            <span className="material-icons">person</span>
            <span>Clientes</span>
          </a>
          <a 
            href="#empleados" 
            className={`menu-item ${activeMenuItem === 'Empleados' ? 'active' : ''}`} 
            onClick={() => setActiveMenuItem('Empleados')}
          >
            <span className="material-icons">group</span>
            <span>Empleados</span>
          </a>
          <a 
            href="#lotes" 
            className={`menu-item ${activeMenuItem === 'Lotes' ? 'active' : ''}`} 
            onClick={() => setActiveMenuItem('Lotes')}
          >
            <span className="material-icons">map</span>
            <span>Lotes</span>
          </a>
          <a 
            href="#servicios" 
            className={`menu-item ${activeMenuItem === 'Servicios' ? 'active' : ''}`} 
            onClick={() => setActiveMenuItem('Servicios')}
          >
            <span className="material-icons">build</span>
            <span>Servicios</span>
          </a>
          <a 
            href="#roles" 
            className={`menu-item ${activeMenuItem === 'Roles' ? 'active' : ''}`} 
            onClick={() => setActiveMenuItem('Roles')}
          >
            <span className="material-icons">admin_panel_settings</span>
            <span>Roles</span>
          </a>
          <a 
            href="#usuarios" 
            className={`menu-item ${activeMenuItem === 'Usuarios' ? 'active' : ''}`} 
            onClick={() => setActiveMenuItem('Usuarios')}
          >
            <span className="material-icons">account_circle</span>
            <span>Usuarios</span>
          </a>
          <a 
            href="#pagos" 
            className={`menu-item ${activeMenuItem === 'Pagos' ? 'active' : ''}`} 
            onClick={() => setActiveMenuItem('Pagos')}
          >
            <span className="material-icons">payment</span>
            <span>Pagos</span>
          </a>
        </nav>
        <div className="community">
          <h4>Reportes</h4>
          <a 
            href="#historial-servicios" 
            className={`menu-item ${activeMenuItem === 'Historial Servicios' ? 'active' : ''}`} 
            onClick={() => setActiveMenuItem('Historial Servicios')}
          >
            <span className="material-icons">history</span>
            <span>Historial Servicios</span>
          </a>
          <a 
            href="#historial-acciones" 
            className={`menu-item ${activeMenuItem === 'Historial Acciones' ? 'active' : ''}`} 
            onClick={() => setActiveMenuItem('Historial Acciones')}
          >
            <span className="material-icons">timeline</span>
            <span>Historial Acciones</span>
          </a>
          <a 
            href="#historial-lecturas" 
            className={`menu-item ${activeMenuItem === 'Historial Lecturas' ? 'active' : ''}`} 
            onClick={() => setActiveMenuItem('Historial Lecturas')}
          >
            <span className="material-icons">book</span>
            <span>Historial Lecturas</span>
          </a>
        </div>
      </aside>
      <main className="main-content">
        <div className="top-bar">
          <h1>Dashboard</h1>
          <div className="top-bar-buttons">
            <span className="top-bar-button material-icons" onClick={toggleSidebar}>
              menu
            </span>
            <span className="top-bar-button material-icons" onClick={toggleTheme}>
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
            <span className="top-bar-button material-icons">
              settings
            </span>
            <span className="top-bar-button material-icons">
              logout
            </span>
          </div>
        </div>
        <div className="meal-list">
          {/* Contenido del dashboard */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
