import Keyv from "keyv"

import { isDev } from "../utilities/config"
import { Partial } from "../type-helpers"

export const defaultDB = isDev() ? "sqlite://data/data.sqlite" : undefined

export class DataManager<T> {
  keyv: Keyv<T>
  initializer: () => T

  constructor(keyv: Keyv<T>, initializer: () => T) {
    this.keyv = keyv
    this.initializer = initializer
  }

  get = async (id: string) => {
    const dbData = await this.keyv.get(id)
    return { ...this.initializer(), ...(dbData || {}) }
  }

  set = (id: string, data: T) => this.keyv.set(id, data)

  setPartial = async (id: string, data: Partial<T>) => {
    const currentData = await this.get(id)
    return this.set(id, { ...currentData, ...data })
  }

  reset = (id: string) => this.keyv.delete(id)
}
