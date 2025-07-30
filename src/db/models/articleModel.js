import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  img: { type: String },
  article: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  tags: [{ type: String }],
  views: { type: Number, default: 0 },   
});

const Article = mongoose.model('Article', articleSchema);
export default Article;

