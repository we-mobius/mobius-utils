import { Data, createDataFromEvent, ReplayMediator, filterT } from '../atom/index.js'

// ref: https://zh.javascript.info/onload-ondomcontentloaded
// ref: https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState
export const domLoadedD = createDataFromEvent(document, 'DOMContentLoaded')[0]
export const domLoadedRD = ReplayMediator.of(domLoadedD, { autoTrigger: true })

export const windowLoadedD = createDataFromEvent(window, 'load')[0]
export const windowLoadedRD = ReplayMediator.of(windowLoadedD, { autoTrigger: true })

export const readyStateD = createDataFromEvent(document, 'readystatechange', () => document.readyState)[0]
export const readyStateRD = ReplayMediator.of(readyStateD, { autoTrigger: true })
readyStateD.triggerValue(document.readyState)

export const interactiveStateD = filterT(v => v === 'interactive' || v === 'complete', readyStateRD)
export const interactiveStateRD = ReplayMediator.of(interactiveStateD, { autoTrigger: true })

export const completeStateD = filterT(v => v === 'complete', readyStateRD)
export const completeStateRD = ReplayMediator.of(completeStateD, { autoTrigger: true })

export const windowResizeD = createDataFromEvent(window, 'resize')[0]
export const windowResizeRD = ReplayMediator.of(windowResizeD, { autoTrigger: true })
windowResizeD.triggerValue({ type: 'resize', target: window })

export const windowD = Data.of(window)
export const windowRD = ReplayMediator.of(windowD, { autoTrigger: true })

export const documentD = Data.of(document)
export const documentRD = ReplayMediator.of(documentD, { autoTrigger: true })
