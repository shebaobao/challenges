# 使用 Typescript 实现 useState

## 内容

```ts

import ReactDOM from 'react-dom/client'

let stateIndex = -1
let stateParent: any
const componentState = new Map()
const stateValues: any = []

function render(parent: any) {
  const state = componentState.get(parent) || {cache: []}
  componentState.set(parent, {...state})
  stateParent = parent
  stateIndex = -1
  effectIndex = -1
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
}

function useMyState<T = any>(initialState?: T): [T, (done: T | ((state: T) => T)) => void] {
  let index = stateIndex
  const parent = stateParent
  stateIndex ++

  return (() => {
    const cache = componentState.get(parent) || []
    if (cache[index] == null) {
      cache[index] = {
        value: typeof initialState === 'function' ? initialState() : initialState
      }
    }

    const setState = (newState: T | ((state: T) => T)) => {
      if (typeof newState === 'function') {
        cache[index].value = (newState as (state: T) => T)(cache?.[index].value)
      } else {
        cache[index].value = newState
      }
      render(parent)
    }

    return [cache[index].value as T, setState]
  })()
}

let effectIndex = -1
const effectValues: any = []

function useMyEffect(callback: () => void, dependencies?: any[]) {
  let index = stateIndex
  const parent = stateParent
  stateIndex ++ 

  (() => {
    const cache = componentState.get(parent) || []
    if (cache[index] == null) {
      cache[index] = { dependencies: undefined }
    }

    const dependenciesChanged = 
      dependencies == null || 
      dependencies.some((dependency, i) => {
        return (
          cache[index].dependencies == null || 
          cache[index].dependencies[i] !== dependency
        )
      })
      
    if (dependenciesChanged) {
      if (cache[index].cleanup != null) cache[index].cleanup()
      cache[index].cleanup = callback()
      cache[index].dependencies = dependencies
    }
  })()
}

function App() {
  // const [a, setA] = useMyState(0)
  // const [b, setB] = useMyState<number>(0)

  const [num1, setNum1] = useMyState(0)
  const [num2, setNum2] = useMyState(0)
  const [num3, setNum3] = useMyState(0)

  useMyEffect(() => {
    setInterval(() => setNum1(num1 + 1), 1000)
  }, [])
  
  useMyEffect(() => {
    setTimeout(() => setNum2(num2 + 1), 1000)
  }, [num2])

  useMyEffect(() => {
    let i = 0
    const interval = setInterval(() => setNum3(num3 + 1), 1000)
    return () => {
      clearInterval(interval)
    }
  })

  // useEffect(() => {
  //   setInterval(() => setNum1(num1 + 1), 1000)
  // }, [])
  
  // useEffect(() => {
  //   setTimeout(() => setNum2(num2 + 1), 1000)
  // }, [num2])

  // useEffect(() => {
  //   let i = 0
  //   const interval = setInterval(() => setNum3(num3 + 1), 1000)
  //   return () => {
  //     clearInterval(interval)
  //   }
  // })

  return <>
  <div>
    <h4>NUM1: {num1}</h4>
    <button onClick={() => {
        setNum1(prev => prev - 1)
    }}>Subtract a</button>
    <button onClick={() => {
        setNum1(prev => prev + 1)
    }}>Add a</button>
  </div>
  <div>{num2}</div>
  <div>{num3}</div>
  {/* <div>
    <h4>A: {a}</h4>
    <button onClick={() => {
      setA(a - 1)
      setA(a - 1)
    }}>Subtract a</button>
    <button onClick={() => {
      setA(a + 1)
      setA(a + 1)
    }}>Add a</button>
  </div>
    <div>
      <h4>B: {b}</h4>
      <button onClick={() => {
        setB(prev => prev - 1)
        setB(prev => prev - 1)
      }}>Subtract b</button>
      <button onClick={() => {
        setB(prev => prev + 1)
        setB(prev => prev + 1)
      }}>Add b</button>
    </div> */}
  </>
}

export default App;


```