import React, { useState, useEffect } from 'react';
// Remueve useParams y useNavigate, ya no son necesarios aquí
// import { useNavigate, useParams } from 'react-router-dom';
import { crearReclamacion, obtenerReclamacionPorId, actualizarReclamacion } from '../../services/ReclamacionService';
import { obtenerTodasPolizas } from '../../services/PolizaService';

// --- Importa Spinner de react-bootstrap para el botón de guardar ---
import { Spinner } from 'react-bootstrap';

// AHORA RECIBE PROPS: reclamacionId, onSaveSuccess, onCancel
const ReclamacionComponent = ({ reclamacionId, onSaveSuccess, onCancel }) => {
    // El ID ahora viene de props, no de useParams
    // const { id } = useParams(); // <-- REMOVIDO
    const modo = !!reclamacionId; // Determina el modo (editar/agregar) basado en la prop

    // Estados del formulario (iguales)
    const [descripcion, setDescripcion] = useState('');
    const [estado, setEstado] = useState('pendiente');
    const [fechaIncidente, setFechaIncidente] = useState('');
    const [polizaId, setPolizaId] = useState('');
    const [polizas, setPolizas] = useState([]);

    // Estado de errores (igual)
    const [errors, setErrors] = useState({
        descripcion: '',
        estado: '',
        fechaIncidente: '',
        polizaId: '',
        fetch: '', // Para errores al cargar datos
        submit: '' // Para errores al guardar
    });

    // --- NUEVO ESTADO PARA DESHABILITAR BOTONES AL GUARDAR ---
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Resetea los estados al montar o cambiar el ID
        setDescripcion('');
        setEstado('pendiente');
        setFechaIncidente('');
        setPolizaId('');
        setErrors({}); // Limpia errores anteriores
        setIsSubmitting(false); // Asegura que no esté submitting
        setPolizas([]); // Limpia pólizas para recargar

        // Carga las pólizas activas SIEMPRE al montar/cambiar ID
        cargarPolizas();

        // Si recibimos un ID (modo edición), carga los datos de la reclamación
        if (reclamacionId) {
            obtenerReclamacionPorId(reclamacionId).then(response => {
                const reclamacion = response.data;
                setDescripcion(reclamacion.descripcion);
                setEstado(reclamacion.estado);
                // Formatea la fecha correctamente para el input type="date"
                setFechaIncidente(reclamacion.fechaIncidente ? reclamacion.fechaIncidente.split('T')[0] : '');
                setPolizaId(reclamacion.polizaId);
            }).catch(error => {
                console.error('Error obteniendo reclamación:', error);
                setErrors(prev => ({ ...prev, fetch: 'Error al cargar los datos de la reclamación.' }));
            });
        }
        // La dependencia ahora es reclamacionId
    }, [reclamacionId]);

    // Cargar pólizas (igual)
    const cargarPolizas = () => {
        obtenerTodasPolizas().then(response => {
            // Filtra pólizas activas
            setPolizas(response.data.filter(poliza => poliza.estado === 'activo'));
        }).catch(error => {
            console.error('Error cargando pólizas:', error);
            setErrors(prev => ({ ...prev, fetch: 'Error al cargar las pólizas disponibles.' }));
        });
    };

    // Título ya no es necesario, el modal lo maneja
    // function pagTitulo() { ... } // <-- REMOVIDO

    // Validación (igual, pero limpia errores generales también)
    function validaForm() {
        let valid = true;
        const errorsCopy = {}; // Empieza con objeto vacío
        setErrors({}); // Limpia errores anteriores antes de validar

        if (!descripcion.trim()) { errorsCopy.descripcion = 'La descripción es requerida'; valid = false; }
        if (!estado) { errorsCopy.estado = 'El estado es requerido'; valid = false; }
        if (!fechaIncidente) { errorsCopy.fechaIncidente = 'La fecha del incidente es requerida'; valid = false; }
        if (!polizaId) { errorsCopy.polizaId = 'La póliza es requerida'; valid = false; }

        setErrors(errorsCopy); // Establece solo los nuevos errores de validación
        return valid;
    }

    // Ya no se necesita 'navegar'
    // const navegar = useNavigate(); // <-- REMOVIDO

    // Función de guardar (adaptada para usar callbacks y manejar estado submitting)
    function handleSave(e) { // Renombrado para claridad
        e.preventDefault();
        if (validaForm()) {
            setIsSubmitting(true); // Deshabilita botones
            setErrors(prev => ({ ...prev, submit: '' })); // Limpia error de submit anterior

            const reclamacionData = { // Nombre de variable más descriptivo
                descripcion,
                estado,
                fechaIncidente,
                polizaId: parseInt(polizaId) // Asegura que sea número
            };

            // Determina si crear o actualizar basado en reclamacionId
            const promise = reclamacionId
                ? actualizarReclamacion(reclamacionId, reclamacionData)
                : crearReclamacion(reclamacionData);

            promise
                .then(response => {
                    console.log(reclamacionId ? 'Reclamación actualizada:' : 'Reclamación registrada:', response.data);
                    onSaveSuccess(); // Llama al callback de éxito del padre
                })
                .catch(error => {
                    console.error(reclamacionId ? 'Error al actualizar reclamación:' : 'Error al registrar reclamación:', error);
                    // Muestra el error en el formulario
                    const errorMsg = error.response?.data?.mensaje || error.response?.data?.message || (reclamacionId ? 'Error al actualizar.' : 'Error al registrar.');
                    setErrors(prev => ({ ...prev, submit: errorMsg }));
                    setIsSubmitting(false); // Habilita botones de nuevo en caso de error
                });
        }
    }

    // --- JSX DEL FORMULARIO (Sin el card/container exterior) ---
    return (
        // El formulario ahora es el elemento raíz que devuelve este componente
        <form className="row g-3" onSubmit={handleSave} noValidate>

            {/* Muestra errores generales (carga/guardado) */}
            {errors.fetch && <div className="col-12 alert alert-warning small p-2">{errors.fetch}</div>}
            {errors.submit && <div className="col-12 alert alert-danger small p-2">{errors.submit}</div>}


            {/* Campos del formulario (iguales, pero deshabilitados si isSubmitting) */}
            <div className="form-group col-md-12">
                <label htmlFor="inputDescripcionModal" className="form-label">Descripción</label>
                <textarea
                    id="inputDescripcionModal" // Cambia ID para evitar colisiones si hubiera otro form
                    value={descripcion}
                    className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows="3"
                    disabled={isSubmitting}
                    required
                ></textarea>
                {errors.descripcion && <div className="invalid-feedback">{errors.descripcion}</div>}
            </div>

            <div className="form-group col-md-6">
                <label htmlFor="inputEstadoModal" className="form-label">Estado</label>
                <select
                    id="inputEstadoModal"
                    value={estado}
                    className={`form-select ${errors.estado ? 'is-invalid' : ''}`}
                    onChange={(e) => setEstado(e.target.value)}
                    disabled={isSubmitting}
                    required
                >
                    {/* Mantiene las opciones originales */}
                    <option value="Pendiente">Pendiente</option>
                    <option value="Aprobada">Aprobada</option>
                    <option value="Rechazada">Rechazada</option>
                </select>
                {errors.estado && <div className="invalid-feedback">{errors.estado}</div>}
            </div>

            <div className="form-group col-md-6">
                <label htmlFor="inputFechaIncidenteModal" className="form-label">Fecha del Incidente</label>
                <input
                    type="date"
                    id="inputFechaIncidenteModal"
                    value={fechaIncidente}
                    className={`form-control ${errors.fechaIncidente ? 'is-invalid' : ''}`}
                    onChange={(e) => setFechaIncidente(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                {errors.fechaIncidente && <div className="invalid-feedback">{errors.fechaIncidente}</div>}
            </div>

            <div className="form-group col-md-12">
                <label htmlFor="inputPolizaModal" className="form-label">Póliza</label>
                <select
                    id="inputPolizaModal"
                    value={polizaId}
                    className={`form-select ${errors.polizaId ? 'is-invalid' : ''}`}
                    onChange={(e) => setPolizaId(e.target.value)}
                    // La póliza SÓLO se deshabilita en modo edición, NO si está submitting
                    disabled={modo || isSubmitting}
                    required
                >
                    <option value="">Seleccionar póliza</option>
                    {polizas.map(poliza => (
                        <option key={poliza.id} value={poliza.id}>
                            ID: {poliza.id} - Cliente: {poliza.nombreCliente || 'N/A'} - Plan: {poliza.nombrePlan || 'N/A'}
                        </option>
                    ))}
                </select>
                {errors.polizaId && <div className="invalid-feedback">{errors.polizaId}</div>}
            </div>

            {/* Botones al final del formulario, usan onCancel y muestran estado submitting */}
            <div className="col-12 mt-4 text-end"> {/* Alineados a la derecha */}
                <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={onCancel} // Llama al callback de cancelar del padre
                    disabled={isSubmitting} // Deshabilitado mientras se guarda
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting} // Deshabilitado mientras se guarda
                >
                    {isSubmitting ? (
                        <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1"/>
                             Guardando...
                        </>
                    ) : (
                        // Texto cambia según si estamos editando o agregando
                        reclamacionId ? 'Actualizar' : 'Guardar'
                    )}
                </button>
            </div>
        </form>
    );
};

export default ReclamacionComponent;