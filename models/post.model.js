import { Schema, model } from "mongoose";

const PostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    areaOfKnowledge: {
      type: String,
      enum: [
        "linguagens",
        "ciências humanas",
        "ciências da natureza",
        "matemática",
      ],
      required: true,
    },
    theme: { type: String, required: true },
    description: { type: String, required: true },
    photos: [{ type: String }],
    stage: {
      type: String,
      enum: ["1", "2", "3", "4"],
    },
    visible: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const PostModel = model("Post", PostSchema);

export default PostModel;
