import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    obtenerTodosPlanes,
    eliminarPlan,
    obtenerPlanesPorTipoCobertura,
    obtenerPlanesPorEstado
} from '../../services/PlanService';

import { FiPlus, FiEdit2, FiTrash2, FiInfo } from 'react-icons/fi';
import { Spinner } from 'react-bootstrap';
import PlanComponent from '../forms/PlanComponent';

const ListaPlanesComponent = () => {
    const [planes, setPlanes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState({
        tipoCobertura: '',
        estado: ''
    });

    const [showModal, setShowModal] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState(null);

    useEffect(() => {
        cargarPlanes();
    }, []);

    const cargarPlanes = () => {
        setLoading(true);
        setError('');
        obtenerTodosPlanes()
            .then(response => {
                setPlanes(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error cargando planes:', error);
                setError('Error al cargar los planes. Intente nuevamente.');
                setLoading(false);
            });
    };

    const handleEliminar = (id) => {
        if (window.confirm('¿Está seguro de eliminar este plan?')) {
            setLoading(true);
            eliminarPlan(id)
                .then(() => {
                    cargarPlanes();
                })
                .catch(error => {
                    console.error('Error eliminando plan:', error);
                    setError('No se pudo eliminar el plan. Puede que tenga pólizas asociadas.');
                    setLoading(false);
                });
        }
    };

    const handleFiltrarPorCobertura = (e) => {
        const tipoCobertura = e.target.value;
        setFiltro({ ...filtro, tipoCobertura, estado: '' });

        setLoading(true);
        setError('');
        const promise = tipoCobertura
            ? obtenerPlanesPorTipoCobertura(tipoCobertura)
            : obtenerTodosPlanes();

        promise
            .then(response => {
                setPlanes(response.data);
            })
            .catch(error => {
                console.error('Error filtrando planes por cobertura:', error);
                setError('Error al filtrar planes por cobertura.');
                setPlanes([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleFiltrarPorEstado = (e) => {
        const estado = e.target.value;
        setFiltro({ ...filtro, estado, tipoCobertura: '' });

        setLoading(true);
        setError('');
        const promise = estado
            ? obtenerPlanesPorEstado(estado)
            : obtenerTodosPlanes();

        promise
            .then(response => {
                setPlanes(response.data);
            })
            .catch(error => {
                console.error('Error filtrando planes por estado:', error);
                setError('Error al filtrar planes por estado.');
                setPlanes([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };


    const formatearPrecio = (precio) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 2,
        }).format(precio);
    };

    const handleOpenAddModal = () => {
        setEditingPlanId(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (id) => {
        setEditingPlanId(id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPlanId(null); // Limpiar ID al cerrar
    };

    const handleSaveSuccess = () => {
        handleCloseModal();
        cargarPlanes(); // Recargar después de guardar
    };


    return (
        <div className="page-content-container">
            <div className="page-header mb-4">
                <h2 className="page-title mb-0">Planes de Seguro</h2>

                <button onClick={handleOpenAddModal} className="btn btn-light-primary ms-auto">
                    <FiPlus size={16} className="me-1" />
                    Agregar Plan
                </button>
            </div>

            <div className="controls-bar d-flex align-items-center mb-3">
                <select
                    id="filtroCobertura"
                    className="form-select form-select-sm me-2 control-filter"
                    value={filtro.tipoCobertura}
                    onChange={handleFiltrarPorCobertura}
                >
                    <option value="">Tipo: Todos</option>
                    <option value="Vida">Vida</option>
                    <option value="Salud">Salud</option>
                    <option value="Patrimonial">Patrimonial</option>
                </select>


                <select
                    id="filtroEstado"
                    className="form-select form-select-sm control-filter"
                    value={filtro.estado}
                    onChange={handleFiltrarPorEstado}
                >
                    <option value="">Estado: Todos</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                </select>
            </div>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError('')}></button>
                </div>
            )}

            <div className="table-container">

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <Spinner animation="border" variant="secondary" size="sm" /> {/* Spinner más sutil */}
                        <span className="ms-2 text-muted">Cargando...</span>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table app-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>

                                    <th className="text-center">Tipo Cobertura</th>
                                    <th className="text-end">Precio Base</th>
                                    <th className="text-center">Estado</th>
                                    <th className="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {planes.length > 0 ? (
                                    planes.map(plan => (
                                        <tr key={plan.id}>
                                            <td className="text-muted">#{plan.id}</td>
                                            <td>{plan.nombre}</td>
                                            <td className="text-muted description-cell">{plan.descripcion}</td>

                                            <td className="text-center">{plan.tipoCobertura}</td>
                                            <td className="text-end">{formatearPrecio(plan.precioBase)}</td>
                                            <td className="text-center">
                                                <span className={`status-indicator status-${plan.estado === 'activo' ? 'success' : 'inactive'}`}>
                                                    <span className="status-dot"></span>
                                                    {plan.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="action-buttons">
                                                    <button
                                                        onClick={() => handleOpenEditModal(plan.id)}
                                                        className="btn btn-icon btn-ghost"
                                                        title="Editar"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-icon btn-ghost text-danger"
                                                        onClick={() => handleEliminar(plan.id)}
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
                                        <td colSpan="7" className="text-center py-4 text-muted no-data-cell">
                                            <FiInfo size={18} className="me-2 align-middle" />
                                            No se encontraron planes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!loading && planes.length > 0 && (
                <div className="page-footer text-muted mt-3">
                    Total: {planes.length} planes
                </div>
            )}


            {showModal && (
                <>
                    <div className="modal-backdrop fade show" onClick={handleCloseModal}></div>
                    <div
                        className="modal fade show" tabIndex="-1" style={{ display: 'block' }}
                        role="dialog" aria-labelledby="planModalLabel" aria-modal="true"
                    >
                        
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            {/* Puedes añadir clases de estilo personalizadas al modal si quieres */}
                            {/* <div className="modal-content app-modal-content"> */}
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="clienteModalLabel">
                                        {editingPlanId ? 'Modificar Plan' : 'Agregar Plan'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    {/* El componente ClienteComponent se renderiza aquí */}
                                    <PlanComponent
                                        planId={editingPlanId}
                                        onSaveSuccess={handleSaveSuccess}
                                        onCancel={handleCloseModal}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
export default ListaPlanesComponent;