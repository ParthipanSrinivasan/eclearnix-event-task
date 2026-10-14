/** Escapes user input for safe use inside a RegExp (prevents regex injection). */
export function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function searchFilter(search, fields) {
  if (!search) return {};
  const pattern = new RegExp(escapeRegex(search), "i");
  return { $or: fields.map((field) => ({ [field]: pattern })) };
}

export async function paginate(model, filter, { page, limit, sort, populate }) {
  let query = model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
  if (populate) query = query.populate(populate);
  const [items, total] = await Promise.all([query, model.countDocuments(filter)]);
  return { items, page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) };
}
