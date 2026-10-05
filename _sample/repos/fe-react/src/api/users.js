import api from './client';
export const fetchUsers = (params) => api.get('/users', { params });
export const fetchUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const deleteUser = (user) => api.delete(`/users/${user.id}`);
