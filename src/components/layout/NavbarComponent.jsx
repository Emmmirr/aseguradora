import React from 'react';
import { Link } from 'react-router-dom';

const NavbarComponent = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Aseguradora</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/clientes">Clientes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/planes">Planes</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/polizas">Pólizas</Link>
            </li>
            {/* Nuevos enlaces para pagos y reclamaciones */}
            <li className="nav-item">
              <Link className="nav-link" to="/pagos">Pagos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reclamaciones">Reclamaciones</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;