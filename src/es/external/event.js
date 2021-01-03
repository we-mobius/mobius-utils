import { createDataFromEvent, ReplayMediator, filterT } from '../atom/index.js'

// ref: https://zh.javascript.info/onload-ondomcontentloaded
export const domLoadedD = createDataFromEvent(document, 'DOMContentLoaded')[0]
export const domLoadedRD = ReplayMediator.of(domLoadedD, { autoTrigger: true })

export const windowLoadedD = createDataFromEvent(window, 'load')[0]
export const windowLoadedRD = ReplayMediator.of(windowLoadedD, { autoTrigger: true })

export const readyStateD = createDataFromEvent(document, 'readystatechange', () => document.readyState)[0]
export const readyStateRD = ReplayMediator.of(readyStateD, { autoTrigger: true })

export const completeStateD = filterT(v => v === 'complete', readyStateRD)
export const completeStateRD = ReplayMediator.of(completeStateD, { autoTrigger: true })
