export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

// eslint-disable-next-line no-unused-vars
export function notFoundHandler(err, req, res, next) {
  console.error(err);
  const title = 'Síða fannst ekki';
  res.status(404).json({ title });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error(err);
  const title = 'Villa kom upp';
  res.status(500).json({ title });
}
