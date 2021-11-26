import { TERMINATOR, isTerminator } from './metas'
import { Data, Mutation } from './atoms'
import { pipeAtom } from './helpers'
import { ReplayMediator } from './mediators'

//   鼠标点击   -->--->--   坐标数据   -->--->--   积   -->--->--   Console
//      |          |          |          |        |       |          |
//    Void       ClickM     CordD       ProdM    ProdD  ConsoleM    Void

let time = 0
const clickM = Mutation.of(() => {
  time += 1
  if (time > 3) return TERMINATOR
  console.warn('clickM:' + time)
  return [Math.random(), Math.random()]
})

const cordD = Data.of([0, 0])

const prodM = Mutation.ofLiftBoth((cord) => {
  console.warn(`prodM: ${JSON.stringify(cord)}`)
  console.info(isTerminator(cord))
  const [val0, val1] = cord
  return val0 * val1
})

const prodD = Data.of(2)

const consoleM = Mutation.ofLiftBoth((prod, cur, extra) => {
  console.info(prod)
  console.info(cur)
  console.info(extra)
  return 'hello:' + prod * cur
})

const resD = Data.of(0)

// cordD.observe(clickM)
// prodM.observe(cordD)
// prodD.observe(prodM)
// consoleM.observe(prodD)
// resD.observe(consoleM)
// clickM.observe(resD)
// resD.subscribe(res => {
//   console.info(res)
// })
// clickM.trigger()

// clickM.beObservedBy(cordD)
// cordD.beObservedBy(prodM)
// prodM.beObservedBy(prodD)
// prodD.beObservedBy(consoleM)
// consoleM.beObservedBy(resD)
// resD.beObservedBy(clickM)
// clickM.trigger()

// pipeAtom(clickM, cordD, prodM, prodD, consoleM, resD, clickM)
// clickM.trigger()

// pipeAtom(
//   clickM,
//   [
//     [cordD, prodM, prodD, consoleM, resD],
//     [
//       cordD, prodM,
//       [
//         [prodD, consoleM],
//         [prodD, consoleM]
//       ],
//       resD
//     ]
//   ],
//   clickM
// )
// clickM.trigger()

// consoleM.mutator.run({ value: 12 }, 'extra args')

const clickMM = ReplayMediator.of(clickM)
clickM.trigger()

// prodD.observe(prodM)
// prodM.observe(cordD)
// cordD.observe(clickMM)

prodM.beObservedBy(prodD)
cordD.beObservedBy(prodM)
clickMM.beObservedBy(cordD)
