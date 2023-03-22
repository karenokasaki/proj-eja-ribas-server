//importar o express
import { Router } from "express";

// instanciar as rotas pegando do express
const router = Router();

import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";

import { uploadImg, cloudinaryInst } from "../config/cloudinary.config.js";

// Rota para enviar um arquivo de imagem.
// O arquivo é enviado ao cloudinary, e retorna um link que será enviado ao server

router.post(
  "/pdf",
  isAuth,
  attachCurrentUser,
  uploadImg.single("file"),
  (req, res) => {
    const loggedUser = req.currentUser;

    // Verifica se a conta do usuário está ativa.
    if (!loggedUser.userIsActive) {
      return res.status(404).json({ msg: "User disable account." });
    }

    // Verifica se há um arquivo na request
    if (!req.file) {
      return res.status(500).json({ message: "Upload failed" });
    }

    return res.status(201).json({ url: req.file.path });
  }
);

router.post(
  "/",
  isAuth,
  attachCurrentUser,
  uploadImg.single("picture"),
  (req, res) => {
    const loggedUser = req.currentUser;

    // Verifica se a conta do usuário está ativa.
    if (!loggedUser.userIsActive) {
      return res.status(404).json({ msg: "User disable account." });
    }

    // Verifica se há um arquivo na request
    if (!req.file) {
      return res.status(500).json({ message: "Upload failed" });
    }

    return res.status(201).json({ url: req.file.path });
  }
);

router.delete("/delete-image/:publicId", async (req, res) => {
  const { publicId } = req.params;

  try {
    // delete the image from Cloudinary
    const response = await cloudinaryInst.uploader.destroy(
      `eja-ribas/${publicId}`,
      {
        invalidate: true,
      }
    );
    console.log(response);
    res.status(200).json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
});

export default router;
