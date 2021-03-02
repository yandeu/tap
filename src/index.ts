/**
 * @package      npmjs.com/package/@yandeu/tap (tap.min.js)
 *
 * @author       Yannick Deubel (https://github.com/yandeu)
 * @copyright    Copyright (c) 2021 Yannick Deubel; Project Url: https://github.com/yandeu/tap
 * @license      {@link https://github.com/yandeu/tap/blob/master/LICENSE|MIT}
 * @description  Inspired by tapjs (https://www.npmjs.com/package/tapjs)
 */

import { Events } from '@yandeu/events'

import { eventMatrix } from './eventMatrix'
import { EventTypes } from './types'
import { VERSION } from './version'

export type TapIsDragging = boolean
export type TapCallback = (data: TapEvent) => void
export type TapVector2 = { x: number; y: number }

export interface TapEvent {
  position: TapVector2
  event: Event
  dragging?: TapIsDragging
}

export interface TapEventMap {
  down: (event: TapEvent) => void
  move: (event: TapEvent) => void
  up: (event: TapEvent) => void
}

export class Tap {
  static get VERSION() {
    return VERSION
  }

  private _events = new Events<TapEventMap>()

  private domElement: null | HTMLElement = null

  private _isDown = false
  private _isPaused = false

  private active: { [key in EventTypes]: boolean } = {
    touch: false,
    mouse: false,
    pointer: false
  }

  private registered: { [key in EventTypes]: boolean } = {
    touch: false,
    mouse: false,
    pointer: false
  }

  private _currentPosition: TapVector2 = { x: -1, y: -1 }
  private _lastPosition: TapVector2 = { x: -1, y: -1 }

  private _isPointerLockAvailable = 'onpointerlockchange' in document

  constructor(domElement: HTMLElement) {
    this._add(domElement)
  }

  public get isDown() {
    return this._isDown
  }

  private set _position(position: TapVector2) {
    if (position.x === this._currentPosition.x && position.y == this._currentPosition.y) return

    this._lastPosition = this._currentPosition
    this._currentPosition = position
  }

  public get currentPosition() {
    return this._currentPosition
  }

  public get lastPosition() {
    return this._lastPosition
  }

  public get isPaused() {
    return this._isPaused
  }

  public pause() {
    this._isPaused = true
  }

  public resume() {
    this._isPaused = false
  }

  // listen to pointer lock change events
  private _onPointerLockChange() {
    return new Promise(resolve => {
      document.addEventListener(
        'pointerlockchange',
        e => {
          resolve(e)
        },
        { once: true }
      )
    })
  }

  public get pointerLock() {
    return {
      onceChange: this._onPointerLockChange,
      request: () => {
        return new Promise((resolve, reject) => {
          if (!this._isPointerLockAvailable) return reject('PointerLock is not available!')
          if (this.pointerLock.isLocked) return reject('Pointer is already locked!')

          // listen to pointer lock change events
          this._onPointerLockChange().then(e => {
            resolve(e)
          })

          this.once.down(() => {
            this.domElement?.requestPointerLock()
          })
        })
      },
      exit: () => {
        return new Promise((resolve, reject) => {
          if (!this.pointerLock.isLocked) return reject('Pointer is not locked!')

          // listen to pointer lock change events
          this._onPointerLockChange().then(e => {
            resolve(e)
          })

          document.exitPointerLock()
        })
      },
      available: this._isPointerLockAvailable,
      isLocked: !!document.pointerLockElement
    }
  }

  /** (once ignores paused) */
  public get once() {
    return {
      down: (callback: TapCallback) => {
        this._events.once('down', data => {
          callback(data)
        })
      },
      move: (callback: TapCallback) => {
        this._events.once('move', data => {
          callback(data)
        })
      },
      up: (callback: TapCallback) => {
        this._events.once('up', data => {
          callback(data)
        })
      }
    }
  }

