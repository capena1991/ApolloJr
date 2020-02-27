type Dict<T> = { [key: string]: T | undefined }

type Partial<T> = {
  [P in keyof T]?: T[P]
}

export { Dict, Partial }
