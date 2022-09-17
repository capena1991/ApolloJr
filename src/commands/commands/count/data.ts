import { DateTime } from "luxon"

import { archiveCurrent, counting, CountingRound, getCurrent, setCurrent } from "../../../data/countingData"
import { UserData, users } from "../../../data/userData"

export interface PlayData {
  currentRound: CountingRound
  userId: string
  user: UserData
  countSign: number
}

export const getPlayData = async (userId: string, count: number): Promise<PlayData> => {
  const currentRound = await getCurrent()
  const user = await users.get(userId)

  const countSign = Math.sign(count - currentRound.count)

  return { currentRound, userId, user, countSign }
}

export const savePlayData = ({ currentRound, userId, user }: PlayData) =>
  Promise.all([setCurrent(currentRound), users.set(userId, user)])

const addUserCount = (user: UserData, datetime: DateTime): UserData => ({
  ...user,
  counting: {
    ...user.counting,
    lastCounts: [{ datetime: datetime.toISO() }, ...user.counting.lastCounts].slice(0, 5),
  },
})

const addRoundCount = (round: CountingRound, userId: string, datetime: DateTime): CountingRound => ({
  ...round,
  last: { user: userId, datetime: datetime.toISO() },
})

export const addCountEntries = (
  { currentRound, userId, user, countSign }: PlayData,
  datetime: DateTime,
  {
    addRoundCountEntry = true,
    addUserCountEntry = true,
  }: { addRoundCountEntry: boolean; addUserCountEntry: boolean } = {
    addRoundCountEntry: true,
    addUserCountEntry: true,
  },
): PlayData => ({
  currentRound: addRoundCountEntry ? addRoundCount(currentRound, userId, datetime) : currentRound,
  user: addUserCountEntry ? addUserCount(user, datetime) : user,
  userId,
  countSign,
})

export const addContribution = (
  playData: PlayData,
  { positive, negative }: { positive: number; negative: number },
): PlayData => {
  const { p, n } = playData.currentRound.contributions[playData.userId] ?? { p: 0, n: 0 }
  return {
    ...playData,
    currentRound: {
      ...playData.currentRound,
      contributions: {
        ...playData.currentRound.contributions,
        [playData.userId]: { p: p + positive, n: n + negative },
      },
    },
  }
}

export const setCount = (playData: PlayData, count: number): PlayData => ({
  ...playData,
  currentRound: { ...playData.currentRound, count },
})

export const archiveCurrentRound = async (playData: PlayData): Promise<PlayData> => ({
  ...playData,
  currentRound: await archiveCurrent(playData.currentRound),
})

export const grantRewards = async (
  playData: PlayData,
  rewards: { user: string; reward: number }[],
): Promise<PlayData> => {
  const otherUsersRewards = rewards.filter(({ user }) => user !== playData.userId)
  await Promise.all(
    otherUsersRewards.map(async ({ user, reward }) => {
      const { money, ...rest } = await users.get(user)
      return users.set(user, { money: money + reward, ...rest })
    }),
  )

  const currentUserReward = rewards.find(({ user }) => user === playData.userId)
  if (!currentUserReward) {
    return playData
  }
  return {
    ...playData,
    user: { ...playData.user, money: playData.user.money + currentUserReward.reward },
  }
}

export const getPreviousRoundsSummary = async () => {
  const { roundNumber } = await getCurrent()
  const previousRounds = await Promise.all([...new Array(roundNumber)].map((i) => counting.get(`${i}`)))
  const positiveWins = previousRounds.filter(({ count }) => count === 100).length
  const negativeWins = previousRounds.filter(({ count }) => count === -100).length
  return { positiveWins, negativeWins }
}
