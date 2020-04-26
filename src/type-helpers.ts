type Dict<T> = { [key: string]: T | undefined }

type Partial<T> = {
  [P in keyof T]?: T[P]
}

type ObjectValues<T> = T[keyof T]

export { Dict, Partial, ObjectValues }
