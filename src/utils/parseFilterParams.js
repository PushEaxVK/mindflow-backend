const parseIsSaved = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

export const parseFilterParams = (query) => {
  return {
    isSaved: parseIsSaved(query.isSaved),
  };
};
