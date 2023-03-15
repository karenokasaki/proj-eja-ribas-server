import UserModel from "../models/User.model.js";

async function attachCurrentUser(req, res, next) {
  try {
    //captura as informações que estão dentro do req.auth
    const userData = req.auth;

    const user = await UserModel.findById(userData._id, { passwordHash: 0 });

    if (!user) {
      return res.status(400).json({ msg: "Usuário não encontrado" });
    }

    req.currentUser = user;

    //if user is disable AND its not trying to active account
    if (!user.userIsActive && !req.path === "/profile/active-account") {
      return res.status(404).json({ msg: "User disable account." });
    }

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

export default attachCurrentUser;
