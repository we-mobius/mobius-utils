import {
  Mutation, Data, isAtom,
  ReplayMediator,
  pipeAtom, dataToData, atomToData, combineT,
  createDataFromFunction
} from '../atom.js'
import { windowLoadedRD } from './event.js'
import { isObject, isFunction, isArray } from '../internal.js'

export const makeAppContainerRD = (containerId, decorator) => {
  const initContainer = id => {
    let container = document.getElementById(id)
    if (!container) {
      container = document.createElement('div')
      container.id = id
      document.body.appendChild(container)
    }
    if (isObject(decorator)) {
      Object.entries(decorator).forEach(([key, value]) => {
        if (isFunction(value)) {
          value(container[key])
        } else {
          container[key] = value
        }
      })
    } else if (isFunction(decorator)) {
      container = decorator(container)
    }
    return container
  }

  const toAppContainerM = Mutation.of(() => {
    const container = initContainer(containerId)
    return container
  })

  const appContainerD = Data.empty()
  pipeAtom(windowLoadedRD, toAppContainerM, appContainerD)

  const appContainerRD = ReplayMediator.of(appContainerD, { autoTrigger: true })

  return appContainerRD
}

export const runApp = (render, container, template) => {
  const renderTargetD = combineT(container, template)
  return renderTargetD.subscribe(({ value: [root, pageTemplate] }) => {
    render(pageTemplate, root)
  })
}

export const makeComponent = (input, operation, output) => {
  const outputD = output || Data.empty()

  let inputD
  if (isArray(input)) {
    inputD = combineT(input)
  } else if (isAtom(input)) {
    inputD = atomToData(input)
  } else if (isObject(input)) {
    // TODO:
  }

  pipeAtom(inputD, Mutation.ofLiftBoth(operation), outputD)
  return outputD
}

export const makeEventHandler = (handler = v => v) => {
  let eventHandler
  const containerFn = handler => {
    eventHandler = handler
  }
  const [data, triggerMediator, trigger] = createDataFromFunction(containerFn, e => handler(e))

  return [eventHandler, data, triggerMediator, trigger]
}

export const makeGeneralEventHandler = (handler = v => v) => {
  const [eventHandler, data, triggerMediator, trigger] = makeEventHandler(handler)
  const eventHandlerRD = ReplayMediator.of(dataToData(windowLoadedRD, () => eventHandler))
  return [eventHandlerRD, eventHandler, data, triggerMediator, trigger]
}
