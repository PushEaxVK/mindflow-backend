export default function ctrlWrapper(controller) {
  return async function wrappedController(req, res, next) {
    try {
      await controller(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}
