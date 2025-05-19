import User from "../models/user.model.js";

// Enviar pedido de amizade
export const sendFriendRequest = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (id === userId) {
    return res.status(400).json({ message: "Você não pode adicionar a si mesmo como amigo." });
  }

  try {
    const user = await User.findById(userId);
    const targetUser = await User.findById(id);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    if (user.friendRequests.includes(id)) {
      return res.status(400).json({ message: "Pedido de amizade já enviado." });
    }

    if (user.friends.includes(id)) {
      return res.status(400).json({ message: "Você já é amigo deste usuário." });
    }

    user.friendRequests.push(id);
    await user.save();

    targetUser.friendRequests.push(userId);
    await targetUser.save();

    res.status(200).json({ message: "Pedido de amizade enviado." });
  } catch (error) {
    console.error("Erro ao enviar pedido de amizade:", error.message);
    res.status(500).json({ message: "Erro ao enviar pedido de amizade.", error: error.message });
  }
};

// Aceitar pedido de amizade
export const acceptFriendRequest = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (id === userId) {
    return res.status(400).json({ message: "Você não pode adicionar a si mesmo como amigo." });
  }

  try {
    const user = await User.findById(userId);
    const targetUser = await User.findById(id);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    if (!user.friendRequests.includes(id)) {
      return res.status(400).json({ message: "Nenhum pedido de amizade encontrado." });
    }

    user.friendRequests = user.friendRequests.filter((friendId) => friendId.toString() !== id);
    user.friends.push(id);
    await user.save();

    targetUser.friendRequests = targetUser.friendRequests.filter((friendId) => friendId.toString() !== userId);
    targetUser.friends.push(userId);
    await targetUser.save();

    res.status(200).json({ message: "Pedido de amizade aceito." });
  } catch (error) {
    console.error("Erro ao aceitar pedido de amizade:", error.message);
    res.status(500).json({ message: "Erro ao aceitar pedido de amizade.", error: error.message });
  }
};

// Obter lista de amigos
export const getFriends = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate("friends", "fullName profilePic");

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Erro ao obter lista de amigos:", error.message);
    res.status(500).json({ message: "Erro ao obter lista de amigos.", error: error.message });
  }
};

// Obter pedidos de amizade recebidos e enviados
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("friendRequests", "fullName profilePic")
      .lean();

    const allUsers = await User.find({ _id: { $ne: userId } }).select("fullName profilePic").lean();

    const sentRequests = allUsers.filter(u =>
      u.friendRequests?.some(req => req.toString() === userId.toString())
    );

    res.status(200).json({
      receivedRequests: user.friendRequests,
      sentRequests,
    });
  } catch (error) {
    console.error("Erro ao buscar pedidos de amizade:", error.message);
    res.status(500).json({ message: "Erro ao buscar pedidos de amizade.", error: error.message });
  }
};
