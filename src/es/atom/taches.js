/**
 * one to one:
 *   -> change value
 *   -> schedule emit
 * two to one:
 *   -> as config:
 *     -> emit what
 *     -> when to emit
 *   -> as partner:
 *     -> how to combine
 * many to one:
 *   -> as config:
 *     -> emit what
 *     -> when to emit
 *   -> as partner:
 *     -> how to combine
 */

export * from './taches/transform.taches.js'
export * from './taches/setTo.taches.js'
export * from './taches/nilToVoid.taches.js'

// one to one
export * from './taches/defaultTo.taches.js'
export * from './taches/pluck.taches.js'
export * from './taches/map.taches.js'
export * from './taches/filter.taches.js'
export * from './taches/startWith.taches.js'
export * from './taches/debounce.taches.js'
export * from './taches/throttle.taches.js'

export * from './taches/withHistory.taches.js'

// two to one
export * from './taches/switch.taches.js'

export * from './taches/distinctPrevious.taches.js'
export * from './taches/distinctEver.taches.js'
export * from './taches/skip.taches.js'
export * from './taches/skipUntil.taches.js'
export * from './taches/skipWhile.taches.js'
export * from './taches/take.taches.js'
export * from './taches/takeUntil.taches.js'
export * from './taches/takeWhile.taches.js'

// many to one
export * from './taches/iif.taches.js'
export * from './taches/case.taches.js'

export * from './taches/combineLatest.taches.js'
export * from './taches/merge.taches.js'
export * from './taches/zip.taches.js'
export * from './taches/withLatestFrom.taches.js'

// utils
export * from './taches/tap.taches.js'

// business
export * from './taches/effect.taches.js'
