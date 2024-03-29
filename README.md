# 🖱️ Tap

Handling of user interactions such as mouse, touch and pointer events.  
(_Inspired by [tapjs](https://www.npmjs.com/package/tapjs)_)

## Installation

```console
npm install @yandeu/tap
```

## CDN

```console
https://unpkg.com/@yandeu/tap/umd/tap.min.js
```

## Usage

```ts
// print the current version
console.log('Tap VERSION: ', Tap.VERSION)

// the element you want to listen for events (your canvas for example)
const el = document.getElementById('myCanvas')

// instantiate
const tap = new Tap(el)

// listen on down
tap.on.down(({ position, event }) => {
  console.log('down', position, event)
})

// listen on move
tap.on.move(({ position, event, dragging }) => {
  console.log('move', position, event)

  const isDragging = dragging
  console.log('Is pointer down while moving?', isDragging)
})

// listen on up
tap.on.up(({ position, event }) => {
  console.log('up:', position, event)
})

// listen on down once
tap.once.down(({ position, event }) => {
  console.log('down', position, event)
})

// check if down
tap.isDown

// get current position
tap.currentPosition

// get last position
tap.lastPosition

// is pointer lock available
tap.pointerLock.available

// is pointer locked
tap.pointerLock.isLocked

// listen for pointer lock change once (returns a Promise)
tap.pointerLock.onceChange().then(event => {
  console.log(event)
})

// request pointer lock (returns a Promise)
tap.pointerLock.request().then(event => {
  console.log(event)
})

// request pointer lock (returns a Promise)
tap.pointerLock.exit().then(event => {
  console.log(event)
})

// check if paused
tap.isPaused

// pause all events (except .once())
tap.pause()

// resume all events
tap.resume()

// destroy all events once you are done
tap.destroy()
```

## Related Packages

| Package                                          | Description                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------------- |
| [`audio`](https://www.npmjs.com/package/@yandeu/audio)       | 🎵 Audio library for the Web Audio API.                                   |
| [`keyboard`](https://www.npmjs.com/package/@yandeu/keyboard) | ⌨️ Handling of keyboard events.                                           |
| [`tap`](https://www.npmjs.com/package/@yandeu/tap)           | 🖱️ Handling of user interactions such as mouse, touch and pointer events. |

## Questions?

Join the [enable3d discussions](https://github.com/enable3d/enable3d/discussions)!

## License

[MIT](LICENSE)
