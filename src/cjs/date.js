const UNITS_DICT = {
  year: '年', month: '月', week: '周', day: '天', hour: '小时', minute: '分钟', second: '秒', millisecond: '毫秒'
}
const UNITS_MILLI_DICT = {
  year: 31557600000,
  month: 2629800000,
  week: 604800000,
  day: 86400000,
  hour: 3600000,
  minute: 60000,
  second: 1000,
  millisecond: 1
}

exports.humanize = timestamp => {
  let res = ''
  const milliseconds = +new Date() - timestamp
  for (const key in UNITS_MILLI_DICT) {
    if (milliseconds >= UNITS_MILLI_DICT[key]) {
      res = `${Math.floor(milliseconds / UNITS_MILLI_DICT[key])} ${UNITS_DICT[key]}前`
      break
    }
  }
  return res || '刚刚'
}
