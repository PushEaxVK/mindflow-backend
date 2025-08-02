import { Schema, model } from 'mongoose';

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 128,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    imageUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

articleSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

export const ArticlesCollection = model('articles', articleSchema);
