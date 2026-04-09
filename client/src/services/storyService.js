import api from './api';

export const getStories = () => api.get('/stories');
export const createStory = (formData) =>
  api.post('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const viewStory = (id) => api.put(`/stories/${id}/view`);
export const deleteStory = (id) => api.delete(`/stories/${id}`);
