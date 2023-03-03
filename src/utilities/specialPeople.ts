import { specialPeople } from "../utilities/config"
import { Dict } from "../type-helpers"
import { chooseOne } from "./utils"

const categories: Dict<{ names: string[] }> = {
  wife: { names: ["honey", "wifey", "hon'", "babe"] },
  father: { names: ["dad", "old man"] },
  aunt: { names: ["auntie"] },
  uncle: { names: ["uncle"] },
}

export const getSpecialNickname = (userId: string, chance = 0.5) => {
  const person = specialPeople[specialPeople.findIndex(({ id }) => id === userId)]
  if (person && Math.random() < chance) {
    const allNames = person.categories.map((c) => categories[c]?.names ?? []).reduce((cum, cur) => [...cum, ...cur])
    return `, ${chooseOne(allNames)}`
  }
  return ""
}
