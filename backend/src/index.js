// src/index.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import userRoutes from "./routes/user.route.js"; // Rota de usuários
import { app, server } from "./lib/socket.js";  // Configuração do Socket.io

dotenv.config();  // Carrega as variáveis de ambiente

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();  // Resolve o caminho correto para arquivos estáticos

// Middlewares
app.use(express.json()); // Para lidar com requisições JSON
app.use(cookieParser()); // Para manipulação de cookies
app.use(
  cors({
    origin: "http://localhost:5173",  // Frontend (ajuste conforme necessário)
    credentials: true,  // Habilita credenciais para cookies
  })
);

// Rotas de API
app.use("/api/auth", authRoutes);  // Rota de autenticação
app.use("/api/messages", messageRoutes);  // Rota de mensagens
app.use("/api/users", userRoutes);  // Rota de usuários (amigos)

// Rota de produção (caso esteja em produção, serve arquivos estáticos)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Inicialização do servidor Socket.io
server.listen(PORT, () => {
  console.log("✅ Servidor rodando na porta: " + PORT);
  connectDB();  // Conecta ao banco de dados
});
