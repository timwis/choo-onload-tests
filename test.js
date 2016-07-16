const choo = require('choo')
const html = require('choo/html')
const test = require('tape')

test('parent element triggered when route changes', (t) => {
  t.plan(1)
  const app = choo()

  const home = () => html`
    <div>
      Home
    </div>`
  const about = () => html`
    <div onload=${() => t.pass('onload triggered in about view')}>
      About
    </div>`

  app.router((route) => [
    route('/', home),
    route('/about', about)
  ])

  const tree = app.start({ hash: true })
  document.body.appendChild(tree)

  window.location.hash = '/about'
})

test('child element triggered when route changes', (t) => {
  t.plan(1)
  const app = choo()

  const home = () => html`
    <div>
      Home
    </div>`
  const about = () => html`
    <div>
      About
      <section onload=${() => t.pass('onload triggered in child node')}>
        Hello
      </section>
    </div>`

  app.router((route) => [
    route('/', home),
    route('/about', about)
  ])

  const tree = app.start({ hash: true })
  document.body.appendChild(tree)

  window.location.hash = '/about'
})

test('not triggered on state change', (t) => {
  t.plan(1)
  const app = choo()

  app.model({
    state: { title: 'Home' },
    reducers: {
      update: (data, state) => ({ title: data })
    }
  })

  var onloadCalled = 0
  const home = (state, prev, send) => html`
    <div onload=${() => onloadCalled++}>
      <h1>${state.title}</h1>
      <form onsubmit=${send('update', 'Foo')}>
        <button type="submit">Submit</button>
      </form>
    </div>`

  app.router((route) => [
    route('/', home)
  ])

  const tree = app.start({ hash: true })
  document.body.appendChild(tree)

  const form = tree.getElementsByTagName('form')[0]
  form.dispatchEvent(new window.Event('submit'))
  setTimeout(() => t.equal(onloadCalled, 1, 'onloadCalled is not 1'), 100)
})

test('memoized element not triggered on state change', (t) => {
  t.plan(1)

  const app = choo()

  app.model({
    state: { title: 'Hello' },
    reducers: {
      update: (data, state) => ({ title: data })
    }
  })

  const view = (state, prev, send) => html`
    <div>
      <button onclick=${() => send('update', 'world')}>Update state</button>
      ${memoizedSubView(state, prev, send)}
    </div>`

  let memoizedEl
  let onloadCalled = 0
  const memoizedSubView = (state, prev, send) => {
    memoizedEl = memoizedEl || html`<div onload=${() => onloadCalled++}>memoizedSubView</div>`
    return memoizedEl
  }

  app.router((route) => [
    route('/', view)
  ])

  const tree = app.start()
  document.body.appendChild(tree)

  const button = tree.getElementsByTagName('button')[0]
  button.dispatchEvent(new window.Event('click'))
  setTimeout(() => t.equal(onloadCalled, 1, 'onloadCalled not equal to 1'), 100)
})
