import { Events, EventTypes } from './types'

export const eventMatrix: {
  name: keyof typeof EventTypes
  enabled: boolean
  test: boolean
  events: { [key in Events]: string }
}[] = [
  {
    name: 'pointer',
    enabled: true,
    test: 'onpointerdown' in window,
    events: {
      down: 'pointerdown',
      move: 'pointermove',
      up: 'pointerup'
    }
  },
  {
    name: 'touch',
    enabled: true,
    test: 'ontouchstart' in window && window.navigator.maxTouchPoints >= 1,
    events: {
      down: 'touchstart',
      move: 'touchmove',
      up: 'touchend'
    }
  },
  {
    name: 'mouse',
    enabled: true,
    test: 'onmousedown' in window,
    events: {
      down: 'mousedown',
      move: 'mousemove',
      up: 'mouseup'
    }
  }
]
