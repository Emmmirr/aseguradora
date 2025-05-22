import axios from 'axios';

const RECLAMACION_API_BASE_URL = "https://4.246.104.44/api/reclamaciones";

export const obtenerTodasReclamaciones = () => {return axios.get(RECLAMACION_API_BASE_URL);};

export const obtenerReclamacionPorId = (id) => {return axios.get(`${RECLAMACION_API_BASE_URL}/${id}`);};

export const crearReclamacion = (reclamacion) => {return axios.post(RECLAMACION_API_BASE_URL, reclamacion);};

export const actualizarReclamacion = (id, reclamacion) => {return axios.put(`${RECLAMACION_API_BASE_URL}/${id}`, reclamacion);};

export const eliminarReclamacion = (id) => {return axios.delete(`${RECLAMACION_API_BASE_URL}/${id}`);};

export const obtenerReclamacionesPorPoliza = (polizaId) => {return axios.get(`${RECLAMACION_API_BASE_URL}/poliza/${polizaId}`);};

export const buscarReclamaciones = (consulta) => {return axios.get(`${RECLAMACION_API_BASE_URL}/buscar?consulta=${consulta}`);};

export const cambiarEstadoReclamacion = (id, estado) => {return axios.patch(`${RECLAMACION_API_BASE_URL}/${id}/estado?estado=${estado}`);};