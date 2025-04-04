type Id = number | string;
const isNumber = (o?: unknown): o is number =>
  o !== undefined && o !== null && typeof o === 'number' && !Number.isNaN(o);

// In the TMS ids are integers, this function is for parsing string ids back to TMS compatible ids
export const normalizeId = (id: Id): Id => {
  if (isNumber(id)) return id;
  const p = parseInt(id, 10);
  if (isNaN(p)) return id;
  if (`${p}`.length !== id.length) return id;
  return p;
};
