import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    obtenerTodosClientes,
    eliminarCliente,
    actualizarEstadoCliente,
    buscarClientes,
    obtenerClientesPorEstado
} from '../../services/ClienteService';
// Importa el componente del formulario que se usará en el modal
import ClienteComponent from '../forms/ClienteComponent'; // Ajusta la ruta si es necesario

// --- Importa los iconos Feather ---
import {
    FiPlus, FiEdit2, FiTrash2, FiInfo, FiSearch, FiToggleLeft, FiToggleRight, FiFileText, FiEye // Añade iconos necesarios
} from 'react-icons/fi';
// --- Importa Spinner de react-bootstrap ---
import { Spinner } from 'react-bootstrap';

const ListaClientesComponent = () => {
    const navigate = useNavigate();
    // Estados funcionales (sin cambios)
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState('');
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState({ estado: '' });
    // Estados del modal (sin cambios)
    const [showModal, setShowModal] = useState(false);
    const [editingClientId, setEditingClientId] = useState(null);

    useEffect(() => {
        cargarClientes();
    }, []);

    // --- Funciones de lógica (sin cambios) ---
    const cargarClientes = () => {
        setLoading(true);
        setError('');
        obtenerTodosClientes()
            .then(response => setClientes(response.data))
            .catch(error => {
                console.error('Error cargando clientes:', error);
                setError('Error al cargar los clientes. Intente nuevamente.');
            })
            .finally(() => setLoading(false));
    };

    const handleEliminar = (id) => {
        if (window.confirm('¿Está seguro de eliminar este cliente?')) {
            eliminarCliente(id)
                .then(cargarClientes)
                .catch(error => {
                    console.error('Error eliminando cliente:', error);
                    setError('No se pudo eliminar el cliente. Puede que tenga pólizas asociadas.');
                });
        }
    };

    const handleCambiarEstado = (id, estadoActual) => {
        const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
        actualizarEstadoCliente(id, nuevoEstado)
            .then(cargarClientes)
            .catch(error => {
                console.error('Error cambiando estado del cliente:', error);
                setError('Error al cambiar el estado del cliente.');
            });
    };

    const handleBuscar = (e) => {
        e.preventDefault(); // Prevenir recarga si está en form
        setLoading(true);
        setError('');
        const promise = busqueda.trim() ? buscarClientes(busqueda) : obtenerTodosClientes();
        promise
            .then(response => setClientes(response.data))
            .catch(error => {
                console.error('Error buscando/cargando clientes:', error);
                setError('Error al realizar la búsqueda.');
            })
            .finally(() => setLoading(false));
    };

    const handleChangeBusqueda = (e) => {
        setBusqueda(e.target.value);
        // Opcional: buscar en tiempo real o solo al borrar/presionar enter
        if (e.target.value === '') {
            cargarClientes(); // Cargar todos si el campo está vacío
        }
    };

    const handleFiltrarPorEstado = (e) => {
        const estado = e.target.value;
        setFiltro({ estado }); // Solo necesitamos el estado aquí

        setLoading(true);
        setError('');
        const promise = estado ? obtenerClientesPorEstado(estado) : obtenerTodosClientes();
        promise
            .then(response => setClientes(response.data))
            .catch(error => {
                console.error('Error filtrando clientes por estado:', error);
                setError('Error al filtrar clientes.');
            })
            .finally(() => setLoading(false));
    };

    const verPolizasCliente = (id) => {
        navigate(`/cliente/${id}/polizas`);
    };

    // --- Funciones del Modal (sin cambios en la lógica, solo nombres si quieres) ---
    const handleOpenAddModal = () => {
        setEditingClientId(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (id) => {
        setEditingClientId(id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingClientId(null); // Limpiar ID al cerrar
    };

    const handleSaveSuccess = () => {
        handleCloseModal();
        cargarClientes(); // Recargar después de guardar
    };

    // --- JSX con el NUEVO DISEÑO ---
    return (
        <div className="page-content-container"> {/* Contenedor principal con estilo */}

            {/* Cabecera de la página */}
            <div className="page-header mb-4">
                <h2 className="page-title mb-0">Clientes</h2>
                {/* Botón Agregar con nuevo estilo, pero misma función */}
                <button onClick={handleOpenAddModal} className="btn btn-light-primary ms-auto">
                    <FiPlus size={16} className="me-1" />
                    Agregar Cliente
                </button>
            </div>

            {/* Barra de Controles (Búsqueda y Filtro) */}
            <div className="controls-bar d-flex align-items-center mb-3 gap-2"> {/* Usa gap para espacio */}
                {/* Formulario de Búsqueda */}
                <form onSubmit={handleBuscar} className="search-form d-flex flex-grow-1"> {/* Ocupa espacio */}
                    {/* Podrías añadir un icono dentro o al lado */}
                    {/* <FiSearch className="search-icon" /> */}
                    <input
                        type="search" // Tipo search para icono 'x' opcional del navegador
                        className="form-control form-control-sm control-filter flex-grow-1" // Clase de estilo + tamaño + ocupa espacio
                        placeholder="Buscar por nombre, apellido, CURP..."
                        value={busqueda}
                        onChange={handleChangeBusqueda}
                    />
                    {/* Opcional: botón explícito de búsqueda */}
                    {/* <button type="submit" className="btn btn-sm btn-secondary ms-1">Buscar</button> */}
                </form>

                {/* Filtro de Estado */}
                <select
                    className="form-select form-select-sm control-filter" // Clase de estilo + tamaño
                    value={filtro.estado}
                    onChange={handleFiltrarPorEstado}
                    aria-label="Filtrar por estado"
                    style={{ maxWidth: '180px' }} // Limitar ancho del select
                >
                    <option value="">Estado: Todos</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                </select>
            </div>

            {/* Alerta de Error (sin cambios de estilo aquí) */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Contenedor de la Tabla */}
            <div className="table-container">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                         {/* Spinner con estilo actualizado */}
                        <Spinner animation="border" variant="secondary" size="sm"/>
                        <span className="ms-2 text-muted">Cargando...</span>
                    </div>
                ) : (
                    <div className="table-responsive">
                        {/* Tabla con estilo actualizado */}
                        <table className="table app-table">
                            <thead>
                                <tr>
                                    {/* Cabeceras con estilo aplicado por CSS */}
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Apellido</th>
                                    <th>CURP</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                    <th>Estado</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientes.length > 0 ? (
                                    clientes.map(cliente => (
                                        <tr key={cliente.id}>
                                            <td className="text-muted">#{cliente.id}</td>
                                            <td>{cliente.nombre}</td>
                                            <td>{cliente.apellido}</td>
                                            <td className="text-muted">{cliente.curp}</td>
                                            <td>
                                                {/* Mantener el mailto, pero sin estilo extra */}
                                                <a href={`mailto:${cliente.email}`} className="text-body text-decoration-none">
                                                    {cliente.email}
                                                </a>
                                            </td>
                                            <td className="text-muted">{cliente.telefono}</td>
                                            <td>
                                                {/* Indicador de estado con nuevo estilo */}
                                                <span className={`status-indicator status-${cliente.estado === 'activo' ? 'success' : 'inactive'}`}>
                                                    <span className="status-dot"></span>
                                                    {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {/* Botones de acción con nuevo estilo y misma función */}
                                                <div className="action-buttons">
                                                    {/* Botón Editar (abre modal) */}
                                                    <button
                                                        onClick={() => handleOpenEditModal(cliente.id)}
                                                        className="btn btn-icon btn-ghost"
                                                        title="Editar"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    {/* Botón Eliminar */}
                                                    <button
                                                        className="btn btn-icon btn-ghost text-danger"
                                                        onClick={() => handleEliminar(cliente.id)}
                                                        title="Eliminar"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                    {/* Botón Cambiar Estado */}
                                                    <button
                                                        className={`btn btn-icon btn-ghost ${cliente.estado === 'activo' ? 'text-warning' : 'text-success'}`} // Colores para toggle
                                                        onClick={() => handleCambiarEstado(cliente.id, cliente.estado)}
                                                        title={cliente.estado === 'activo' ? 'Desactivar' : 'Activar'}
                                                    >
                                                         {/* Usar iconos Toggle */}
                                                        {cliente.estado === 'activo' ? <FiToggleLeft size={16} /> : <FiToggleRight size={16} />}
                                                    </button>
                                                     {/* Botón Ver Pólizas */}
                                                    <button
                                                        className="btn btn-icon btn-ghost"
                                                        onClick={() => verPolizasCliente(cliente.id)}
                                                        title="Ver pólizas"
                                                    >
                                                        <FiFileText size={16} /> {/* O FiEye */}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        {/* Mensaje "No encontrados" con nuevo estilo */}
                                        <td colSpan="8" className="text-center py-4 text-muted no-data-cell">
                                            <FiInfo size={18} className="me-2 align-middle" />
                                            No se encontraron clientes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

             {/* Footer con estilo actualizado */}
             {!loading && clientes.length > 0 && (
                <div className="page-footer text-muted mt-3">
                    Total: {clientes.length} clientes
                </div>
             )}

            {/* --- MODAL (SIN CAMBIOS EN SU LÓGICA O CONTENIDO INTERNO) --- */}
            {/* Mantenemos el mismo código del modal que tenías antes */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show" onClick={handleCloseModal}></div>
                    <div
                        className="modal fade show" tabIndex="-1" style={{ display: 'block' }}
                        role="dialog" aria-labelledby="clienteModalLabel" aria-modal="true"
                    >
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            {/* Puedes añadir clases de estilo personalizadas al modal si quieres */}
                            {/* <div className="modal-content app-modal-content"> */}
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="clienteModalLabel">
                                        {editingClientId ? 'Modificar Cliente' : 'Agregar Cliente'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    {/* El componente ClienteComponent se renderiza aquí */}
                                    <ClienteComponent
                                        clienteId={editingClientId}
                                        onSaveSuccess={handleSaveSuccess}
                                        onCancel={handleCloseModal}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
            {/* --- FIN DEL MODAL --- */}

        </div> // Fin page-content-container
    );
};

export default ListaClientesComponent;