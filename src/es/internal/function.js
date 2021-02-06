import { hardDeepMerge } from './object.js'

// ! unnecessary
// // NOTE: call 接受不定长参数，无法进行一般柯里化
// export const call = (f, ...args) => f(...args)
// // apply :: (a -> b) -> a -> b
// ! name conflict with `apply` in functional module which has different signature
// export const apply = curry((f, args) => f(...args))

export const iife = (fn, ...args) => fn(...args)

export const once = fn => {
  let called, result
  return (...args) => {
    if (!called) {
      called = true
      result = fn(...args)
    }
    return result
  }
}

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
