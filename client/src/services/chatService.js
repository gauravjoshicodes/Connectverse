import api from './api';

export const getUserChats = () => api.get('/chats');
export const createChat = (receiverId) =>
  api.post('/chats', { receiverId });
export const getMessages = (chatId, page = 1) =>
  api.get(`/messages/${chatId}?page=${page}`);
export const sendMessage = (data) => api.post('/messages', data);
export const markMessagesRead = (chatId) =>
  api.put(`/messages/read/${chatId}`);
