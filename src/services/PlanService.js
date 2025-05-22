import axios from 'axios';

const PLAN_API_BASE_URL = "/api/planes";

export const obtenerTodosPlanes = () => {return axios.get(PLAN_API_BASE_URL);};

export const obtenerPlanPorId = (id) => {return axios.get(`${PLAN_API_BASE_URL}/${id}`);};

export const crearPlan = (plan) => {return axios.post(PLAN_API_BASE_URL, plan);};

export const actualizarPlan = (id, plan) => {return axios.put(`${PLAN_API_BASE_URL}/${id}`, plan);};

export const eliminarPlan = (id) => {return axios.delete(`${PLAN_API_BASE_URL}/${id}`);};

export const obtenerPlanesPorTipoCobertura = (tipoCobertura) => {return axios.get(`${PLAN_API_BASE_URL}/cobertura/${tipoCobertura}`);};

export const obtenerPlanesPorEstado = (estado) => {return axios.get(`${PLAN_API_BASE_URL}/estado/${estado}`);};