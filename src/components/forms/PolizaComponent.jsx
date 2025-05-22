import React, { useState, useEffect } from "react";
// Remove useParams and useNavigate
// import { useNavigate, useParams } from "react-router-dom";
import { crearPoliza, obtenerPolizaPorId, actualizarPoliza } from "../../services/PolizaService";
import { obtenerTodosClientes } from "../../services/ClienteService";
import { obtenerTodosPlanes } from "../../services/PlanService";

// Accept props from parent
export const PolizaComponent = ({ polizaId, onSaveSuccess, onCancel }) => {

    // Form State
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [clienteId, setClienteId] = useState('');
    const [planId, setPlanId] = useState('');
    const [montoAsegurado, setMontoAsegurado] = useState('');
    const [estado, setEstado] = useState('activo'); // Default for new policies

    // State for dropdowns
    const [clientes, setClientes] = useState([]);
    const [planes, setPlanes] = useState([]);
    const [loadingListas, setLoadingListas] = useState(true);
    const [listasError, setListasError] = useState(''); // Error loading lists

    // State for validation and submission
    const [errors, setErrors] = useState({}); // Clearer structure for errors
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Effects ---
    useEffect(() => {
        // Fetch dropdown lists only once or if needed
        setLoadingListas(true);
        setListasError('');
        Promise.all([
            obtenerTodosClientes(),
            obtenerTodosPlanes()
        ]).then(responses => {
            setClientes(responses[0].data || []); // Ensure array even if null response
            setPlanes(responses[1].data || []);   // Ensure array even if null response
        }).catch(error => {
            console.error('Error cargando listas para el formulario:', error);
            setListasError('Error al cargar opciones de cliente/plan. Intente cerrar y reabrir.');
            setClientes([]);
            setPlanes([]);
        }).finally(() => {
            setLoadingListas(false);
        });
    }, []); // Empty dependency array: fetch lists only once on mount

    useEffect(() => {
        // Function to reset form state
        const resetForm = () => {
            setFechaInicio('');
            setFechaVencimiento('');
            setClienteId('');
            setPlanId('');
            setMontoAsegurado('');
            setEstado('activo'); // Reset to default
            setErrors({});
            setIsSubmitting(false); // Ensure not stuck in submitting state
        };

        // Reset form state AND load data if polizaId is provided (Edit mode)
        resetForm();

        if (polizaId) {
            setIsSubmitting(true); // Show loading state while fetching
            obtenerPolizaPorId(polizaId).then(response => {
                const poliza = response.data;
                // Format dates correctly for input type="date" (YYYY-MM-DD)
                setFechaInicio(poliza.fechaInicio ? new Date(poliza.fechaInicio).toISOString().split('T')[0] : '');
                setFechaVencimiento(poliza.fechaVencimiento ? new Date(poliza.fechaVencimiento).toISOString().split('T')[0] : '');
                setClienteId(poliza.clienteId);
                setPlanId(poliza.planId);
                setMontoAsegurado(poliza.montoAsegurado || ''); // Handle null/undefined
                setEstado(poliza.estado);
            }).catch(error => {
                console.error("Error al obtener póliza:", error);
                setErrors({ fetch: 'No se pudo cargar la información de la póliza.' });
            }).finally(() => {
                setIsSubmitting(false); // Finish loading state
            });
        }
        // If polizaId is null (Add mode), the form remains reset (blank)

    }, [polizaId]); // Re-run this effect when the polizaId prop changes

    // --- Validation ---
    function validaForm() {
        let valid = true;
        const errorsCopy = {}; // Start fresh

        if (!fechaInicio) {
            errorsCopy.fechaInicio = 'La fecha de inicio es requerida'; valid = false;
        } else { errorsCopy.fechaInicio = ''; }

        if (!fechaVencimiento) {
            errorsCopy.fechaVencimiento = 'La fecha de vencimiento es requerida'; valid = false;
        } else if (fechaInicio && new Date(fechaVencimiento) <= new Date(fechaInicio)) {
            errorsCopy.fechaVencimiento = 'Vencimiento debe ser posterior al inicio'; valid = false;
        } else { errorsCopy.fechaVencimiento = ''; }

        if (!clienteId) {
            errorsCopy.clienteId = 'El cliente es requerido'; valid = false;
        } else { errorsCopy.clienteId = ''; }

        if (!planId) {
            errorsCopy.planId = 'El plan es requerido'; valid = false;
        } else { errorsCopy.planId = ''; }

        if (!montoAsegurado || isNaN(montoAsegurado) || parseFloat(montoAsegurado) <= 0) {
            errorsCopy.montoAsegurado = 'Monto asegurado debe ser número positivo'; valid = false;
        } else { errorsCopy.montoAsegurado = ''; }

        // No validation needed for estado select usually

        setErrors(errorsCopy);
        return valid;
    }

    // --- Input Handlers ---
    const actualizarFechaInicio = (e) => setFechaInicio(e.target.value);
    const actualizarFechaVencimiento = (e) => setFechaVencimiento(e.target.value);
    const actualizarClienteId = (e) => setClienteId(e.target.value);
    const actualizarPlanId = (e) => setPlanId(e.target.value);
    const actualizarMontoAsegurado = (e) => setMontoAsegurado(e.target.value);
    const actualizarEstado = (e) => setEstado(e.target.value);

    // --- Save Handler ---
    function handleSave(e) {
        e.preventDefault();
        // Clear previous submit errors
        setErrors(prev => ({ ...prev, submit: undefined, fetch: undefined }));

        if (validaForm()) {
            setIsSubmitting(true); // Start submission process

            const polizaData = {
                fechaInicio,
                fechaVencimiento,
                // Ensure IDs are numbers if required by backend
                clienteId: parseInt(clienteId, 10),
                planId: parseInt(planId, 10),
                montoAsegurado: parseFloat(montoAsegurado),
                estado: polizaId ? estado : 'activo' // Use current state in edit, default 'activo' in add
            };

            // Determine if creating or updating
            const promise = polizaId
                ? actualizarPoliza(polizaId, polizaData)
                : crearPoliza(polizaData);

            promise
                .then(() => {
                    onSaveSuccess(); // <<< Call parent's success handler
                })
                .catch(error => {
                    console.error("Error guardando póliza:", error);
                    // Display specific backend error or generic one
                    const message = error.response?.data?.message || 'Ocurrió un error al guardar.';
                    setErrors(prev => ({ ...prev, submit: message }));
                    setIsSubmitting(false); // End submission process on error
                });
                // No 'finally' here for setIsSubmitting, because success calls onSaveSuccess which unmounts/closes
        } else {
            console.log("Formulario inválido");
        }
    }

    // --- JSX ---
    // Remove outer container/card, return only the form
    return (
        <form className="row g-3" onSubmit={handleSave} noValidate>

            {/* Display general fetch/submit errors */}
            {errors.fetch && <div className="col-12 alert alert-warning small p-2">{errors.fetch}</div>}
            {listasError && <div className="col-12 alert alert-danger small p-2">{listasError}</div>}
            {errors.submit && <div className="col-12 alert alert-danger small p-2">{errors.submit}</div>}

            {/* Form Fields */}
            <div className="form-group col-md-6">
                <label htmlFor="modalInputFechaInicio" className="form-label">Fecha de Inicio</label>
                <input
                    type="date"
                    id="modalInputFechaInicio" // Use unique IDs if needed, e.g., prefix with 'modal'
                    value={fechaInicio}
                    className={`form-control form-control-sm ${errors.fechaInicio ? 'is-invalid' : ''}`}
                    onChange={actualizarFechaInicio}
                    disabled={isSubmitting || loadingListas}
                    required
                />
                {errors.fechaInicio && <div className="invalid-feedback">{errors.fechaInicio}</div>}
            </div>

            <div className="form-group col-md-6">
                <label htmlFor="modalInputFechaVencimiento" className="form-label">Fecha de Vencimiento</label>
                <input
                    type="date"
                    id="modalInputFechaVencimiento"
                    value={fechaVencimiento}
                    className={`form-control form-control-sm ${errors.fechaVencimiento ? 'is-invalid' : ''}`}
                    onChange={actualizarFechaVencimiento}
                    disabled={isSubmitting || loadingListas}
                    required
                />
                {errors.fechaVencimiento && <div className="invalid-feedback">{errors.fechaVencimiento}</div>}
            </div>

            <div className="form-group col-md-6">
                <label htmlFor="modalInputClienteId" className="form-label">Cliente</label>
                <select
                    id="modalInputClienteId"
                    className={`form-select form-select-sm ${errors.clienteId ? 'is-invalid' : ''}`}
                    value={clienteId}
                    onChange={actualizarClienteId}
                    disabled={isSubmitting || loadingListas || !!listasError} // Disable if lists fail to load
                    required
                >
                    <option value="">{loadingListas ? 'Cargando...' : 'Seleccione cliente'}</option>
                    {!loadingListas && clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                            {cliente.id} - {cliente.nombre} {cliente.apellido}
                        </option>
                    ))}
                </select>
                {errors.clienteId && <div className="invalid-feedback">{errors.clienteId}</div>}
            </div>

            <div className="form-group col-md-6">
                <label htmlFor="modalInputPlanId" className="form-label">Plan</label>
                <select
                    id="modalInputPlanId"
                    className={`form-select form-select-sm ${errors.planId ? 'is-invalid' : ''}`}
                    value={planId}
                    onChange={actualizarPlanId}
                    disabled={isSubmitting || loadingListas || !!listasError}
                    required
                >
                    <option value="">{loadingListas ? 'Cargando...' : 'Seleccione plan'}</option>
                    {!loadingListas && planes.map(plan => (
                        <option key={plan.id} value={plan.id}>
                            {plan.id} - {plan.nombre} ({plan.tipoCobertura})
                        </option>
                    ))}
                </select>
                {errors.planId && <div className="invalid-feedback">{errors.planId}</div>}
            </div>

            <div className="form-group col-md-6">
                <label htmlFor="modalInputMontoAsegurado" className="form-label">Monto Asegurado</label>
                <div className="input-group input-group-sm"> {/* Use input-group-sm for consistency */}
                    <span className="input-group-text">$</span>
                    <input
                        type="number"
                        id="modalInputMontoAsegurado"
                        placeholder="0.00"
                        value={montoAsegurado}
                        min="0.01" // Minimum value
                        step="0.01" // Step for decimals
                        className={`form-control ${errors.montoAsegurado ? 'is-invalid' : ''}`}
                        onChange={actualizarMontoAsegurado}
                        disabled={isSubmitting || loadingListas}
                        required
                    />
                 </div>
                 {errors.montoAsegurado && <div className="invalid-feedback d-block">{errors.montoAsegurado}</div>} {/* d-block for feedback below group */}
            </div>

            {/* Only show Estado selector in Edit mode */}
            {polizaId && (
                <div className="form-group col-md-6">
                    <label htmlFor="modalInputEstado" className="form-label">Estado</label>
                    <select
                        id="modalInputEstado"
                        className="form-select form-select-sm" // Added form-select-sm
                        value={estado}
                        onChange={actualizarEstado}
                        disabled={isSubmitting || loadingListas}
                    >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
            )}

            {/* Action Buttons within the form */}
            <div className="col-12 mt-4 text-end">
                <button
                    type="button"
                    className="btn btn-sm btn-secondary me-2" // Use btn-sm
                    onClick={onCancel} // <<< Call parent's cancel handler
                    disabled={isSubmitting} // Disable while submitting
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="btn btn-sm btn-primary" // Use btn-sm
                    disabled={isSubmitting || loadingListas || !!listasError} // Disable while submitting or if lists failed
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            Guardando...
                        </>
                    ) : (
                        polizaId ? 'Actualizar' : 'Guardar' // Dynamic button text
                    )}
                </button>
            </div>
        </form>
    );
};

// Use default export if this is the primary export of the file
export default PolizaComponent;