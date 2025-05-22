import axios from 'axios';

const PAGO_API_BASE_URL = "/api/pagos";

export const obtenerTodosPagos = () => {return axios.get(PAGO_API_BASE_URL);};

export const obtenerPagoPorId = (id) => {return axios.get(`${PAGO_API_BASE_URL}/${id}`);};

export const crearPago = (pago) => {return axios.post(PAGO_API_BASE_URL, pago);};

export const actualizarPago = (id, pago) => {return axios.put(`${PAGO_API_BASE_URL}/${id}`, pago);};

export const eliminarPago = (id) => {return axios.delete(`${PAGO_API_BASE_URL}/${id}`);};

export const obtenerPagosPorPoliza = (polizaId) => {return axios.get(`${PAGO_API_BASE_URL}/poliza/${polizaId}`);};

export const buscarPagos = (consulta) => {return axios.get(`${PAGO_API_BASE_URL}/buscar?consulta=${consulta}`);};