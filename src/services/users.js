import ArticlesCollection  from '../db/models/articleModel.js';
import  UsersCollection  from '../db/models/users.js';

export const getUserById = async (userId) => {
  return UsersCollection.findById(userId).select('-password');
};

export const getUserArticles = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const articles = await ArticlesCollection.find({ author: userId })
    .populate('author', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await ArticlesCollection.countDocuments({ author: userId });

  return {
    articles,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
