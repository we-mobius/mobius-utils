const perf = {
  get now () {
    return Math.round(performance.now())
  }
}
exports.perf = perf

exports.stdLineLog = (file, func, description) => {
  return `[${perf.now}][${file}] ${func}: ${description}...`
}
