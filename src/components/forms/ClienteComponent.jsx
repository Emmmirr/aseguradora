import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crearCliente, obtenerClientePorId, actualizarCliente } from "../../services/ClienteService";

export const ClienteComponent = ({ clienteId, onSaveSuccess, onCancel }) => {

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [curp, setCurp] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [estadoCliente, setEstadoCliente] = useState('activo');

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setNombre('');
        setApellido('');
        setCurp('');
        setEmail('');
        setTelefono('');
        setDireccion('');
        setFechaNacimiento('');
        setEstadoCliente('activo');
        setErrors({});
        setIsSubmitting(false);

        if (clienteId) { // Modo Edición

            obtenerClientePorId(clienteId).then(response => {
                const cliente = response.data;
                setNombre(cliente.nombre);
                setApellido(cliente.apellido);
                setCurp(cliente.curp);
                setEmail(cliente.email);
                setTelefono(cliente.telefono);
                setDireccion(cliente.direccion);
                setEstadoCliente(cliente.estado);
                if (cliente.fechaNacimiento) {
                    try { // Formatear fecha
                        setFechaNacimiento(new Date(cliente.fechaNacimiento).toISOString().split('T')[0]);
                    } catch (e) { console.error("Error fecha:", e); }
                }
            }).catch(error => {
                console.error("Error al obtener cliente:", error);
                setErrors({ fetch: 'No se pudo cargar la información.' });
            });
        }
    }, [clienteId]); 

    function validaForm() {
        let valid = true;
        const errorsCopy = {};
        if (!nombre.trim()) { errorsCopy.nombre = 'Nombre requerido'; valid = false; }
        if (!apellido.trim()) { errorsCopy.apellido = 'Apellido requerido'; valid = false; }
        if (!curp.trim()) { errorsCopy.curp = 'CURP requerido'; valid = false; }
        if (!email.trim()) { errorsCopy.email = 'Email requerido'; valid = false; }
        else if (!/\S+@\S+\.\S+/.test(email)) { errorsCopy.email = 'Email inválido'; valid = false; }
        if (!telefono.trim()) { errorsCopy.telefono = 'Teléfono requerido'; valid = false; }
        if (!direccion.trim()) { errorsCopy.direccion = 'Dirección requerida'; valid = false; }
        if (!fechaNacimiento) { errorsCopy.fechaNacimiento = 'Fecha requerida'; valid = false; }
        setErrors(errorsCopy);
        return valid;
    }


    const actualizarNombre = (e) => setNombre(e.target.value);
    const actualizarApellido = (e) => setApellido(e.target.value);
    const actualizarCurp = (e) => setCurp(e.target.value);
    const actualizarEmail = (e) => setEmail(e.target.value);
    const actualizarTelefono = (e) => setTelefono(e.target.value);
    const actualizarDireccion = (e) => setDireccion(e.target.value);
    const actualizarFechaNacimiento = (e) => setFechaNacimiento(e.target.value);


    function handleSave(e) {
        e.preventDefault();
        if (validaForm()) {
            setIsSubmitting(true);
            setErrors({}); 

            const clienteData = { 
                nombre, apellido, curp, email, telefono, direccion, fechaNacimiento,
                estado: clienteId ? estadoCliente : 'activo'
            };

            const promise = clienteId
                ? actualizarCliente(clienteId, clienteData)
                : crearCliente(clienteData);

            promise
                .then(() => {
                    onSaveSuccess(); 
                })
                .catch(error => {
                    console.error("Error guardando:", error);
                    setErrors({ submit: error.response?.data?.message || 'Error al guardar.' });
                    setIsSubmitting(false); 
                });
        }
    }

    return (
        <form className="row g-3" onSubmit={handleSave} noValidate>

            {errors.fetch && <div className="col-12 alert alert-warning small p-2">{errors.fetch}</div>}
            {errors.submit && <div className="col-12 alert alert-danger small p-2">{errors.submit}</div>}

            <div className="form-group col-md-6">
                <label htmlFor="inputNombre" className="form-label">Nombre</label>
                <input
                    type="text" id="inputNombre" placeholder="Insertar nombre" value={nombre}
                    className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                    onChange={actualizarNombre} disabled={isSubmitting} required
                />
                {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
            </div>
            <div className="form-group col-md-6">
                <label htmlFor="inputApellido" className="form-label">Apellido</label>
                <input
                    type="text" id="inputApellido" placeholder="Insertar apellido" value={apellido}
                    className={`form-control ${errors.apellido ? 'is-invalid' : ''}`}
                    onChange={actualizarApellido} disabled={isSubmitting} required
                />
                {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
            </div>
            <div className="form-group col-md-6">
                <label htmlFor="inputCurp" className="form-label">CURP</label>
                <input
                    type="text" id="inputCurp" placeholder="Insertar CURP" value={curp}
                    className={`form-control ${errors.curp ? 'is-invalid' : ''}`}
                    onChange={actualizarCurp} disabled={isSubmitting} required
                />
                {errors.curp && <div className="invalid-feedback">{errors.curp}</div>}
            </div>
            <div className="form-group col-md-6">
                <label htmlFor="inputEmail" className="form-label">Email</label>
                <input
                    type="email" id="inputEmail" placeholder="Insertar email" value={email}
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    onChange={actualizarEmail} disabled={isSubmitting} required
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="form-group col-md-6">
                <label htmlFor="inputTelefono" className="form-label">Teléfono</label>
                <input
                    type="tel" id="inputTelefono" placeholder="Insertar teléfono" value={telefono}
                    className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
                    onChange={actualizarTelefono} disabled={isSubmitting} required
                />
                {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
            </div>
            <div className="form-group col-md-6">
                <label htmlFor="inputDireccion" className="form-label">Dirección</label>
                <input
                    type="text" id="inputDireccion" placeholder="Insertar dirección" value={direccion}
                    className={`form-control ${errors.direccion ? 'is-invalid' : ''}`}
                    onChange={actualizarDireccion} disabled={isSubmitting} required
                />
                {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
            </div>
            <div className="form-group col-md-6">
                <label htmlFor="inputFechaNacimiento" className="form-label">Fecha de Nacimiento</label>
                <input
                    type="date" id="inputFechaNacimiento" value={fechaNacimiento}
                    className={`form-control ${errors.fechaNacimiento ? 'is-invalid' : ''}`}
                    onChange={actualizarFechaNacimiento} disabled={isSubmitting} required
                />
                {errors.fechaNacimiento && <div className="invalid-feedback">{errors.fechaNacimiento}</div>}
            </div>


            <div className="col-12 mt-4 text-end">
                <button
                    type="button" 
                    className="btn btn-secondary me-2"
                    onClick={onCancel} 
                    disabled={isSubmitting}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <> <span className="spinner-border spinner-border-sm me-1"></span> Guardando... </>
                    ) : (
                        clienteId ? 'Actualizar' : 'Guardar'
                    )}
                </button>
            </div>
        </form>
    );
};

export default ClienteComponent;