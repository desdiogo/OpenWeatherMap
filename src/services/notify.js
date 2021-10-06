import { Notify } from 'quasar'

export function notify (message, type) {
  Notify.create({
    textColor: 'white',
    message: message,
    position: 'top',
    type,
    actions: [
      { icon: 'close', color: 'white', attrs: { 'aria-label': 'Dismiss' } }
    ],
    timeout: 5000
  })
}
