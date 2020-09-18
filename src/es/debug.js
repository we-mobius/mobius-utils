const perf = {
  get now () {
    return Math.round(performance.now())
  }
}

const stdLineLog = (file, fnName, description) => `[${perf.now}][${file}] ${fnName}: ${description}...`

export { perf, stdLineLog }
