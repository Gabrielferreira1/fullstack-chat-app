import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js"; // Middleware de autenticação
import { sendFriendRequest, acceptFriendRequest, getFriends, getFriendRequests } from "../controllers/user.controller.js";

const router = express.Router();

// Rota para enviar pedido de amizade
router.post("/:id/add-friend", protectRoute, sendFriendRequest);

// Rota para aceitar pedido de amizade
router.post("/:id/accept-friend", protectRoute, acceptFriendRequest);

// Rota para pegar lista de amigos
router.get("/friends", protectRoute, getFriends);

// Rota para pegar pedidos de amizade recebidos e enviados
router.get("/requests", protectRoute, getFriendRequests);

export default router;
