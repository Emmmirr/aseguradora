import React, { useState, useEffect } from "react";
// Remove useNavigate and useParams
// import { useNavigate, useParams } from "react-router-dom";
import { crearPago, obtenerPagoPorId, actualizarPago } from "../../services/PagoService";
import { obtenerTodasPolizas } from "../../services/PolizaService"; // Keep this for dropdown

// Accept props from parent
export const PagoComponent = ({ pagoId, onSaveSuccess, onCancel }) => {

    // Form State
    const [fechaPago, setFechaPago] = useState('');
    const [metodoPago, setMetodoPago] = useState('');
    const [polizaId, setPolizaId] = useState('');
    const [monto, setMonto] = useState('');

    // State for dropdown
    const [polizas, setPolizas] = useState([]);
    const [loadingListas, setLoadingListas] = useState(true);
    const [listasError, setListasError] = useState('');

    // State for validation and submission
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false); // For API call in progress

    // --- Effects ---
    // Effect to load policies for the dropdown
    useEffect(() => {
        setLoadingListas(true);
        setListasError('');
        obtenerTodasPolizas()
            .then(response => {
                // Filter for active policies only, maybe sort them?
                setPolizas((response.data || []).filter(p => p.estado === 'activo')
                                            .sort((a, b) => a.id - b.id)); // Optional sort
            })
            .catch(error => {
                console.error('Error cargando pólizas para el formulario:', error);
                setListasError('Error al cargar opciones de póliza.');
                setPolizas([]);
            })
            .finally(() => {
                setLoadingListas(false);
            });
    }, []); // Run only once on mount

    // Effect to load payment data when pagoId changes (Edit mode)
    useEffect(() => {
        // Function to reset form state
        const resetForm = () => {
            setFechaPago('');
            setMetodoPago('');
            setPolizaId('');
            setMonto('');
            setErrors({});
            setIsSubmitting(false); // Ensure not stuck in submitting 
            // state
        };

        resetForm(); // Reset form every time ID changes or becomes null

        if (pagoId) { // If an ID is passed (Edit Mode)
            setIsSubmitting(true); // Use isSubmitting to indicate loading existing data
            obtenerPagoPorId(pagoId)
                .then(response => {
                    const pago = response.data;
                    // Format date for input type="date" (YYYY-MM-DD)
                    setFechaPago(pago.fechaPago ? new Date(pago.fechaPago).toISOString().split('T')[0] : '');
                    setMetodoPago(pago.metodoPago);
                    setPolizaId(pago.polizaId);
                    setMonto(pago.monto || ''); // Handle null/undefined
                })
                .catch(error => {
                    console.error("Error al obtener pago:", error);
                    setErrors({ fetch: 'No se pudo cargar la información del pago.' });
                })
                .finally(() => {
                    setIsSubmitting(false); // Finish loading state
                });
        }
        // If pagoId is null (Add Mode), the form remains reset (blank)

    }, [pagoId]); // Re-run this effect when the pagoId prop changes

    // --- Validation ---
    function validaForm() {
        let valid = true;
        const errorsCopy = {}; // Start fresh

        if (!fechaPago) {
            errorsCopy.fechaPago = 'La fecha de pago es requerida'; valid = false;
        } else { errorsCopy.fechaPago = ''; }

        if (!metodoPago) {
            errorsCopy.metodoPago = 'El método de pago es requerido'; valid = false;
        } else { errorsCopy.metodoPago = ''; }

        if (!polizaId) {
            errorsCopy.polizaId = 'La póliza es requerida'; valid = false;
        } else { errorsCopy.polizaId = ''; }

        // Use parseFloat for validation, ensure it's positive
        const montoNum = parseFloat(monto);
        if (!monto || isNaN(montoNum) || montoNum <= 0) {
            errorsCopy.monto = 'El monto debe ser un número positivo'; valid = false;
        } else { errorsCopy.monto = ''; }

        setErrors(errorsCopy);
        return valid;
    }

    // --- Input Handlers ---
    const handleInputChange = (setter) => (e) => setter(e.target.value);

    // --- Save Handler ---
    function handleSave(e) {
        e.preventDefault();
        // Clear previous submit/fetch errors before new validation/submit attempt
        setErrors(prev => ({ ...prev, submit: undefined, fetch: undefined }));

        if (validaForm()) {
            setIsSubmitting(true); // Indicate submission in progress

            const pagoData = {
                fechaPago,
                metodoPago,
                // Ensure IDs and amounts are numbers if required by backend
                polizaId: parseInt(polizaId, 10),
                monto: parseFloat(monto)
            };

            // Determine if creating or updating based on pagoId prop
            const promise = pagoId
                ? actualizarPago(pagoId, pagoData)
                : crearPago(pagoData);

            promise
                .then(() => {
                    onSaveSuccess(); // <<< Call parent's success handler
                })
                .catch(error => {
                    console.error("Error guardando pago:", error);
                    // Display specific backend error or generic one
                    const message = error.response?.data?.message || error.response?.data?.mensaje || 'Ocurrió un error al guardar el pago.';
                    setErrors(prev => ({ ...prev, submit: message }));
                    setIsSubmitting(false); // End submission process on error
                });
            // No 'finally' here for setIsSubmitting, success calls onSaveSuccess which unmounts/closes
        } else {
            console.log("Formulario de pago inválido");
        }
    }

    // --- JSX ---
    // Remove outer container/card/title structure, return only the form
    return (
        <form className="row g-3" onSubmit={handleSave} noValidate>

            {/* Display general fetch/submit/list errors */}
            {errors.fetch && <div className="col-12 alert alert-warning small p-2">{errors.fetch}</div>}
            {listasError && <div className="col-12 alert alert-danger small p-2">{listasError}</div>}
            {errors.submit && <div className="col-12 alert alert-danger small p-2">{errors.submit}</div>}

            {/* Form Fields */}
            <div className="form-group col-md-6">
                <label htmlFor="modalInputFechaPago" className="form-label">Fecha de Pago</label>
                <input
                    type="date"
                    id="modalInputFechaPago" // Prefix ID for uniqueness within modal context
                    value={fechaPago}
                    className={`form-control form-control-sm ${errors.fechaPago ? 'is-invalid' : ''}`}
                    onChange={handleInputChange(setFechaPago)}
                    disabled={isSubmitting} // Disable during load/save
                    required
                />
                {errors.fechaPago && <div className="invalid-feedback">{errors.fechaPago}</div>}
            </div>

            <div className="form-group col-md-6">
                <label htmlFor="modalInputMetodoPago" className="form-label">Método de Pago</label>
                <select
                    id="modalInputMetodoPago"
                    value={metodoPago}
                    className={`form-select form-select-sm ${errors.metodoPago ? 'is-invalid' : ''}`}
                    onChange={handleInputChange(setMetodoPago)}
                    disabled={isSubmitting}
                    required
                >
                    <option value="">Seleccionar método</option>
                    <option value="Tarjeta">Tarjeta</option> {/* Consistent naming? */}
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Cheque">Cheque</option>
                    {/* Add other methods if needed */}
                </select>
                {errors.metodoPago && <div className="invalid-feedback">{errors.metodoPago}</div>}
            </div>

            <div className="form-group col-md-6">
                <label htmlFor="modalInputPoliza" className="form-label">Póliza</label>
                <select
                    id="modalInputPoliza"
                    value={polizaId}
                    className={`form-select form-select-sm ${errors.polizaId ? 'is-invalid' : ''}`}
                    onChange={handleInputChange(setPolizaId)}
                    // Disable changing policy when editing an existing payment
                    // Also disable if lists are loading/failed
                    disabled={!!pagoId || isSubmitting || loadingListas || !!listasError}
                    required
                >
                    <option value="">{loadingListas ? 'Cargando pólizas...' : 'Seleccionar póliza activa'}</option>
                    {!loadingListas && polizas.map(poliza => (
                        <option key={poliza.id} value={poliza.id}>
                            #{poliza.id} - {poliza.nombreCliente || 'Cliente N/A'} ({poliza.nombrePlan || 'Plan N/A'})
                        </option>
                    ))}
                </select>
                {errors.polizaId && <div className="invalid-feedback">{errors.polizaId}</div>}
                {!!pagoId && <small className="text-muted d-block mt-1">No se puede cambiar la póliza.</small>}
            </div>

            <div className="form-group col-md-6">
                <label htmlFor="modalInputMonto" className="form-label">Monto</label>
                <div className="input-group input-group-sm">
                    <span className="input-group-text">$</span>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01" // Ensure positive amount
                        id="modalInputMonto"
                        placeholder="0.00"
                        value={monto}
                        className={`form-control ${errors.monto ? 'is-invalid' : ''}`}
                        onChange={handleInputChange(setMonto)}
                        disabled={isSubmitting}
                        required
                    />
                </div>
                {/* d-block needed for feedback below input group */}
                {errors.monto && <div className="invalid-feedback d-block">{errors.monto}</div>}
            </div>

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
                    // Disable if submitting, loading lists, or lists failed
                    disabled={isSubmitting || loadingListas || !!listasError}
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                            {pagoId ? 'Actualizando...' : 'Guardando...'}
                        </>
                    ) : (
                        pagoId ? 'Actualizar Pago' : 'Guardar Pago' // Dynamic button text
                    )}
                </button>
            </div>
        </form>
    );
};

export default PagoComponent; // Default export