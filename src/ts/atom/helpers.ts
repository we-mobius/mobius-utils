import { invoker } from '../functional'

export * from './helpers/base.helpers'

export * from './helpers/normal-create.helpers'
export * from './helpers/batch-create.helpers'
export * from './helpers/hybrid-create.helpers'
export * from './helpers/derive-create.helpers'

export * from './helpers/transform.helpers'

export * from './helpers/normal-link.helpers'
export * from './helpers/tween-link.helpers'
export * from './helpers/lift-link.helpers'
export * from './helpers/hyper-link.helpers'

export const observe = invoker(2, 'observe')
export const beObservedBy = invoker(2, 'beObservedBy')
