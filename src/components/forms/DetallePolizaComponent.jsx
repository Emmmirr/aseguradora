// src/components/details/DetallePolizaComponent.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// Asegúrate que la función exista y se importe correctamente
import { obtenerPolizaPorId } from '../../services/PolizaService';
import { Spinner } from 'react-bootstrap';
// Iconos consistentes con tus otros componentes
import { FiInfo, FiArrowLeft, FiUser, FiShield, FiDollarSign, FiCalendar, FiCheckCircle, FiXCircle, FiFileText, FiEdit } from 'react-icons/fi';

const DetallePolizaComponent = () => {
    const { id } = useParams(); // Obtiene el 'id' de la URL (/polizaC/:id)
    const navigate = useNavigate();
    const [poliza, setPoliza] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Funciones de Formato (consistentes con PolizasClienteComponent) ---
    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return 'N/A';
        try {
            const fecha = new Date(fechaStr);
            if (isNaN(fecha.getTime())) return 'Fecha inválida';
            return fecha.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }); // Añadir UTC si aplica
        } catch (e) {
            return 'Error formato';
        }
    };

    // Renombrado para consistencia con PolizasClienteComponent
    const formatearMoneda = (valor) => {
        if (valor === undefined || valor === null || isNaN(valor)) return 'N/A';
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(valor);
    };

    // --- Carga de Datos ---
    useEffect(() => {
        if (!id) {
            setError("No se especificó un ID de póliza.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        console.log(`Cargando detalles para póliza ID: ${id}`);

        obtenerPolizaPorId(id)
            .then(response => {
                if (response.data) {
                    setPoliza(response.data);
                    console.log("Datos de póliza recibidos:", response.data);
                } else {
                    setError(`No se encontraron datos para la póliza con ID ${id}.`);
                    setPoliza(null);
                }
            })
            .catch(err => {
                console.error('Error cargando detalles de la póliza:', err);
                let errorMsg = 'Error al cargar los detalles de la póliza.';
                if (err.response?.status === 404) {
                    errorMsg = `No se encontró la póliza con ID ${id}.`;
                } else if (err.message) {
                    errorMsg += ` (${err.message})`;
                }
                setError(errorMsg);
                setPoliza(null);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [id]);

    // --- Renderizado Condicional ---
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="secondary" size="sm" />
                <span className="ms-2 text-muted">Cargando detalles...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-content-container">
                 <div className="alert alert-danger d-flex align-items-center" role="alert">
                     <FiInfo size={20} className="me-2"/>
                     <div>{error}</div>
                 </div>
                 <button onClick={() => navigate(-1)} className="btn btn-light-secondary mt-3"> {/* Estilo consistente */}
                     <FiArrowLeft className="me-1" /> Volver
                 </button>
            </div>
        );
    }

    if (!poliza) {
         return (
             <div className="page-content-container">
                 <div className="alert alert-warning d-flex align-items-center" role="alert">
                     <FiInfo size={20} className="me-2"/>
                     <div>No se encontró información para mostrar.</div>
                 </div>
                  <button onClick={() => navigate(-1)} className="btn btn-light-secondary mt-3">
                     <FiArrowLeft className="me-1" /> Volver
                 </button>
             </div>
         );
    }

    // --- Renderizado Principal ---
    return (
        <div className="page-content-container">

            {/* Cabecera */}
            <div className="page-header mb-4 d-flex justify-content-between align-items-center">
                <h2 className="page-title mb-0">
                    <FiFileText size={20} className="me-2 align-middle" /> {/* Icono Póliza */}
                    Detalles de la Póliza #{poliza.id}
                </h2>
                 <div> {/* Contenedor para botones */}
                    {/* Botón para Editar (lleva al formulario) */}
                    <Link to={`/polizaC-editar/${poliza.id}`} className="btn btn-light-primary me-2">
                         <FiEdit size={16} className="me-1" /> Editar
                    </Link>
                    <button onClick={() => navigate(-1)} className="btn btn-light-secondary">
                        <FiArrowLeft className="me-1" /> Volver
                    </button>
                 </div>
            </div>

            {/* Sección de Información Principal de la Póliza */}
            <div className="info-section mb-4 p-3 border rounded bg-light">
                <h4 className="mb-3 section-title">Información de la Póliza</h4>
                <div className="row g-3"> {/* Usamos g-3 como en el form */}
                    <div className="col-md-6">
                        <p className="mb-2">
                            <FiShield className="me-2 text-primary" />
                            <strong>Número Póliza:</strong> {poliza.numeroPoliza || <span className="text-muted">N/A</span>}
                        </p>
                        <p className="mb-2">
                            <FiDollarSign className="me-2 text-success" />
                            <strong>Monto Asegurado:</strong> {formatearMoneda(poliza.montoAsegurado)}
                        </p>
                        <p className="mb-2">
                            <strong>Estado:</strong>
                            <span className={`status-indicator ms-2 status-${poliza.estado === 'activo' || poliza.estado === 'activa' ? 'success' : 'inactive'}`}>
                                <span className="status-dot"></span>
                                {poliza.estado ? poliza.estado.charAt(0).toUpperCase() + poliza.estado.slice(1) : 'N/A'}
                            </span>
                        </p>
                    </div>
                    <div className="col-md-6">
                        <p className="mb-2">
                            <FiCalendar className="me-2 text-info" />
                            <strong>Fecha Inicio:</strong> {formatearFecha(poliza.fechaInicio)}
                        </p>
                        <p className="mb-2">
                            <FiCalendar className="me-2 text-warning" />
                            <strong>Fecha Vencimiento:</strong> {formatearFecha(poliza.fechaVencimiento)}
                        </p>
                        {/* Añadir más campos si existen en 'poliza' */}
                    </div>
                </div>
            </div>

            {/* Sección Cliente Asociado */}
            {poliza.cliente ? ( // Verifica si el objeto cliente existe
                <div className="info-section mb-4 p-3 border rounded">
                    <h5 className="mb-3 section-title"><FiUser className="me-2"/> Cliente Asociado</h5>
                    <p className="mb-1">
                        <strong>Nombre:</strong> {poliza.cliente.nombre || ''} {poliza.cliente.apellido || ''}
                    </p>
                    <p className="mb-1 text-muted">
                        <strong>ID Cliente:</strong> {poliza.cliente.id || 'N/A'}
                    </p>
                    {/* Enlace al detalle/edición del cliente (usa la ruta del form /clienteC/:id) */}
                    {poliza.cliente.id && (
                        <Link to={`/clienteC/${poliza.cliente.id}`} className="btn btn-sm btn-outline-primary mt-2">
                            Ver/Editar Cliente
                        </Link>
                    )}
                </div>
            ) : (
                 <div className="alert alert-secondary small">No se encontró información del cliente asociado.</div>
            )}

            {/* Sección Plan Asociado */}
            {poliza.plan ? ( // Verifica si el objeto plan existe
                <div className="info-section p-3 border rounded">
                    <h5 className="mb-3 section-title"><FiShield className="me-2"/> Plan Asociado</h5>
                    <p className="mb-1">
                        {/* Ajusta 'nombre' si la propiedad se llama diferente (ej. planNombre) */}
                        <strong>Nombre del Plan:</strong> {poliza.plan.nombre || poliza.planNombre || 'N/A'}
                    </p>
                    <p className="mb-1 text-muted">
                        <strong>ID Plan:</strong> {poliza.plan.id || 'N/A'}
                    </p>
                    {/* Enlace al detalle/edición del plan (usa la ruta del form /planC/:id) */}
                    {poliza.plan.id && (
                        <Link to={`/planC/${poliza.plan.id}`} className="btn btn-sm btn-outline-info mt-2">
                            Ver/Editar Plan
                        </Link>
                    )}
                </div>
             ) : (
                  <div className="alert alert-secondary small">No se encontró información del plan asociado.</div>
             )}

             {/* Puedes añadir aquí secciones para Pagos, Reclamaciones, etc. si la API las provee o tienes otros servicios */}

        </div>
    );
};

export default DetallePolizaComponent;