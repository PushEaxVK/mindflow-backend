import User from '../db/models/users.js';

export const updateUserService = async (id, updateData) => {
  const updatedUser = await User.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
  return updatedUser;
};