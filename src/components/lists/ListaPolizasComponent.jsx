import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    obtenerTodasPolizas,
    eliminarPoliza,
    obtenerPolizasPorClienteId,
    obtenerPolizasPorPlanId,
    obtenerPolizasPorEstado
} from '../../services/PolizaService';

// Import the PolizaComponent form that will be used in the modal
import PolizaComponent from '../forms/PolizaComponent';

import {
    FiPlus, FiEdit2, FiTrash2, FiInfo, FiEye
} from 'react-icons/fi';
import { Spinner } from 'react-bootstrap';

const ListaPolizasComponent = () => {
    const [polizas, setPolizas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState({
        clienteId: '',
        planId: '',
        estado: '',
    });

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingPolizaId, setEditingPolizaId] = useState(null);

    useEffect(() => {
        cargarPolizas();
    }, []);

    const cargarPolizas = () => {
        setLoading(true);
        setError('');
        obtenerTodasPolizas()
            .then(response => setPolizas(response.data))
            .catch(error => {
                console.error('Error cargando pólizas:', error);
                setError('Error al cargar las pólizas. Intente nuevamente.');
            })
            .finally(() => setLoading(false));
    };

    const handleEliminar = (id) => {
        if (window.confirm('¿Está seguro de eliminar esta póliza?')) {
            eliminarPoliza(id)
                .then(() => cargarPolizas())
                .catch(error => {
                    console.error('Error eliminando póliza:', error);
                    setError('No se pudo eliminar la póliza.');
                });
        }
    };

    const handleFiltrarPorClienteId = (e) => {
        const clienteId = e.target.value;
        setFiltro({ clienteId: clienteId, planId: '', estado: '' });
        setLoading(true);
        setError('');
        if (clienteId) {
            obtenerPolizasPorClienteId(clienteId)
                .then(response => setPolizas(response.data))
                .catch(error => {
                    console.error('Error filtrando pólizas por cliente:', error);
                    //setError('Error al filtrar pólizas por cliente.');
                    setPolizas([]);
                })
                .finally(() => setLoading(false));
        } else {
            cargarPolizas();
        }
    };

    const handleFiltrarPorPlanId = (e) => {
        const planId = e.target.value;
        setFiltro({ clienteId: '', planId: planId, estado: '' });
        setLoading(true);
        setError('');
        if (planId) {
            obtenerPolizasPorPlanId(planId)
                .then(response => setPolizas(response.data))
                .catch(error => {
                    console.error('Error filtrando pólizas por plan:', error);
                    setError('Error al filtrar pólizas por plan.');
                    setPolizas([]);
                })
                .finally(() => setLoading(false));
        } else {
            cargarPolizas();
        }
    };

    const handleFiltrarPorEstado = (e) => {
        const estado = e.target.value;
        setFiltro({ clienteId: '', planId: '', estado: estado });
        setLoading(true);
        setError('');
        if (estado) {
            obtenerPolizasPorEstado(estado)
                .then(response => setPolizas(response.data))
                .catch(error => {
                    console.error('Error filtrando pólizas por estado:', error);
                    setError('Error al filtrar pólizas por estado.');
                    setPolizas([]);
                })
                .finally(() => setLoading(false));
        } else {
            cargarPolizas();
        }
    };

    const formatearMonto = (monto) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(monto);
    };

    // Modal functions
    const handleOpenAddModal = () => {
        setEditingPolizaId(null);
        setShowModal(true);
    };

    const handleOpenEditModal = (id) => {
        setEditingPolizaId(id);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPolizaId(null); // Clear ID when closing
    };

    const handleSaveSuccess = () => {
        handleCloseModal();
        cargarPolizas(); // Reload after saving
    };

    return (
        <div className="page-content-container">
            <div className="page-header mb-4">
                <h2 className="page-title mb-0">Pólizas</h2>
                <button onClick={handleOpenAddModal} className="btn btn-light-primary ms-auto">
                    <FiPlus size={16} className="me-1" />
                    Agregar Póliza
                </button>
            </div>

            <div className="controls-bar d-flex align-items-center mb-3 gap-2">
                 <input
                    type="number"
                    className="form-control form-control-sm control-filter"
                    placeholder="Buscar por ID Cliente"
                    value={filtro.clienteId}
                    onChange={handleFiltrarPorClienteId}
                    aria-label="Filtrar por ID de Cliente"
                    style={{ maxWidth: '180px' }}
                    min="1"
                 />
                 <input
                    type="number"
                    className="form-control form-control-sm control-filter"
                    placeholder="Buscar por ID Plan"
                    value={filtro.planId}
                    onChange={handleFiltrarPorPlanId}
                    aria-label="Filtrar por ID de Plan"
                    style={{ maxWidth: '180px' }}
                    min="1"
                 />
                <select
                    className="form-select form-select-sm control-filter"
                    value={filtro.estado}
                    onChange={handleFiltrarPorEstado}
                    aria-label="Filtrar por estado"
                    style={{ maxWidth: '180px' }}
                >
                    <option value="">Estado: Todos</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                </select>
                 <div className="flex-grow-1"></div>
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
                        <Spinner animation="border" variant="secondary" size="sm"/>
                        <span className="ms-2 text-muted">Cargando...</span>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table app-table">
                            <thead>
                                <tr>
                                    <th className="py-2">ID Póliza</th>
                                    <th className="py-2">ID Cliente</th>
                                    <th className="py-2">Nombre Cliente</th>
                                    <th className="py-2">Plan</th>
                                    <th className="py-2">Fecha Inicio</th>
                                    <th className="py-2">Fecha Fin</th>

                                    {/*<th>ID Plan</th>*/}

                                    <th className="py-2 text-end">Monto Aseg.</th>
                                    <th className="py-2 text-center">Estado</th>
                                    <th className="py-2 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {polizas.length > 0 ? (
                                    polizas.map(poliza => (
                                        
                                        <tr key={poliza.id}>
                                            <td className="text-muted">#{poliza.id}</td>
                                            <td className="text-muted">#{poliza.clienteId}</td>
                                            <td>{poliza.nombreCliente}</td>
                                            <td>{poliza.nombrePlan}</td>
                                            <td>{poliza.fechaInicio}</td>
                                            <td>{poliza.fechaVencimiento}</td>

                                            {/*<td className="text-muted">#{poliza.planId}</td>*/}
                                            

                                            <td className="text-end">{formatearMonto(poliza.montoAsegurado)}</td>
                                            <td className="py-2 text-center">
                                                <span className={`status-indicator status-${poliza.estado === 'activo' ? 'success' : 'inactive'}`}>
                                                    <span className="status-dot"></span>
                                                    {poliza.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <div className="action-buttons">
                                                    <Link
                                                        to={`/polizaDetalle/${poliza.id}`}
                                                        className="btn btn-icon btn-ghost text-info"
                                                        title="Ver Detalle"
                                                    >
                                                        <FiEye size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleOpenEditModal(poliza.id)}
                                                        className="btn btn-icon btn-ghost"
                                                        title="Editar"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="btn btn-icon btn-ghost text-danger"
                                                        onClick={() => handleEliminar(poliza.id)}
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
                                        <td colSpan="9" className="text-center py-4 text-muted no-data-cell">
                                            <FiInfo size={18} className="me-2 align-middle" />
                                            No se encontraron pólizas 
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                           
                        </table>
                    </div>
                )}
            </div>

             {!loading && polizas.length > 0 && (
                <div className="page-footer text-muted mt-3">
                    Total: {polizas.length} pólizas
                </div>
             )}

            {/* Modal Component */}
            {showModal && (
                <>
                    <div className="modal-backdrop fade show" onClick={handleCloseModal}></div>
                    <div
                        className="modal fade show" tabIndex="-1" style={{ display: 'block' }}
                        role="dialog" aria-labelledby="polizaModalLabel" aria-modal="true"
                    >
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="polizaModalLabel">
                                        {editingPolizaId ? 'Modificar Póliza' : 'Agregar Póliza'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <PolizaComponent
                                        polizaId={editingPolizaId}
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

export default ListaPolizasComponent;