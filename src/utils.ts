export const randInt = (min: number, max: number | undefined = undefined) => {
  if (max === undefined) {
    max = min
    min = 0
  }
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}

export const chooseOne = (values: any[]) => values[randInt(values.length)]
