import React, { useState, useEffect } from "react";
// Remueve Link si ya no se usa para navegación directa a la forma
// import { Link } from "react-router-dom"; // <-- Removido o comentado si no se usa más
import { obtenerTodasReclamaciones, eliminarReclamacion } from "../../services/ReclamacionService";

// --- Importa el componente del formulario que se usará en el modal ---
import ReclamacionComponent from '../forms/ReclamacionComponent'; // Ajusta la ruta si es necesario

// --- Importa los iconos Feather ---
import { FiPlus, FiEdit2, FiTrash2, FiInfo } from 'react-icons/fi';
// --- Importa Spinner de react-bootstrap ---
import { Spinner } from 'react-bootstrap';

const ListaReclamacionesComponent = () => {
    // Estados funcionales (iguales)
    const [reclamaciones, setReclamaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- NUEVOS ESTADOS PARA EL MODAL ---
    const [showModal, setShowModal] = useState(false);
    const [editingReclamacionId, setEditingReclamacionId] = useState(null); // ID de la reclamación a editar

    useEffect(() => {
        cargarReclamaciones();
    }, []);

    // Función de carga (igual)
    const cargarReclamaciones = () => {
        setLoading(true);
        setError('');
        obtenerTodasReclamaciones()
            .then(response => {
                setReclamaciones(response.data);
            })
            .catch(error => {
                console.error('Error cargando reclamaciones:', error);
                setError('Error al cargar las reclamaciones. Intente nuevamente.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Función de eliminar (igual)
    const handleEliminar = (id) => {
        if (window.confirm('¿Está seguro de eliminar esta reclamación?')) {
            eliminarReclamacion(id)
                .then(() => {
                    cargarReclamaciones();
                })
                .catch(error => {
                    console.error('Error eliminando reclamación:', error);
                    setError('No se pudo eliminar la reclamación.');
                });
        }
    };

    // Función de formato de fecha (igual)
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00Z');
        return date.toLocaleDateString('es-ES', { timeZone: 'UTC' });
    };

    // Lógica de estado con badges (igual)
    const getBadgeClass = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'pendiente': return 'bg-label-warning';
            case 'aprobada': return 'bg-label-success';
            case 'rechazada': return 'bg-label-danger';
            case 'en proceso': return 'bg-label-info'; // Ajusta si es necesario
            default: return 'bg-label-secondary';
        }
    };

    // --- FUNCIONES DEL MODAL (Adaptadas de ListaClientesComponent) ---
    const handleOpenAddModal = () => {
        setEditingReclamacionId(null); // Asegura que no haya ID para modo agregar
        setShowModal(true);
    };

    const handleOpenEditModal = (id) => {
        setEditingReclamacionId(id); // Establece el ID para modo editar
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingReclamacionId(null); // Limpia el ID al cerrar
    };

    const handleSaveSuccess = () => {
        handleCloseModal(); // Cierra el modal
        cargarReclamaciones(); // Recarga la lista de reclamaciones
    };
    // --- FIN FUNCIONES DEL MODAL ---


    // --- JSX con el NUEVO ESTILO VISUAL y LÓGICA DE MODAL ---
    return (
        <div className="page-content-container">
            {/* Cabecera de la página */}
            <div className="page-header mb-4">
                <h2 className="page-title mb-0">Registro de Reclamaciones</h2>
                {/* Botón Agregar AHORA abre el modal */}
                <button onClick={handleOpenAddModal} className="btn btn-light-primary ms-auto">
                    <FiPlus size={16} className="me-1" />
                    Registrar Reclamación
                </button>
            </div>

            {/* Alerta de Error (igual) */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Contenedor de la Tabla (igual) */}
            <div className="table-container">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <Spinner animation="border" variant="secondary" size="sm"/>
                        <span className="ms-2 text-muted">Cargando...</span>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table app-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>ID Póliza</th>
                                    <th>Cliente</th>
                                    <th>Descripción</th>
                                    <th>Fecha Incidente</th>
                                    <th>Estado</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reclamaciones.length > 0 ? (
                                    reclamaciones.map(reclamacion => (
                                        <tr key={reclamacion.id}>
                                            <td className="text-muted">#{reclamacion.id}</td>
                                            <td className="text-muted">#{reclamacion.polizaId}</td>
                                            <td>{reclamacion.nombreCliente || <span className="text-muted">N/A</span>}</td>
                                            <td>{reclamacion.descripcion}</td>
                                            <td>{formatDate(reclamacion.fechaIncidente)}</td>
                                            <td>
                                                <span className={`badge rounded-0 ${getBadgeClass(reclamacion.estado)}`}>
                                                    {reclamacion.estado}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="action-buttons">
                                                    {/* Botón Editar AHORA abre el modal */}
                                                    <button
                                                        onClick={() => handleOpenEditModal(reclamacion.id)} // Llama a la función para abrir modal en modo edición
                                                        className="btn btn-icon btn-ghost"
                                                        title="Editar"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    {/* Botón Eliminar (igual) */}
                                                    <button
                                                        className="btn btn-icon btn-ghost text-danger"
                                                        onClick={() => handleEliminar(reclamacion.id)}
                                                        title="Eliminar"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-4 text-muted no-data-cell"> {/* Ajusta colSpan */}
                                            <FiInfo size={18} className="me-2 align-middle" />
                                            No se encontraron reclamaciones registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

             {/* Footer (igual) */}
             {!loading && reclamaciones.length > 0 && (
                <div className="page-footer text-muted mt-3">
                    Total: {reclamaciones.length} reclamaciones
                </div>
             )}

            {/* --- INICIO DEL MODAL (Adaptado de ListaClientesComponent) --- */}
            {showModal && (
                <>
                    {/* Fondo oscuro */}
                    <div className="modal-backdrop fade show" onClick={handleCloseModal}></div>
                    {/* Contenedor del Modal */}
                    <div
                        className="modal fade show" tabIndex="-1" style={{ display: 'block' }}
                        role="dialog" aria-labelledby="reclamacionModalLabel" aria-modal="true"
                    >
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    {/* Título del modal cambia según si hay ID o no */}
                                    <h5 className="modal-title" id="reclamacionModalLabel">
                                        {editingReclamacionId ? 'Modificar Reclamación' : 'Registrar Nueva Reclamación'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    {/* Aquí renderizamos el componente de formulario */}
                                    {/* Pasamos el ID (si existe), y las funciones para guardar/cancelar */}
                                    <ReclamacionComponent
                                        reclamacionId={editingReclamacionId}
                                        onSaveSuccess={handleSaveSuccess}
                                        onCancel={handleCloseModal}
                                    />
                                </div>
                                {/* Puedes añadir un modal-footer si quieres botones fuera del form */}
                            </div>
                        </div>
                    </div>
                </>
            )}
            {/* --- FIN DEL MODAL --- */}

        </div> // Fin page-content-container
    );
};

export default ListaReclamacionesComponent;