  public get on() {
    return {
      down: (callback: TapCallback) => {
        this._events.on('down', data => {
          if (!this._isPaused) callback(data)
        })
      },
      move: (callback: TapCallback) => {
        this._events.on('move', data => {
          if (!this._isPaused) callback(data)
        })
      },
      up: (callback: TapCallback) => {
        this._events.on('up', data => {
          if (!this._isPaused) callback(data)
        })
      }
    }
  }

  private _add(element?: any) {
    const el = (this.domElement = element ?? window)
    if (!el) console.warn('[tap] No domElement found!')

    this._onDown = this._onDown.bind(this)
    this._onMove = this._onMove.bind(this)
    this._onUp = this._onUp.bind(this)

    eventMatrix.forEach(input => {
      if (input.test && input.enabled) {
        this.active[input.name] = true

        el.addEventListener(input.events.down, this._onDown, false)
        el.addEventListener(input.events.move, this._onMove, false)
        el.addEventListener(input.events.up, this._onUp, false)
      }
    })
  }

  private _remove(type: keyof typeof EventTypes) {
    if (!this.active[type]) return

    const el = this.domElement as HTMLElement
    if (!el) console.warn('[tap] No domElement found!')

    eventMatrix.forEach(input => {
      if (input.name === type) {
        el.removeEventListener(input.events.down, this._onDown, false)
        el.removeEventListener(input.events.move, this._onMove, false)
        el.removeEventListener(input.events.up, this._onUp, false)
      }
    })

    this.active[type] = false
  }

  public destroy() {
    this.pause()

    Object.keys(this.active).forEach(key => {
      this._remove(key as keyof typeof EventTypes)
    })

    this._events.removeAllListeners()

    // @ts-ignore
    this._events = null
    // @ts-ignore
    this.domElement = null
    // @ts-ignore
    this._isDown = null
    // @ts-ignore
    this._isPaused = null
    // @ts-ignore
    this.active = null
    // @ts-ignore
    this.registered = null
    // @ts-ignore
    this._currentPosition = null
    // @ts-ignore
    this._lastPosition = null
  }

  private _calcPosition(e: any) {
    let x: number
    let y: number

    if (e.touches && e.touches[0]) {
      x = e.touches[0].pageX
      y = e.touches[0].pageY
    } else if (e.clientX) {
      x = e.clientX
      y = e.clientY
    } else {
      x = this._currentPosition.x
      y = this._currentPosition.y
    }

    if (this.pointerLock.isLocked) {
      x = e.movementX
      y = e.movementY
    }

    this._position = { x, y }

    return { x, y }
  }

  private _removeDuplicates(e: Event) {
    if (e.type === 'pointerdown') this.registered.pointer = true
    if (e.type === 'touchstart') this.registered.touch = true
    if (e.type === 'mousedown') this.registered.mouse = true

    if (e.type === 'touchstart' && this.active.touch && this.registered.pointer) {
      this._remove('touch')
      return false
    }

    if (e.type === 'mousedown' && this.active.mouse && (this.registered.pointer || this.registered.touch)) {
      this._remove('mouse')
      return false
    }

    return true
  }

  private _onDown(e: any) {
    const proceed = this._removeDuplicates(e)
    if (!proceed) return

    this._isDown = true

    this._events.emit('down', { position: this._calcPosition(e), event: e })
  }

  private _onMove(e: Event) {
    this._events.emit('move', { position: this._calcPosition(e), event: e, dragging: this._isDown })
  }

  private _onUp(e: Event) {
    this._isDown = false

    this._events.emit('up', { position: this._calcPosition(e), event: e })
  }
}

// test section

// const test = new Tap(document.body)

// test.pointerLock.onceChange()

// test.on.down(({ event, position }) => {
//   console.log(event, position)
// })

// const requestPointerLockLoop = () => {
//   console.log('request')
//   test.pointerLock.request().then(() => {
//     console.log('locked')
//     test.pointerLock.onceChange().then(() => {
//       console.log('onceChange', !test.pointerLock.isLocked)
//       if (!test.pointerLock.isLocked) requestPointerLockLoop()
//     })
//   })
// }
// requestPointerLockLoop()

// setTimeout(() => {
//   test.pointerLock.request()
// }, 2000)
