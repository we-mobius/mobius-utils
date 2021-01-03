import { curry } from '../functional.js'

export const perf = {
  get now () {
    return Math.round(performance.now())
  }
}

export const stdLineLog = curry((file, fnName, description) => `[${perf.now}][${file}] ${fnName}: ${description}...`)
export const makeTigerLogger = textGen => (text, appends) => console.log(textGen(text || ''), appends || '')
export const makeLinedTigerLogger = (file, fileName) => makeTigerLogger(stdLineLog(file, fileName))

// @ref: https://mostly-adequate.gitbooks.io/mostly-adequate-guide/content/appendix_a.html
// inspect :: a -> String
export const inspect = (x) => {
  if (x && typeof x.inspect === 'function') {
    return x.inspect()
  }

  function inspectFn (f) {
    return f.name ? f.name : f.toString()
  }

  function inspectTerm (t) {
    switch (typeof t) {
      case 'string':
        return `'${t}'`
      case 'object': {
        const ts = Object.keys(t).map(k => [k, inspect(t[k])])
        return `{${ts.map(kv => kv.join(': ')).join(', ')}}`
      }
      default:
        return String(t)
    }
  }

  function inspectArgs (args) {
    return Array.isArray(args) ? `[${args.map(inspect).join(', ')}]` : inspectTerm(args)
  }

  return (typeof x === 'function') ? inspectFn(x) : inspectArgs(x)
}
