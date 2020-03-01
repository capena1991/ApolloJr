import Keyv from "keyv"

import { Partial } from "../type-helpers"

export class DataManager<T extends object> {
  keyv: Keyv<T>
  initializer: () => T

  constructor(keyv: Keyv<T>, initializer: () => T) {
    this.keyv = keyv
    this.initializer = initializer
  }

  get = async (userId: string) => {
    const dbData = await this.keyv.get(userId)
    return { ...this.initializer(), ...(dbData || {}) }
  }

  set = (userId: string, data: T) => this.keyv.set(userId, data)

  setPartial = async (userId: string, data: Partial<T>) => {
    const currentData = await this.get(userId)
    return this.set(userId, { ...currentData, ...data })
  }

  reset = (userId: string) => this.keyv.set(userId, this.initializer())
}
