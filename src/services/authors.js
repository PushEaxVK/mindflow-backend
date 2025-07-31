import Article from '../db/models/articleModel.js';
import User from '../db/models/users.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAuthorById = async ({ authorId, currentUserId, query }) => {
  const isOwnProfile = currentUserId === authorId;
  const {
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    perPage = 10,
    isSaved,
  } = query;
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const savedOnly = String(isSaved) === 'true';

  const author = await User.findById(authorId).select('name avatarUrl');
  if (!author) throw new Error('Author not found');

  const authoredTotal = await Article.countDocuments({ author: authorId });

  if (isOwnProfile && savedOnly) {
    const userWithSaved = await User.findById(authorId).populate({
      path: 'savedArticles',
      populate: { path: 'author', select: 'name avatarUrl' },
      options: { sort: { [sortBy]: sortDirection } },
    });

    const savedAll = userWithSaved.savedArticles.filter(
      (article) => article.author._id.toString() !== authorId,
    );

    const total = savedAll.length;
    const start = (page - 1) * perPage;
    const paginated = savedAll.slice(start, start + perPage);

    return {
      authorId,
      isOwnProfile,
      name: author.name,
      avatarUrl: author.avatarUrl || null,
      authoredTotal,
      createdArticles: [],
      savedArticles: paginated,
      pagination: calculatePaginationData(total, page, perPage),
    };
  }

  const filter = { author: authorId };
  const total = await Article.countDocuments(filter);
  const articles = await Article.find(filter)
    .populate('author', 'name avatarUrl')
    .sort({ [sortBy]: sortDirection })
    .skip((page - 1) * perPage)
    .limit(perPage);

  return {
    authorId,
    isOwnProfile,
    name: author.name,
    avatarUrl: author.avatarUrl || null,
    authoredTotal,
    createdArticles: articles,
    savedArticles: [],
    pagination: calculatePaginationData(total, page, perPage),
  };
};
