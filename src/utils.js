import { date } from 'quasar'

const startOfDate = (val, unit) => {
  if (unit === 'week') return date.addToDate(val, { days: -date.getDayOfWeek(val) + 1 })
  else if (unit === 'month') return date.startOfDate(val, 'month')
}

const endOfDate = (val, unit) => {
  if (unit === 'week') return date.addToDate(val, { days: 7 - date.getDayOfWeek(val) })
  else if (unit === 'month') return date.endOfDate(val, 'month')
}

const deepEqual = (obj1, obj2) => {
  let res = true
  Object.entries(obj1).forEach(([key, val]) => {
    if (!obj2[key] || obj2[key] !== val) res = false
  })
  Object.keys(obj2).forEach(key => {
    if (!obj1[key]) res = false
  })
  return res
}

export { startOfDate, endOfDate, deepEqual }
