import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true, trim: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        text: { type: String, required: true, trim: true, maxlength: 500 }
    },
    { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);