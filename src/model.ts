export type FlexPoint = {
  hour: number
  flexMinKW: number
  flexMaxKW: number
}

type SessionDistributionRow = {
  startHour: number
  short: number
  medium: number
  long: number
  veryLong: number
}

const SESSION_DISTRIBUTION: SessionDistributionRow[] = [
  { startHour: 0, short: 0.02, medium: 0.03, long: 0.04, veryLong: 0.01 },
  { startHour: 3, short: 0.01, medium: 0.02, long: 0.03, veryLong: 0.01 },
  { startHour: 6, short: 0.01, medium: 0.01, long: 0.01, veryLong: 0.0 },
  { startHour: 9, short: 0.01, medium: 0.01, long: 0.01, veryLong: 0.0 },
  { startHour: 12, short: 0.01, medium: 0.01, long: 0.01, veryLong: 0.0 },
  { startHour: 15, short: 0.02, medium: 0.02, long: 0.01, veryLong: 0.0 },
  { startHour: 18, short: 0.03, medium: 0.04, long: 0.05, veryLong: 0.01 },
  { startHour: 19, short: 0.03, medium: 0.05, long: 0.06, veryLong: 0.02 },
  { startHour: 20, short: 0.02, medium: 0.04, long: 0.06, veryLong: 0.03 },
  { startHour: 21, short: 0.01, medium: 0.03, long: 0.05, veryLong: 0.03 },
  { startHour: 22, short: 0.01, medium: 0.02, long: 0.03, veryLong: 0.02 },
]

const BASE_CARS = 100
const POWER_PER_CAR_KW = 11

export function buildFlexBand(
  carMultiplier: number,
  hours = 24,
): FlexPoint[] {
  const totalCars = BASE_CARS * carMultiplier
  if (totalCars <= 0) {
    return Array.from({ length: hours }, (_, hour) => ({
      hour,
      flexMinKW: 0,
      flexMaxKW: 0,
    }))
  }

  const hourShares = new Array(hours).fill(0)
  const durationShares: number[][] = new Array(hours)
    .fill(null)
    .map(() => [0, 0, 0, 0]) // short, medium, long, veryLong

  SESSION_DISTRIBUTION.forEach((row) => {
    const idx = Math.max(0, Math.min(hours - 1, Math.round(row.startHour)))
    const totalRowShare =
      row.short + row.medium + row.long + row.veryLong
    if (totalRowShare <= 0) return
    hourShares[idx] += totalRowShare
    durationShares[idx][0] += row.short
    durationShares[idx][1] += row.medium
    durationShares[idx][2] += row.long
    durationShares[idx][3] += row.veryLong
  })

  const totalShare = hourShares.reduce((acc, v) => acc + v, 0)
  if (totalShare <= 0) {
    return Array.from({ length: hours }, (_, hour) => ({
      hour,
      flexMinKW: 0,
      flexMaxKW: 0,
    }))
  }

  const hourProb = hourShares.map((v) => v / totalShare)

  function makeRng(seed: number) {
    let state = seed >>> 0
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0
      return state / 2 ** 32
    }
  }

  const rng = makeRng(12345 * carMultiplier)

  const pluggedCars = new Array(hours).fill(0)

  const durationOptions = [2, 6, 10, 16]

  const hourCdf = (() => {
    const cdf = new Array(hours).fill(0)
    let acc = 0
    for (let h = 0; h < hours; h++) {
      acc += hourProb[h]
      cdf[h] = acc
    }
    return cdf
  })()

  function sampleHour() {
    const u = rng()
    for (let h = 0; h < hours; h++) {
      if (u <= hourCdf[h]) return h
    }
    return hours - 1
  }

  function sampleDurationHours(hourIdx: number) {
    const shares = durationShares[hourIdx]
    const sum = shares.reduce((acc, v) => acc + v, 0)
    if (sum <= 0) return durationOptions[0]
    const u = rng() * sum
    let acc = 0
    for (let i = 0; i < shares.length; i++) {
      acc += shares[i]
      if (u <= acc) return durationOptions[i]
    }
    return durationOptions[durationOptions.length - 1]
  }

  for (let c = 0; c < totalCars; c++) {
    const startHour = sampleHour()
    const durationH = sampleDurationHours(startHour)
    const endHour = Math.min(hours, startHour + durationH)
    for (let t = startHour; t < endHour; t++) {
      pluggedCars[t] += 1
    }
  }

  const points: FlexPoint[] = []
  for (let t = 0; t < hours; t++) {
    const cars = pluggedCars[t]
    const flexMaxKW = cars * POWER_PER_CAR_KW
    points.push({
      hour: t,
      flexMinKW: 0,
      flexMaxKW,
    })
  }
  return points
}
