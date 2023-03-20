import express from "express";
import PostModel from "../models/post.model.js";
import UserModel from "../models/User.model.js";
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js";

const postRouter = express.Router();

// create a post
postRouter.post("/", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const post = await PostModel.create({
      ...req.body,
      user: req.currentUser._id,
    });

    // update the user's posts array
    await UserModel.updateOne(
      { _id: req.currentUser._id },
      { $push: { posts: post._id } }
    );

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

// get all posts
postRouter.get("/", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const posts = await PostModel.find({
      user: req.currentUser._id,
    }).populate({
      path: "user",
      select: "name",
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

// get a post by id
postRouter.get("/:id", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id).populate({
      path: "user",
      select: "name",
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

// update a post
postRouter.put("/:id", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

// delete a post
postRouter.delete("/:id", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.user.toString() !== req.currentUser._id.toString()) {
      return res.status(401).json({ error: "Unuserized" });
    }

    await post.remove();

    // update the user's posts array
    await UserModel.updateOne(
      { _id: req.currentUser._id },
      { $pull: { posts: post._id } }
    );

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

postRouter.get("/get/:stage", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const { stage } = req.params;

    const posts = await PostModel.find({
      $and: [{ user: req.currentUser._id }, { stage: stage }],
    });

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

postRouter.get(
  "/admin/all-posts",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      const allPosts = await PostModel.find({}).populate({
        path: "user",
        select: "name",
      });

      return res.status(200).json(allPosts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }
);

//unprotected routes
postRouter.get("/unprotect/:idUser", async (req, res) => {
  try {
    const posts = await PostModel.find({
      user: req.params.idUser,
    }).populate({
      path: "user",
      select: "name",
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

export default postRouter;
