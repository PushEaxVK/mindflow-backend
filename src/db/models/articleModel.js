import { Schema, model } from 'mongoose';

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    desc: {
      type: String,
      required: false,
      trim: true,
    },
    article: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      default: null,
    },
    rate: {
      type: Number,
      default: 0,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const Article = model('Article', articleSchema);

export default Article;

// import mongoose from 'mongoose';

// const articleSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   img: { type: String },
//   article: { type: String, required: true },
//   author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   createdAt: { type: Date, default: Date.now },
//   tags: [{ type: String }],
//   views: { type: Number, default: 0 },
// });

// const Article = mongoose.model('Article', articleSchema);
// export default Article;
