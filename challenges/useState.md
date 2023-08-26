# 使用 Typescript 实现 useState

## 内容

```ts
import './App.css';
import ReactDOM from 'react-dom/client'

let index = -1
const stateValues: any = []

function render() {
  index = -1
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
}

function useMyState<T = any>(initialState?: T): [T, (done: T | ((state: T) => T)) => void] {
  index ++

  let state: T | undefined
  const currentIndex = index

  state = stateValues[currentIndex] || initialState

  const setState = (newState: T | ((state: T) => T)) => {
    state = typeof newState === 'function' ? (newState as (state: T) => T)(state as T) : newState
    stateValues[currentIndex] = state
    render()
  }

  return [state as T, setState]
}

function App() {
  const [a, setA] = useMyState(0)
  const [b, setB] = useMyState<number>(0)

  return <>
  <div>
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
    </div>
  </>
}

export default App;


```