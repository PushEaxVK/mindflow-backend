import Article from '../db/models/articleModel.js';
import User from '../db/models/users.js';

export const getArticleById = async (id) => {
  return await Article.findById(id).populate('author', 'name');
};

export const getRecommendedArticles = async (tags = []) => {
  return await Article.find({ tags: { $in: tags } }).limit(5);
};

export const getAllArticles = async () => {
  return await Article.find();
};

export const getSavedArticles = async (userId) => {
  const user = await User.findById(userId).populate('savedArticles');
  return user?.savedArticles || [];
};

export const getPopularArticles = async (limit = 10) => {
  return await Article.find().sort({ views: -1 }).limit(limit);
};

export const getPaginatedArticles = async ({
  page = 1,
  limit = 10,
  sort = 'createdAt',
  order = 'desc',
  tags,
  author,
}) => {
  const query = {};
  if (tags) {
    query.tags = { $in: tags.split(',') };
  }
  if (author) {
    query.author = author;
  }

  const skip = (page - 1) * limit;
  const sortObj = { [sort]: order === 'asc' ? 1 : -1 };

  const [articles, total] = await Promise.all([
    Article.find(query)
      .populate('author', 'name')
      .sort(sortObj)
      .skip(Number(skip))
      .limit(Number(limit)),
    Article.countDocuments(query),
  ]);

  return {
    articles,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  };
};
