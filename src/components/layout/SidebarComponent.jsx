import React from 'react'; 
import { Link, useLocation } from 'react-router-dom';
import {
    FiHome, FiMenu, FiUsers, FiClipboard, FiFileText,
    FiCreditCard, FiAlertTriangle, FiChevronLeft, FiSearch
} from 'react-icons/fi';
import '../../styles/DashboardStyles.css';


const SidebarComponent = ({ collapsed, onToggle }) => {

    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <div className={`sidebar-wrapper ${collapsed ? 'collapsed' : ''}`}>
            <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo-link">
                        {/*<FiHome size={24} className="logo-icon" />*/}
                        {!collapsed && <span className="logo-text">Aseguradora</span>}
                    </Link>

                    <button
                        className="btn btn-icon sidebar-toggle-btn"
                        onClick={onToggle}
                        title={collapsed ? 'Expandir' : 'Colapsar'}
                    >
                        <FiChevronLeft size={18} className={`chevron-icon ${collapsed ? 'collapsed' : ''}`}/>
                    </button>
                </div>


                <nav className="sidebar-nav">
                    <ul className="sidebar-menu">
                        <li className="menu-item">
                            
                            <Link to="/clientes" className={`sidebar-link ${isActive('/clientes')}`}>
                                <FiUsers size={18} className="link-icon" />
                                {!collapsed && <span className="link-text">Clientes</span>}
                            </Link>
                        </li>
                        
                         <li className="menu-item">
                            <Link to="/planes" className={`sidebar-link ${isActive('/planes')}`}>
                                <FiClipboard size={18} className="link-icon" />
                                {!collapsed && <span className="link-text">Planes</span>}
                            </Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/polizas" className={`sidebar-link ${isActive('/polizas')}`}>
                                <FiFileText size={18} className="link-icon" />
                                {!collapsed && <span className="link-text">Pólizas</span>}
                            </Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/pagos" className={`sidebar-link ${isActive('/pagos')}`}>
                                <FiCreditCard size={18} className="link-icon" />
                                {!collapsed && <span className="link-text">Pagos</span>}
                            </Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/reclamaciones" className={`sidebar-link ${isActive('/reclamaciones')}`}>
                                <FiAlertTriangle size={18} className="link-icon" />
                                {!collapsed && <span className="link-text">Reclamaciones</span>}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
        </div>
    );
};

export default SidebarComponent;