import React, { useState, useEffect } from "react";
// Ya no necesitamos Link para ver póliza
// import { Link } from 'react-router-dom';
import {
  obtenerTodosPagos,
  eliminarPago,
  obtenerPagosPorPoliza
} from "../../services/PagoService";

// Import the form component for the modal
import PagoComponent from "../forms/PagoComponent"; // Adjust path if needed

import {
    FiPlus, FiEdit2, FiTrash2, FiInfo // Ya no se necesita FiFileText aquí
} from 'react-icons/fi';
import { Spinner } from 'react-bootstrap';

const ListaPagosComponent = () => {

    // Estados y Lógica (sin cambios respecto a tu última versión,
    // excepto la eliminación de la navegación a detalle de póliza)
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState({ polizaId: '' });
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPagoId, setEditingPagoId] = useState(null);

    useEffect(() => {
        aplicarFiltrosActuales();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const aplicarFiltrosActuales = () => {
        setLoading(true);
        setError('');
        let promise;
        if (filtro.polizaId) {
            promise = obtenerPagosPorPoliza(filtro.polizaId);
        } else {
            promise = obtenerTodosPagos();
        }
        promise
            .then(response => setPagos(response.data || []))
            .catch(error => {
                console.error('Error cargando/filtrando pagos:', error);
                setError('Error al cargar los pagos. Intente nuevamente.');
                setPagos([]);
            })
            .finally(() => setLoading(false));
    };

    const handleEliminar = (id) => {
        if (window.confirm('¿Está seguro de eliminar este pago?')) {
            setLoading(true);
            eliminarPago(id)
                .then(() => aplicarFiltrosActuales())
                .catch(error => {
                    console.error('Error eliminando pago:', error);
                    setError('No se pudo eliminar el pago.');
                    setLoading(false);
                });
        }
    };

    const handleFiltrarPorPolizaId = (e) => {
        const valor = e.target.value;
        setFiltro({ polizaId: valor });
        aplicarFiltrosActualesBasedOnNewValue(valor); // Llama a la función separada
    };

    const aplicarFiltrosActualesBasedOnNewValue = (polizaIdValue) => {
        setLoading(true);
        setError('');
        const promise = polizaIdValue ? obtenerPagosPorPoliza(polizaIdValue) : obtenerTodosPagos();
        promise
            .then(response => setPagos(response.data || []))
            .catch(error => {
                console.error('Error filtrando por ID de póliza:', error);
                setError('Error al filtrar por ID de póliza o no se encontraron pagos.');
                setPagos([]);
            })
            .finally(() => setLoading(false));
    }

    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        try {
            return new Date(fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' });
        } catch (e) { return 'Fecha inválida'; }
    };

    const formatearMonto = (monto) => {
        if (monto === null || typeof monto === 'undefined' || isNaN(monto)) return '$0.00';
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);
    };

    const handleOpenAddModal = () => { setEditingPagoId(null); setShowModal(true); };
    const handleOpenEditModal = (id) => { setEditingPagoId(id); setShowModal(true); };
    const handleCloseModal = () => { setShowModal(false); setEditingPagoId(null); };
    const handleSaveSuccess = () => { handleCloseModal(); aplicarFiltrosActuales(); };
    const calcularTotalPagos = () => pagos.reduce((total, pago) => total + (pago.monto || 0), 0);


    // --- JSX ---
    return (
        <div className="page-content-container">
            {/* Cabecera (sin cambios) */}
            <div className="page-header mb-4">
                <h2 className="page-title mb-0">Lista de Pagos</h2>
                <button onClick={handleOpenAddModal} className="btn btn-light-primary ms-auto">
                    <FiPlus size={16} className="me-1" /> Registrar Pago
                </button>
            </div>

            {/* Filters (sin cambios) */}
            <div className="controls-bar d-flex align-items-center mb-3 gap-2">
                <input type="number" className="form-control form-control-sm control-filter"
                 placeholder="Filtrar por ID Póliza" value={filtro.polizaId} onChange={handleFiltrarPorPolizaId} 
                 aria-label="Filtrar por ID de póliza" style={{ maxWidth: '180px' }} min="1"/>
                <div className="flex-grow-1"></div>
            </div>

            {/* Error Alert (sin cambios) */}
            {error && (<div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">{error}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" 
                onClick={() => setError('')}></button></div>)}

            {/* Table Container */}
            <div className="table-container">
                {loading ? (
                     <div className="d-flex justify-content-center align-items-center py-5">
                        <Spinner animation="border" variant="secondary" size="sm" />
                        <span className="ms-2 text-muted">Cargando...</span></div>
                ) : (
                    <div className="table-responsive">
                        <table className="table app-table">
                            <thead>
                                <tr>
                                    <th className="py-2 ">ID</th>

                                    <th className="py-2">ID Póliza</th>
                                    <th className="py-2">Cliente</th>
                                    <th className="py-2">Plan</th>
                                    <th className="py-2">Fecha Pago</th>
                                    <th className="py-2 ">Método</th>
                                    <th className="py-2 text-end">Monto</th>
                                    <th className="py-2 text-center">Acciones</th>{/* Cabecera sigue igual */}
                                </tr>
                            </thead>
                            <tbody>
                                {pagos.length > 0 ? (
                                    pagos.map(pago => (
                                        <tr className="align-middle" key={pago.id}>
                                            <td className="py-2 text-muted">#{pago.id}</td>

                                            <td className="text-muted">#{pago.polizaId}</td>
                                            <td>{pago.nombreCliente || <span className="text-muted">N/A</span>}</td>
                                            <td>{pago.nombrePlan || <span className="text-muted">N/A</span>}</td>
                                            <td>{formatearFecha(pago.fechaPago)}</td>
                                            <td>{pago.metodoPago}</td>
                                            <td className="text-end">{formatearMonto(pago.monto)}</td>
                                            <td className="text-center">
                                                {/* --- SE ELIMINA EL BOTÓN/LINK DE VER PÓLIZA --- */}
                                                <div className="action-buttons d-flex justify-content-center gap-1">
                                                    {/* Botón Editar (Modal) */}
                                                    <button onClick={() => handleOpenEditModal(pago.id)} className="btn btn-icon btn-ghost" title="Editar">
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    {/* Botón Eliminar */}
                                                    <button
                                                        className="btn btn-icon btn-ghost text-danger"
                                                        onClick={() => handleEliminar(pago.id)}
                                                        title="Eliminar"
                                                        disabled={loading}
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                    {/* YA NO HAY BOTÓN PARA VER PÓLIZA AQUÍ */}
                                                </div>
                                                {/* --- FIN --- */}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        {/* ColSpan sigue siendo 8 */}
                                        <td colSpan="8" className="text-center py-4 no-data-cell text-muted">
                                            <FiInfo size={18} className="me-2 align-middle" />
                                            No se encontraron pagos {filtro.polizaId ? 'para la póliza especificada' : ''}.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer (sin cambios) */}
            {!loading && (<div className="page-footer d-flex justify-content-between text-muted mt-3"><span>Total Pagos: {pagos.length}</span>{pagos.length > 0 && (<span className="fw-bold">Suma Total: {formatearMonto(calcularTotalPagos())}</span>)}</div>)}

            {/* Modal Add/Edit Pago (sin cambios) */}
            {showModal && (<>{/* ... (código del modal de pago sin cambios) ... */}</>)}
             {showModal && (
                <>
                    <div className="modal-backdrop fade show" onClick={handleCloseModal}></div>
                    <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }} role="dialog" aria-labelledby="pagoModalLabel" aria-modal="true">
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="pagoModalLabel">{editingPagoId ? 'Modificar Pago' : 'Registrar Pago'}</h5>
                                    <button type="button" className="btn-close" onClick={handleCloseModal} aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <PagoComponent pagoId={editingPagoId} onSaveSuccess={handleSaveSuccess} onCancel={handleCloseModal} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

        </div> // Fin page-content-container
    );
};

export default ListaPagosComponent;