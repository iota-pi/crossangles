/* eslint-disable no-console */

import { register } from 'register-service-worker'

export function registerSW(callbacks) {
  if (process.env.NODE_ENV === 'production') {
    register(`${process.env.BASE_URL}service-worker.js`, {
      ready () {
        if (callbacks && callbacks.ready) {
          callbacks.updated(...arguments)
        }

        console.log(
          'App is being served from cache by a service worker.\n' +
          'For more details, visit https://goo.gl/AFskqB'
        )
      },
      cached () {
        if (callbacks && callbacks.cached) {
          callbacks.updated(...arguments)
        }

        console.log('Content has been cached for offline use.')
      },
      updated () {
        if (callbacks && callbacks.updated) {
          callbacks.updated(...arguments)
        }

        console.log('New content is available; please refresh.')
      },
      offline () {
        if (callbacks && callbacks.offline) {
          callbacks.updated(...arguments)
        }

        console.log('No internet connection found. App is running in offline mode.')
      },
      error (error) {
        if (callbacks && callbacks.error) {
          callbacks.updated(...arguments)
        }

        console.error('Error during service worker registration:', error)
      }
    })
  }
}
