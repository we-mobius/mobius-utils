import { isFunction } from '../internal/base'
import { adaptMultipleEnvironments } from './environment'

export const registerCatchallExceptionHandler = (catchallHandler?: (message: string) => void): void => {
  const runCatchallHandler = (message: string, catchallHandler?: (message: string) => void): void => {
    if (isFunction(catchallHandler)) {
      try {
        catchallHandler(message)
      } catch (e) {
        // ignore
      }
    }
    console.log(message)
  }
  adaptMultipleEnvironments({
    forWeb: ({ window }) => {
      window.onerror = (event, source, lineno, colno, error) => {
        const time = new Date().toISOString()
        const message = `[${time}][CatchallExceptionHandler] onerror:\r\n\r\n` +
        ` - event: ${Object.keys(event).toString()}\r\n` +
        ` - source: ${source ?? 'undefined'}\r\n` +
        ` - lineno: ${lineno ?? 'undefined'}\r\n` +
        ` - colno: ${colno ?? 'undefined'}\r\n` +
        ` - error: ${error !== undefined ? error.name + error.message : 'undefined'}`
        runCatchallHandler(message, catchallHandler)
        console.error(`[${time}]`, error)
      }
      window.addEventListener('error', (event) => {
        const time = new Date().toISOString()
        const message = `[${time}][CatchallExceptionHandler] errorEventListener:\r\n\r\n` +
        ` - event: ${Object.keys(event).toString()}`
        runCatchallHandler(message, catchallHandler)
        console.error(`[${time}]`, event)
      })
      window.addEventListener('unhandledrejection', (event) => {
        const time = new Date().toISOString()
        const message = `[${time}][CatchallExceptionHandler] unhandledrejectionEventListener:\r\n\r\n` +
        ` - reason: ${event.reason as string}`
        runCatchallHandler(message, catchallHandler)
        console.error(`[${time}]`, event)
      })
    },
    forNode: ({ process }) => {
      process.on('uncaughtExceptionMonitor', (error) => {
        const time = new Date().toISOString()
        const message = `[${time}][CatchallExceptionHandler] uncaughtExceptionMonitor:\r\n\r\n` +
        ` - error: ${error !== undefined ? error.name + error.message : 'undefined'}`
        runCatchallHandler(message, catchallHandler)
        console.error(`[${time}]`, error)
      })
      process.on('uncaughtException', (error) => {
        const time = new Date().toISOString()
        const message = `[${time} - CatchallExceptionHandler] uncaughtException:\r\n\r\n` +
          ` - error: ${error !== undefined ? error.name + error.message : 'undefined'}`
        runCatchallHandler(message, catchallHandler)
        console.error(`[${time}]`, error)
      })
      process.on('unhandledRejection', (reason) => {
        const time = new Date().toISOString()
        const message = `[${time}][CatchallExceptionHandler] unhandledRejection:\r\n\r\n` +
          ` - error: ${reason as string}`
        runCatchallHandler(message, catchallHandler)
        console.error(`[${time}]`, reason)
      })
    }
  })
}
