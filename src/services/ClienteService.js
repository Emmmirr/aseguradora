import axios from 'axios';

const CLIENTE_API_BASE_URL = "/api/clientes";

export const obtenerTodosClientes = () => {return axios.get(CLIENTE_API_BASE_URL);};

export const obtenerClientePorId = (id) => {return axios.get(`${CLIENTE_API_BASE_URL}/${id}`);};

export const crearCliente = (cliente) => {return axios.post(CLIENTE_API_BASE_URL, cliente);};

export const actualizarCliente = (id, cliente) => {return axios.put(`${CLIENTE_API_BASE_URL}/${id}`, cliente);};

export const eliminarCliente = (id) => {return axios.delete(`${CLIENTE_API_BASE_URL}/${id}`);};

export const buscarClientes = (consulta) => {return axios.get(`${CLIENTE_API_BASE_URL}/buscar?consulta=${consulta}`);};

export const obtenerClientesPorEstado = (estado) => {return axios.get(`${CLIENTE_API_BASE_URL}/estado/${estado}`);};

export const actualizarEstadoCliente = (id, estado) => {return axios.patch(`${CLIENTE_API_BASE_URL}/${id}/estado?estado=${estado}`);};