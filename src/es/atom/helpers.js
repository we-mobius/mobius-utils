import { invoker } from '../functional.js'

export * from './helpers/base.helpers.js'

export * from './helpers/normal-create.helpers.js'
export * from './helpers/batch-create.helpers.js'
export * from './helpers/hybrid-create.helpers.js'
export * from './helpers/derive-create.helpers.js'

export * from './helpers/transform.helpers.js'

export * from './helpers/normal-link.helpers.js'
export * from './helpers/tween-link.helpers.js'
export * from './helpers/lift-link.helpers.js'
export * from './helpers/hyper-link.helpers.js'

export const observe = invoker(2, 'observe')
export const beObservedBy = invoker(2, 'beObservedBy')
