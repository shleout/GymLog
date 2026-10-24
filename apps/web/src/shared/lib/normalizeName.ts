/** Collapses whitespace, keeps the original case: "  Жим   Лёжа " → "Жим Лёжа". */
export const cleanName = (name: string): string => name.trim().replace(/\s+/g, ' ')

/** Key for matching user-typed names: "  Жим  Лёжа " and "жим лежа" give the same key. */
export const normalizeName = (name: string): string =>
  cleanName(name).toLowerCase().replace(/ё/g, 'е')
