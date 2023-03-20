import express from "express";
import bcrypt from "bcrypt";

import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js";
import generateToken from "../config/jwt.config.js";
import userModel from "../models/User.model.js";
import UserModel from "../models/User.model.js";

const router = express.Router();
const saltRounds = 10;

// Rota para criar um novo usuário
router.post("/sign-up", async (req, res) => {
  try {
    const { password } = req.body;

    if (
      !password ||
      !password.match(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#_!])[0-9a-zA-Z$*&@#_!]{8,}$/
      )
    ) {
      // retorna Bad Request
      return res.status(400).json({
        msg: "Password is required and must have at least 8 characters, uppercase and lowercase letters, numbers and special characters.",
      });
    }

    // geração de salts e password criptografada
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userModel.create({
      ...req.body,
      passwordHash: hashedPassword,
    });
    // Deleta o password e a versão no retorno da atualização
    delete newUser._doc.passwordHash;
    delete newUser._doc.__v;

    //log usuario foi criado

    // retorna success para criação de um novo usuário
    return res.status(201).json(newUser._doc);
  } catch (error) {
    // retorna Internal Server Error

    return res.status(450).json({ msg: error.message });
  }
});

// Rota de Login
router.post("/login", async (req, res) => {
  try {
    // extrai o email e password da requisição do usuário.
    const { email, password } = req.body;

    // pesquisa o usuário no banco pelo email
    const user = await userModel.findOne({ email });

    // Verificar se existe o usuário no nosso banco de dados.
    if (!user) {
      // Retorna Bad Request
      return res
        .status(400)
        .json({ msg: "This email is not yet registered in our website!" });
    }

    // Verificar se a senha digitada pelo usuário é igual ao do banco de dados
    if (await bcrypt.compare(password, user.passwordHash)) {
      // Geração do token de acesso
      const token = generateToken(user);

      // Retorna success a tentativa de login
      return res.status(200).json({
        user: {
          name: user.name,
          email: user.email,
          _id: user._id,
          role: user.role,
        },
        token,
      });
    } else {
      // Retorna unauthorized
      return res.status(401).json({ msg: "Wrong password or email" });
    }
  } catch (error) {
    // Retorna Internal Server Error
    return res.status(500).json({ msg: error.message });
  }
});

// Rota para buscar usuário
router.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedUser = req.currentUser;

    // Verifica se a conta do usuário está ativa.
    if (!loggedUser.userIsActive) {
      return res.status(404).json({ msg: "User disable account." });
    }

    const populateUser = await userModel
      .findById(loggedUser._id, {
        passwordHash: 0,
        __v: 0,
      })
      .populate("posts");

    // Retorna success quando o usuário esta logado
    return res.status(200).json(populateUser);
  } catch (error) {
    // Retorna Internal Server Error
    return res.status(500).json({ msg: error.message });
  }
});

// Rota de atualização usuário
// Verifica se o usuário esta logado para fazer a atualização através do ID
router.put("/profile/update", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedUser = req.currentUser;

    // Verifica se a conta do usuário está ativa.
    if (!loggedUser.userIsActive) {
      return res.status(404).json({ msg: "User disable account." });
    }

    const updateUser = await userModel.findOneAndUpdate(
      { _id: loggedUser._id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    // Deleta o password e a versão no retorno da atualização
    delete updateUser._doc.passwordHash;
    delete updateUser._doc.__v;

    return res.status(200).json(updateUser);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
});

// Rota para um soft delete do usuário
// Verifica se o usuário esta logado, identifica o ID e "deleta" do banco de dados.
router.delete(
  "/profile/disable-account",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedUser = req.currentUser;

      const disableUser = await userModel.findOneAndUpdate(
        { _id: loggedUser._id },
        { userIsActive: false },
        { new: true }
      );

      // Deleta o password e a versão no retorno da atualização
      delete disableUser._doc.passwordHash;
      delete disableUser._doc.__v;

      return res.status(200).json(disableUser);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
);

// Rota active account
router.put(
  "/profile/active-account",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedUser = req.currentUser;

      const activeUser = await userModel.findOneAndUpdate(
        { _id: loggedUser._id },
        { userIsActive: true },
        { new: true, runValidators: true }
      );

      // Deleta o password e a versão no retorno da atualização
      delete activeUser._doc.passwordHash;
      delete activeUser._doc.__v;

      return res.status(200).json(activeUser);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
);

//ADMIN
router.get(
  "/admin/all-users",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      const allUsers = await UserModel.find({}, { passwordHash: 0 });

      return res.status(200).json(allUsers);
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  }
);

export default router;
