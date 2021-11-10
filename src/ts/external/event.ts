import { Data, createDataFromEvent, ReplayMediator, filterT } from '../atom/index'
import { isInWeb } from './environment'

const webEnv = isInWeb()

// ref: https://zh.javascript.info/onload-ondomcontentloaded
// ref: https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState
export const domLoadedD = webEnv ? createDataFromEvent(document, 'DOMContentLoaded')[0] : Data.empty()
export const domLoadedRD = ReplayMediator.of(domLoadedD, { autoTrigger: true })

export const windowLoadedD = webEnv ? createDataFromEvent(window, 'load')[0] : Data.empty()
export const windowLoadedRD = ReplayMediator.of(windowLoadedD, { autoTrigger: true })

export const readyStateD = webEnv ? createDataFromEvent(document, 'readystatechange', () => document.readyState)[0] : Data.empty()
export const readyStateRD = ReplayMediator.of(readyStateD, { autoTrigger: true })
if (webEnv) {
  readyStateD.triggerValue(document.readyState)
}

export const interactiveStateD = filterT(v => v === 'interactive' || v === 'complete', readyStateRD)
export const interactiveStateRD = ReplayMediator.of(interactiveStateD, { autoTrigger: true })

export const completeStateD = filterT(v => v === 'complete', readyStateRD)
export const completeStateRD = ReplayMediator.of(completeStateD, { autoTrigger: true })

export const windowResizeD = webEnv ? createDataFromEvent(window, 'resize')[0] : Data.empty()
export const windowResizeRD = ReplayMediator.of(windowResizeD, { autoTrigger: true })
if (webEnv) {
  windowResizeD.triggerValue({ type: 'resize', target: window })
}

export const windowD = webEnv ? Data.of(window) : Data.empty()
export const windowRD = ReplayMediator.of(windowD, { autoTrigger: true })

export const documentD = webEnv ? Data.of(document) : Data.empty()
export const documentRD = ReplayMediator.of(documentD, { autoTrigger: true })
