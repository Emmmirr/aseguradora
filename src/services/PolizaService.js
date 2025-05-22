import axios from 'axios';

const POLIZA_API_BASE_URL = "http://164.92.93.169/api/polizas";

export const obtenerTodasPolizas = () => {return axios.get(POLIZA_API_BASE_URL);};

export const obtenerPolizaPorId = (id) => {return axios.get(`${POLIZA_API_BASE_URL}/${id}`);};

export const crearPoliza = (poliza) => {return axios.post(POLIZA_API_BASE_URL, poliza);};

export const actualizarPoliza = (id, poliza) => {return axios.put(`${POLIZA_API_BASE_URL}/${id}`, poliza);};

export const eliminarPoliza = (id) => {return axios.delete(`${POLIZA_API_BASE_URL}/${id}`);};

export const obtenerPolizasPorClienteId = (clienteId) => {return axios.get(`${POLIZA_API_BASE_URL}/cliente/${clienteId}`);};

export const obtenerPolizasPorPlanId = (planId) => {return axios.get(`${POLIZA_API_BASE_URL}/plan/${planId}`);};

export const obtenerPolizasPorEstado = (estado) => {return axios.get(`${POLIZA_API_BASE_URL}/estado/${estado}`);};

export const actualizarEstadoPoliza = (id, estado) => {return axios.patch(`${POLIZA_API_BASE_URL}/${id}/estado?estado=${estado}`);};