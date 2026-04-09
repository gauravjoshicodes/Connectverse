import api from './api';

export const getTimeline = (page = 1) =>
  api.get(`/posts/timeline?page=${page}`);

export const createPost = (formData) =>
  api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deletePost = (id) => api.delete(`/posts/${id}`);

export const likePost = (id) => api.put(`/posts/${id}/like`);

export const commentOnPost = (id, text) =>
  api.post(`/posts/${id}/comment`, { text });

export const getUserPosts = (userId) => api.get(`/posts/user/${userId}`);
