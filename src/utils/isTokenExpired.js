export const isTokenExpired = (exp) => {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime >= exp;
};
