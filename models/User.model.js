import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, match: /^[a-zA-Z ]+$/ },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      /* match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, */
    },

    phone: {
      type: String,
      required: true,
    },

    passwordHash: { type: String /* required: true */ },
    resetPassword: { type: String, default: "" },

    userIsActive: { type: Boolean, default: true },

    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],

    photo: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYE2EOfj-iQsL0fUlsZ1GxmRBpN0XJhpVZ3UEZi1Q8SBGkseVjrlwl4IO7aOTraRAeClU&usqp=CAU",
    },

    role: {
      type: String,
      enum: ["ADMIN", "USER"],
      required: true,
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", UserSchema);

export default UserModel;
