import { Data, createDataFromEvent, ReplayMediator, filterT } from '../../atom'
import { isInWebEnvironment } from '../environment'

import type { SynthesizeEvent } from '../../@types'

export type SyntheticDocumentEvent = SynthesizeEvent<Document>
export type SyntheticWindowEvent = SynthesizeEvent<Window & typeof globalThis>

const webEnv = isInWebEnvironment()

// @refer https://zh.javascript.info/onload-ondomcontentloaded
// @refer https://developer.mozilla.org/en-US/docs/Web/API/Document/readyState

export const domLoadedD = webEnv
  ? createDataFromEvent({ target: document, type: 'DOMContentLoaded' })[0]
  : Data.empty<SyntheticDocumentEvent>()
export const domLoadedRD = ReplayMediator.of(domLoadedD, { autoTrigger: true })
domLoadedD.setOptions('isAsync', true)

export const windowLoadedD = webEnv
  ? createDataFromEvent({ target: window, type: 'load' })[0]
  : Data.empty<SyntheticWindowEvent>()
export const windowLoadedRD = ReplayMediator.of(windowLoadedD, { autoTrigger: true })
windowLoadedD.setOptions('isAsync', true)

export const readyStateD = webEnv
  ? createDataFromEvent({ target: document, type: 'readystatechange', handler: () => document.readyState })[0]
  : Data.empty<DocumentReadyState>()
export const readyStateRD = ReplayMediator.of(readyStateD, { autoTrigger: true })
readyStateD.setOptions('isAsync', true)
if (webEnv) {
  readyStateD.mutate(() => document.readyState)
}

export const interactiveStateD = filterT((v: string): boolean => v === 'interactive' || v === 'complete', readyStateRD)
export const interactiveStateRD = ReplayMediator.of(interactiveStateD, { autoTrigger: true })
interactiveStateD.setOptions('isAsync', true)

export const completeStateD = filterT((v: string): boolean => v === 'complete', readyStateRD)
export const completeStateRD = ReplayMediator.of(completeStateD, { autoTrigger: true })
completeStateD.setOptions('isAsync', true)

export const windowResizeD = webEnv
  ? createDataFromEvent<Window & typeof globalThis, UIEvent>({ target: window, type: 'resize' })[0]
  : Data.empty<UIEvent>()
export const windowResizeRD = ReplayMediator.of(windowResizeD, { autoTrigger: true })
windowResizeD.setOptions('isAsync', true)
if (webEnv) {
  windowResizeD.mutate(() => ({ type: 'resize', target: window } as unknown as UIEvent))
}

export const windowD = webEnv ? Data.of(window) : Data.empty<Window & typeof globalThis>()
export const windowRD = ReplayMediator.of(windowD, { autoTrigger: true })
windowD.setOptions('isAsync', true)

export const documentD = webEnv ? Data.of(document) : Data.empty<Document>()
export const documentRD = ReplayMediator.of(documentD, { autoTrigger: true })
documentD.setOptions('isAsync', true)
