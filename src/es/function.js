import { hardDeepMerge } from './object.js'

export const debounce = (fn, ms) => {
  let timer
  let waiting = []
  return () => {
    clearTimeout(timer)
    timer = setTimeout(async () => {
      const res = await fn()
      waiting.forEach(fn => {
        fn(res)
      })
      waiting = []
    }, ms)
    return new Promise(resolve => {
      waiting.push(resolve)
    })
  }
}

export const throttle = (fn) => {
  let isCalling = false
  let waiting = []
  return () => {
    if (!isCalling) {
      isCalling = true
      Promise.resolve(fn()).then(res => {
        waiting.forEach(waitFn => {
          waitFn(res)
        })
        waiting = []
        isCalling = false
      })
    }
    return new Promise(resolve => {
      waiting.push(resolve)
    })
  }
}

export const throttleTime = (fn, ms) => {
  let isCalling = false
  let waiting = []
  return () => {
    if (!isCalling) {
      isCalling = true
      Promise.resolve(fn()).then(res => {
        waiting.forEach(waitFn => {
          waitFn(res)
        })
        waiting = []
      })
      setTimeout(() => {
        isCalling = false
      }, ms)
    }
    return new Promise(resolve => {
      waiting.push(resolve)
    })
  }
}

export const packing = (fn, range) => {
  let timer
  let waiting = []
  let data = {}
  return (oData) => {
    clearTimeout(timer)
    data = hardDeepMerge(data, oData)
    timer = setTimeout(async () => {
      const res = await fn(data)
      waiting.forEach(waitFn => {
        waitFn(res)
      })
      waiting = []
    }, range)
    return new Promise(resolve => {
      waiting.push(resolve)
    })
  }
}
