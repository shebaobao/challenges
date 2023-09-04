# 使用 Typescript 实现 useEffect

## 内容

```ts

import ReactDOM from 'react-dom/client'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

type effectType = {
  setup: () => ((() => void) | void)
  cleanup: (() => void) | void
  deps?: any[]
}
type stateType = string | number

const queues: (stateType | effectType | undefined)[] = []

let index = 0

function render () {
  index = 0
  root.render(<Case />)
}
render()

function useMyState<T = any> (initialState?: T): [T, (done: T | ((state: T) => T)) => void] {
  let state: T | undefined
  const currentIndex = index++

  if (typeof queues[currentIndex] === 'undefined') {
    queues[currentIndex] = initialState as stateType
    state = initialState
  } else {
    state = queues[currentIndex] as T
  }

  const handleSetState = (done: T | ((state: T) => T)) => {
    setTimeout(() => {
      let nextState
      if (typeof done === 'function') {
        nextState = (done as (state: T) => T)(queues[currentIndex] as T)
      } else {
        nextState = done
      }
      queues[currentIndex] = nextState as stateType
      render()
    })
  }
  return [state as T, handleSetState]
}

function useMyEffect (setup: ()=> ((() => void) | void), deps?: any[]) {
  const currentIndex = index++
  const current = queues[currentIndex] as effectType

  const same = current?.deps?.every((item: any, index: number) => item === deps?.[index])

  if (!deps || !same) {
    current?.cleanup?.()
    const cleanup = setup()

    queues[currentIndex] = {
      setup,
      cleanup,
      deps,
    }
  }
}

// FIXME: 死循环
function Case1 () {
  const [num, setNum] = useMyState(0)
  useMyEffect(() => {
    setNum(num + 1)
  }, [num])

  return (
    <>
      <div> { num }</div>
      <button onClick={ () => {
        setNum(num + 1)
      } }>click</button>
    </>
  )
}


function Case () {
  const [step, setStep] = useMyState(1)

  const [num, setNum] = useMyState(0)
  useMyEffect(() => {
    const interval = setInterval(() => setNum((state) => state + step), 1000)
    return () => {
      clearInterval(interval)
    }
  }, [step])

  const [num2, setNum2] = useMyState(10)

  useMyEffect(() => {
    const interval = setInterval(() => setNum2((state) => state + step), 1000)
    return () => {
      clearInterval(interval)
    }
  }, [step])

  return (
    <>
      <div> { num }</div>
      <div>{ num2 }</div>
      <button onClick={ () => {
        setStep(step + 1)
      } }>click</button>
    </>
  )
}


```
