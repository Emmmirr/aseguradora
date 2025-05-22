import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { obtenerClientePorId } from '../../services/ClienteService';
import { obtenerPolizasPorClienteId } from '../../services/PolizaService';

// --- Importa los iconos Feather ---
import { FiArrowLeft, FiPlus, FiInfo, FiUser, FiFileText } from 'react-icons/fi';
// --- Importa Spinner de react-bootstrap ---
import { Spinner } from 'react-bootstrap';

const PolizasClienteComponent = () => {
    const { id } = useParams(); // El ID del cliente viene de la URL
    const navigate = useNavigate();
    const [cliente, setCliente] = useState(null);
    const [polizas, setPolizas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarDatos();
    }, [id]); // Recargar si cambia el ID del cliente en la URL

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            // Obtener información del cliente
            const clienteResponse = await obtenerClientePorId(id);
            setCliente(clienteResponse.data);

            // Obtener pólizas del cliente
            const polizasResponse = await obtenerPolizasPorClienteId(id);
            setPolizas(polizasResponse.data);

        } catch (error) {
            console.error('Error cargando datos:', error);
            setError('Error al cargar los datos del cliente o sus pólizas. Intente nuevamente.');
            setCliente(null); // Asegurarse de limpiar si falla
            setPolizas([]);
        } finally {
            setLoading(false);
        }
    };

    // --- Funciones de formato (sin cambios) ---
    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return '-';
        try {
            // Intentar asegurar que la fecha se interprete correctamente (puede variar según el formato del backend)
            const fecha = new Date(fechaStr);
            // Comprobar si la fecha es válida después de la conversión
            if (isNaN(fecha.getTime())) {
                return '-'; // O devolver fechaStr si prefieres mostrar el original inválido
            }
            return fecha.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } catch (e) {
            console.error("Error formateando fecha:", fechaStr, e);
            return '-';
        }
    };

    const formatearMoneda = (valor) => {
        if (valor === undefined || valor === null || isNaN(valor)) return '-';
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(valor);
    };


    // --- JSX con el NUEVO DISEÑO ---
    return (
        <div className="page-content-container"> {/* Contenedor principal con estilo */}

            {/* Cabecera de la página */}
            <div className="page-header mb-4">
                <h2 className="page-title mb-0">
                    <FiUser size={20} className="me-2 align-middle" /> {/* Icono Cliente */}
                    Pólizas del Cliente
                </h2>
                <button
                    className="btn btn-light-secondary ms-auto" // Botón secundario para volver
                    onClick={() => navigate('/clientes')}
                >
                    <FiArrowLeft size={16} className="me-1" />
                    Volver a Clientes
                </button>
            </div>

            {/* Alerta de Error (estilo consistente) */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Estado de Carga (estilo consistente) */}
            {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                    <Spinner animation="border" variant="secondary" size="sm"/>
                    <span className="ms-2 text-muted">Cargando...</span>
                </div>
            ) : (
                <>
                    {/* Sección de Información del Cliente (usando un div similar a un card pero sin clases card) */}
                    {cliente && (
                        <div className="info-section mb-4 p-3 border rounded bg-light"> {/* Contenedor simple */}
                            <h4 className="mb-3 section-title">Información del Cliente</h4> {/* Título de sección */}
                            <div className="row g-2"> {/* Grid con menos espacio (g-2) */}
                                <div className="col-md-6">
                                    <p className="mb-1"><strong className="me-1">Nombre:</strong> {cliente.nombre} {cliente.apellido}</p>
                                    <p className="mb-1 text-muted"><strong className="me-1 text-dark">CURP:</strong> {cliente.curp}</p>
                                    <p className="mb-1">
                                        <strong className="me-1">Email:</strong>
                                        <a href={`mailto:${cliente.email}`} className="text-body text-decoration-none ms-1">
                                            {cliente.email}
                                        </a>
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <p className="mb-1 text-muted"><strong className="me-1 text-dark">Teléfono:</strong> {cliente.telefono}</p>
                                    <p className="mb-1 text-muted"><strong className="me-1 text-dark">Dirección:</strong> {cliente.direccion}</p>
                                    <p className="mb-1">
                                        <strong className="me-1">Estado:</strong>
                                        {/* Indicador de estado con nuevo estilo */}
                                        <span className={`status-indicator status-${cliente.estado === 'activo' ? 'success' : 'inactive'} d-inline-block ms-1`}>
                                            <span className="status-dot"></span>
                                            {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sección de Pólizas */}
                    {!cliente && !loading && !error && (
                         <div className="alert alert-warning">No se encontró información del cliente especificado.</div>
                    )}

                    {cliente && ( // Solo muestra la tabla de pólizas si el cliente existe
                        <>
                           {/* Cabecera para la tabla de pólizas */}
                            <div className="page-header mb-3">
                                <h3 className="page-title mb-0">
                                    <FiFileText size={18} className="me-2 align-middle"/> {/* Icono Póliza */}
                                    Pólizas Asociadas
                                </h3>
                                <Link to={`/polizaC?clienteId=${id}`} className="btn btn-light-primary ms-auto">
                                    <FiPlus size={16} className="me-1" />
                                    Nueva Póliza
                                </Link>
                            </div>

                            {/* Contenedor de la Tabla de Pólizas */}
                            <div className="table-container">
                                <div className="table-responsive">
                                    {/* Tabla con estilo 'app-table' */}
                                    <table className="table app-table">
                                        <thead>
                                            <tr>
                                                <th>ID Póliza</th>
                                                <th>Plan</th>
                                                <th>Fecha Inicio</th>
                                                <th>Fecha Vencimiento</th>
                                                <th className="text-end">Monto Asegurado</th>
                                                <th>Estado Póliza</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {polizas.length > 0 ? (
                                                polizas.map(poliza => (
                                                    <tr key={poliza.id}>
                                                        <td className="text-muted">#{poliza.id}</td>
                                                        <td>{poliza.planNombre || <span className="text-muted">N/A</span>}</td>
                                                        <td className="text-muted">{formatearFecha(poliza.fechaInicio)}</td>
                                                        <td className="text-muted">{formatearFecha(poliza.fechaVencimiento)}</td>
                                                        <td className="text-end">{formatearMoneda(poliza.montoAsegurado)}</td>
                                                        <td>
                                                            {/* Indicador de estado con nuevo estilo */}
                                                            <span className={`status-indicator status-${poliza.estado === 'activo' ? 'success' : 'inactive'}`}>
                                                                <span className="status-dot"></span>
                                                                {poliza.estado === 'activo' ? 'Activa' : 'Inactiva'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    {/* Mensaje "No encontrados" con nuevo estilo */}
                                                    <td colSpan="6" className="text-center py-4 text-muted no-data-cell">
                                                        <FiInfo size={18} className="me-2 align-middle" />
                                                        Este cliente no tiene pólizas registradas.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                             {/* Footer con estilo actualizado (si hay cliente) */}
                             {cliente && (
                                <div className="page-footer text-muted mt-3">
                                    Total de pólizas: {polizas.length}
                                </div>
                             )}
                        </>
                     )}
                </>
            )}
        </div> // Fin page-content-container
    );
};

export default PolizasClienteComponent;