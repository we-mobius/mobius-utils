const perf = {
  get now () {
    return Math.round(performance.now())
  }
}

const stdLineLog = (file, func, description) => {
  return `[${perf.now}][${file}] ${func}: ${description}...`
}

export { perf, stdLineLog }
