import { of, map } from 'Libs/rx.js'

const indexPage = source => {
  return {
    DOM: of(0).pipe(map(() => {}))
  }
}

export { indexPage }
