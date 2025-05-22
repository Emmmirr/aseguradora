import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ListaClientesComponent from './components/lists/ListaClientesComponent';
import ClienteComponent from './components/forms/ClienteComponent';
import ListaPlanesComponent from './components/lists/ListaPlanesComponent';
import PlanComponent from './components/forms/PlanComponent';
import ListaPolizasComponent from './components/lists/ListaPolizasComponent';
import PolizaComponent from './components/forms/PolizaComponent';
import PolizasClienteComponent from './components/forms/PolizasClienteComponent';
import ListaPagosComponent from './components/lists/ListaPagosComponent';
import PagoComponent from './components/forms/PagoComponent';
import ListaReclamacionesComponent from './components/lists/ListaReclamacionesComponent';
import ReclamacionComponent from './components/forms/ReclamacionComponent';
import DetallePolizaComponent from './components/forms/DetallePolizaComponent';
import SidebarComponent from './components/layout/SidebarComponent';
import React, { useState } from 'react';
import './App.css';
import './styles/DashboardStyles.css';

function App() {

    // --- 1. Manejar el estado 'collapsed' aquí ---
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Puedes empezar colapsado (true) o expandido (false)

    // --- 2. Función para cambiar el estado ---
    const toggleSidebar = () => {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    };
  return (
    <BrowserRouter>
      <div className="d-flex">
        {/* Sidebar */}
        <SidebarComponent collapsed={isSidebarCollapsed}
          onToggle={toggleSidebar}/>
        
        {/* Contenido principal */}
        <div className={`main-content flex-grow-1 ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="container-fluid p-4">
            <Routes>
              <Route path="/" element={<ListaClientesComponent />} />
              <Route path="/clientes" element={<ListaClientesComponent />} />
              <Route path="/clienteC" element={<ClienteComponent />} />
              <Route path="/clienteC/:id" element={<ClienteComponent />} />
              <Route path="/cliente/:id/polizas" element={<PolizasClienteComponent />} />
              <Route path="/planes" element={<ListaPlanesComponent />} />
              <Route path="/planC" element={<PlanComponent />} />
              <Route path="/planC/:id" element={<PlanComponent />} />
              <Route path="/polizas" element={<ListaPolizasComponent />} />
              <Route path="/polizaC" element={<PolizaComponent />} />
              <Route path="/polizaC/:id" element={<PolizaComponent />} />
              <Route path="/polizaDetalle/:id" element={<DetallePolizaComponent />} />
              
              {/* Rutas para pagos */}
              <Route path="/pagos" element={<ListaPagosComponent />} />
              <Route path="/pagoC" element={<PagoComponent />} />
              <Route path="/pagoC/:id" element={<PagoComponent />} />
              
              {/* Rutas para reclamaciones */}
              <Route path="/reclamaciones" element={<ListaReclamacionesComponent />} />
              <Route path="/reclamacionC" element={<ReclamacionComponent />} />
              <Route path="/reclamacionC/:id" element={<ReclamacionComponent />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;