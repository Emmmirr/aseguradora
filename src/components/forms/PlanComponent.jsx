import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearPlan, obtenerPlanPorId, actualizarPlan } from '../../services/PlanService';
import { FiCheck, FiX } from 'react-icons/fi'; // Iconos Feather
import { Spinner } from 'react-bootstrap';

// Recibe las props del componente padre (ListaPlanesComponent)
const PlanComponent = ({ planId, onSaveSuccess, onCancel }) => {
    // REMOVE: const { id } = useParams(); // Ya no se usa
    const isEditMode = !!planId; // Determina el modo basado en si planId tiene un valor

    // --- Estados (sin cambios en su definición inicial) ---
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precioBase, setPrecioBase] = useState('');
    const [tipoCobertura, setTipoCobertura] = useState('');
    const [estado, setEstado] = useState('activo');
    const [loadingData, setLoadingData] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [errors, setErrors] = useState({
        nombre: '',
        descripcion: '',
        precioBase: '',
        tipoCobertura: ''
    });

    // REMOVE: const navigate = useNavigate(); // Ya no se necesita para redirigir desde aquí

    useEffect(() => {
        // --- Limpiar estados al cambiar de planId (importante para modal) ---
        setNombre('');
        setDescripcion('');
        setPrecioBase('');
        setTipoCobertura('');
        setEstado('activo');
        setErrors({});
        setSubmitError('');
        setLoadingData(false);
        setIsSubmitting(false);
        // --- Fin Limpieza ---

        if (isEditMode) {
            setLoadingData(true);
            // Usa planId (prop) en lugar de id (de useParams)
            obtenerPlanPorId(planId)
                .then(response => {
                    const plan = response.data;
                    setNombre(plan.nombre);
                    setDescripcion(plan.descripcion);
                    // Asegurarse de que el precio base se maneje como string inicialmente si el input es text/number
                    setPrecioBase(plan.precioBase?.toString() ?? '');
                    setTipoCobertura(plan.tipoCobertura);
                    setEstado(plan.estado);
                })
                .catch(error => {
                    console.error("Error cargando plan:", error);
                    // Mostrar error dentro del modal
                    setSubmitError("No se pudo cargar la información del plan.");
                })
                .finally(() => {
                    setLoadingData(false);
                });
        }
    // Depende de planId para recargar/resetear cuando cambia
    }, [planId, isEditMode]); // Quita 'id' y 'navigate' de las dependencias si estaban

    // --- Lógica de validación y actualización de estado (sin cambios) ---
     function validaForm() {
        let valid = true;
        const errorsCopy = { nombre: '', descripcion: '', precioBase: '', tipoCobertura: '' };

        if (!nombre.trim()) {
            errorsCopy.nombre = 'El nombre es requerido';
            valid = false;
        }
        if (!descripcion.trim()) {
            errorsCopy.descripcion = 'La descripción es requerida';
            valid = false;
        }
        // Validar que precioBase sea un número y positivo
        const precioNum = parseFloat(precioBase);
        if (precioBase === '' || isNaN(precioNum) || precioNum <= 0) {
             errorsCopy.precioBase = 'El precio base debe ser un número positivo';
             valid = false;
        }
        if (!tipoCobertura) {
            errorsCopy.tipoCobertura = 'El tipo de cobertura es requerido';
            valid = false;
        }

        setErrors(errorsCopy);
        return valid;
    }

     const actualizarNombre = (e) => setNombre(e.target.value);
     const actualizarDescripcion = (e) => setDescripcion(e.target.value);
     const actualizarPrecioBase = (e) => setPrecioBase(e.target.value);
     const actualizarTipoCobertura = (e) => setTipoCobertura(e.target.value);
     const actualizarEstado = (e) => setEstado(e.target.value);
    // --- Fin Lógica de validación ---

    function handleSavePlan(e) {
        e.preventDefault();
        setSubmitError('');
        if (!validaForm()) return;

        setIsSubmitting(true);
        // Asegura que precioBase se envía como número
        const planData = {
            nombre,
            descripcion,
            precioBase: parseFloat(precioBase),
            tipoCobertura,
            estado: isEditMode ? estado : 'activo' // Estado por defecto al crear
        };

        // Usa planId (prop) para decidir si actualizar o crear
        const promise = isEditMode
            ? actualizarPlan(planId, planData)
            : crearPlan(planData);

        promise
            .then(() => {
                // Llama a la función de éxito pasada por props
                onSaveSuccess();
            })
            .catch(error => {
                console.error(isEditMode ? 'Error al actualizar:' : 'Error al crear:', error);
                // Muestra el error en el modal
                setSubmitError(error.response?.data?.message || `Error al ${isEditMode ? 'actualizar' : 'guardar'} el plan.`);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }

    // --- Renderizado del formulario (adaptado para modal) ---

    // Si está cargando datos para editar, muestra un spinner dentro del modal
    if (loadingData) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="secondary" size="sm"/>
                <p className="mt-2 text-muted">Cargando datos del plan...</p>
            </div>
        );
    }

    // No necesita el contenedor page-content-container ni el título h2 aquí,
    // ya que el modal en ListaPlanesComponent ya los proporciona.
    return (
        // El formulario directamente
        <form className="row g-3" onSubmit={handleSavePlan} noValidate>

            {/* Muestra errores de submit/carga dentro del formulario */}
            {submitError && <div className="col-12 alert alert-danger small p-2">{submitError}</div>}

            {/* --- Campos del formulario (sin cambios en su estructura interna) --- */}
            <div className="form-group col-md-6"> {/* Usar form-group para consistencia o solo col-md-6 */}
                <label htmlFor="inputNombrePlan" className="form-label">Nombre del Plan</label>
                <input
                    type="text"
                    id="inputNombrePlan" // ID único si es necesario
                    className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                    value={nombre}
                    onChange={actualizarNombre}
                    disabled={isSubmitting}
                    required
                />
                <div className="invalid-feedback">{errors.nombre}</div>
            </div>

            <div className="form-group col-md-6">
                 <label htmlFor="inputPrecioBasePlan" className="form-label">Precio Base (MXN)</label>
                 <div className="input-group"> {/* Input group para el $ */}
                     <span className="input-group-text">$</span>
                     <input
                         type="number" // Usar number puede facilitar la entrada, pero validar igual
                         id="inputPrecioBasePlan"
                         className={`form-control ${errors.precioBase ? 'is-invalid' : ''}`}
                         value={precioBase}
                         min="0.01"
                         step="0.01"
                         onChange={actualizarPrecioBase}
                         disabled={isSubmitting}
                         required
                     />
                     <div className="invalid-feedback">{errors.precioBase}</div>
                 </div>
            </div>

             <div className="form-group col-12">
                <label htmlFor="inputDescripcionPlan" className="form-label">Descripción</label>
                <textarea
                    id="inputDescripcionPlan"
                    className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
                    value={descripcion}
                    onChange={actualizarDescripcion}
                    rows="3" // Puede ser más corto para un modal
                    disabled={isSubmitting}
                    required
                ></textarea>
                <div className="invalid-feedback">{errors.descripcion}</div>
            </div>

            <div className="form-group col-md-6">
                <label htmlFor="inputTipoCoberturaPlan" className="form-label">Tipo de Cobertura</label>
                <select
                    id="inputTipoCoberturaPlan"
                    className={`form-select ${errors.tipoCobertura ? 'is-invalid' : ''}`}
                    value={tipoCobertura}
                    onChange={actualizarTipoCobertura}
                    disabled={isSubmitting}
                    required
                >
                    <option value="" disabled>Seleccione...</option>
                    {/* Asegúrate que estos valores coincidan con tu backend/enum */}
                    <option value="Salud">Salud</option>
                    <option value="Vida">Vida</option>
                    <option value="Patrimonial">Patrimonial</option>
                </select>
                <div className="invalid-feedback">{errors.tipoCobertura}</div>
            </div>

            {/* El estado solo se muestra/edita en modo edición dentro del modal */}
            {isEditMode && (
                <div className="form-group col-md-6">
                    <label htmlFor="inputEstadoPlan" className="form-label">Estado</label>
                    <select
                        id="inputEstadoPlan"
                        className="form-select"
                        value={estado}
                        onChange={actualizarEstado}
                        disabled={isSubmitting}
                    >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
            )}

            {/* --- Botones de Acción --- */}
            {/* Usan las props onCancel y onSaveSuccess */}
            <div className="col-12 mt-4 text-end"> {/* O usar text-end para alineación */}
                 <button
                    type="button"
                    className="btn btn-secondary me-2"
                    // Llama a la función onCancel pasada por props
                    onClick={onCancel}
                    disabled={isSubmitting}
                 >
                     <FiX size={16} className="me-1"/> {/* Icono Cancelar */}
                     Cancelar
                 </button>
                 <button
                     type="submit"
                     className="btn btn-primary"
                     disabled={isSubmitting}
                 >
                     {isSubmitting ? (
                         <>
                             <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                             Guardando...
                         </>
                     ) : (
                         <>
                             <FiCheck size={16} className="me-1"/> {/* Icono Guardar/Actualizar */}
                             {isEditMode ? 'Actualizar Plan' : 'Guardar Plan'}
                         </>
                     )}
                 </button>
            </div>
        </form>
    );
};

export default PlanComponent;