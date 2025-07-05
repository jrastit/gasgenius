type DatabaseField<T> =
  | keyof T
  | `++${string & keyof T}` // autoincrement field
  | `&${string & keyof T}` // unique field
  | `*${string & keyof T}` // array field
  | `[${string & keyof T}+${string & keyof T}]` // composite index

export function buildDatabaseSchema<T>(...keys: DatabaseField<T>[]): string {
  return keys.join(', ')
}
