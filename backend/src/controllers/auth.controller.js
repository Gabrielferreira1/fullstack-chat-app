import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// Registro de novo usuário
export const signup = async (req, res) => {
  const { fullName, email, password, plan } = req.body; // Agora aceitamos o plano no cadastro

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres." });
    }

    // Validação de plano, se necessário
    const allowedPlans = ["free", "paid1", "paid2"]; // Defina os planos que serão aceitos
    if (plan && !allowedPlans.includes(plan)) {
      return res.status(400).json({ message: "Plano inválido." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email já cadastrado." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Se não for passado um plano, define como "free" por padrão
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      plan: plan || "free", // Define plano padrão como "free"
    });

    await newUser.save();
    generateToken(newUser._id, res); // Define cookie JWT

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
      plan: newUser.plan, // Adiciona plano no retorno
    });
  } catch (error) {
    console.error("Erro no signup:", error.message);
    res.status(500).json({ message: "Erro interno ao registrar." });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Credenciais inválidas." });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Credenciais inválidas." });

    generateToken(user._id, res); // Gera o token JWT

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      plan: user.plan, // Adiciona plano no retorno
    });
  } catch (error) {
    console.error("Erro no login:", error.message);
    res.status(500).json({ message: "Erro interno ao fazer login." });
  }
};

// Logout
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout efetuado com sucesso." });
  } catch (error) {
    console.error("Erro no logout:", error.message);
    res.status(500).json({ message: "Erro interno ao fazer logout." });
  }
};

// Atualizar foto de perfil
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Imagem é obrigatória." });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error.message);
    res.status(500).json({ message: "Erro interno ao atualizar." });
  }
};

// Verificar autenticação
export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user); // Retorna o usuário autenticado com plano
  } catch (error) {
    console.error("Erro no checkAuth:", error.message);
    res.status(500).json({ message: "Erro interno." });
  }
};
