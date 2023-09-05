# 使用 Typescript 实现 useEffect

```tsx
import ReactDom from 'react-dom'

const states: any[] = []
const setStates: ((newValue: any | ((prev: any) => any)) => void)[] = []
let stateIndex = 0

function useState<T>(initialValue?: T): [T, (newValue: T | ((prev: T) => T)) => void] {
  const curIdx = stateIndex++

  if (states[curIdx] !== undefined) return [states[curIdx], setStates[curIdx]]

  states[curIdx] = initialValue

  setStates[curIdx] = (handleState: T | ((prev: T) => T)) => {
    if (typeof handleState === 'function')
      states[curIdx] = (handleState as (prev: T) => T)(states[curIdx])
    else
      states[curIdx] = handleState
    render()
  }

  return [states[curIdx], setStates[curIdx]]
}

const effects: { cb: () => any, deps: any[], isFirst: boolean }[] = []
let effectIndex = 0

function useEffect(cb: () => any, deps: any[] = []) {
  const curIndex = effectIndex++
  let curEffect = effects[curIndex]

  if (!curEffect) curEffect = { cb, deps, isFirst: true }

  if (curEffect.isFirst) {
    curEffect.cb()
    curEffect.isFirst = false
  }

  const isChanged = deps?.length
    && curEffect.deps.length
    && JSON.stringify(curEffect.deps) !== JSON.stringify(deps)

  if (!isChanged) return

  curEffect = { cb, deps, isFirst: false }
  cb()
}

function Case1() {
  const [num, setNum] = useState(0)
  useEffect(() => {
    setInterval(() => setNum(pre => pre + 1), 1000)
  }, [])
  return <div>{num}</div>
}

function Case2() {
  const [num, setNum] = useState(0)
  useEffect(() => {
    setTimeout(() => setNum(pre => pre + 1), 1000)
  }, [num])
  return <div>{num}</div>
}

// case 3
function Case3() {
  const [num, setNum] = useState(0)
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => setNum(pre => pre + 1), 2000)
    return () => {
      clearInterval(interval)
    }
  })
  return (
    <div>{num}</div>
  )
}

function render() {
  stateIndex = 0
  ReactDom.render(App(), document.getElementById('root'))
}

function App() {
  return <>
    <Case1 />
    <Case3 />
  </>
}

render()

```
