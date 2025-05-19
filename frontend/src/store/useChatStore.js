import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  friends: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isFriendsLoading: false,
  friendRequests: {
    sentRequests: [],
    receivedRequests: [],
  },

  // Função para buscar todos os usuários
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Função para buscar as mensagens
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Função para enviar mensagens
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Função para se inscrever para ouvir novas mensagens
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  // Função para desinscrever-se das novas mensagens
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  // Função para selecionar um usuário
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // Função para buscar amigos
  getFriends: async () => {
    set({ isFriendsLoading: true });
    try {
      const res = await axiosInstance.get("/users/friends");
      set({ friends: res.data });
    } catch (error) {
      console.error("Erro ao buscar amigos:", error.message);
      toast.error(error.response?.data?.message || "Erro ao buscar amigos");
    } finally {
      set({ isFriendsLoading: false });
    }
  },
  

  // Função para buscar pedidos de amizade (enviados e recebidos)
  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/users/requests");
      set({ friendRequests: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Função para enviar um pedido de amizade
  sendFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/users/${userId}/add-friend`);
      toast.success("Pedido de amizade enviado!");
      get().getFriendRequests(); // Atualiza os pedidos de amizade
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Função para aceitar um pedido de amizade
  receivedRequests: [],
  getFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/users/requests");
      set({ receivedRequests: res.data.receivedRequests });
    } catch (err) {
      console.error("Erro ao buscar pedidos de amizade recebidos", err);
    }
  },
  acceptFriendRequest: async (userId) => {
    try {
      await axiosInstance.post(`/users/${userId}/accept-friend`);
      // Atualiza após aceitar
      get().getFriends();
      get().getFriendRequests();
    } catch (err) {
      console.error("Erro ao aceitar pedido de amizade", err);
    }
  },


  // Função de pesquisa de usuários
  searchUsers: async (name) => {
    if (!name) return; // Não fazer nada se o nome não for fornecido
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get(`/users/search?name=${name}`);
      set({ users: res.data }); // Atualiza a lista de usuários com o resultado da pesquisa
    } catch (error) {
      toast.error("Erro ao buscar usuários.");
    } finally {
      set({ isUsersLoading: false });
    }
  },

}));
