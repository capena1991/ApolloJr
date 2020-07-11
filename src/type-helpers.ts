type Dict<T> = { [key: string]: T | undefined }
type SparseArray<T> = { [key: number]: T | undefined }

type Partial<T> = {
  [P in keyof T]?: T[P]
}

type ObjectValues<T> = T[keyof T]

export { Dict, SparseArray, Partial, ObjectValues }
