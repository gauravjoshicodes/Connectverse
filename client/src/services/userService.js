import api from './api';

export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, formData) =>
  api.put(`/users/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const followUser = (id) => api.put(`/users/${id}/follow`);
export const searchUsers = (query) => api.get(`/users/search?q=${query}`);
export const getSuggestions = () => api.get('/users/suggestions');
export const savePost = (postId) => api.put(`/users/save/${postId}`);
export const getFollowers = (id) => api.get(`/users/${id}/followers`);
export const getFollowing = (id) => api.get(`/users/${id}/following`);
export const updateProfile = (formData) => 
  api.put('/users/update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
