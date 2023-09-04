# 使用 Typescript 实现 useState

## 内容

```ts

import ReactDOM from 'react-dom/client';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

let index = 0
const stateValues: any = []

function render() {
  index = 0
  root.render(<App />);
}

function useMyState<T = any>(initialState?: T): [T, (done: T | ((state: T) => T)) => void] {
  let state: T | undefined
  const currentIndex = index

  if (!stateValues[currentIndex]) {
    stateValues[currentIndex] = initialState
    state = initialState
  } else {
    state = stateValues[currentIndex]
  }

  const handleSetState = (done: T | ((state: T) => T)) => {
    setTimeout(() => {
      let nextState
      if (typeof done === 'function') {
        nextState = (done as (state: T) => T)(state as T);
      } else {
        nextState = done;
      }
      stateValues[currentIndex] = nextState
      render()
    });
  }

  index++
  return [state as T, handleSetState]
}



function App1() {
  const [state, setState] = useMyState(0);

  return <>{state}<button onClick={() => setState(state + 1)}>Add</button></>
}

function App2() {
  const [value, setState] = useMyState<number>(0)

  return <>{value}<button onClick={() => setState(prev => prev + 1)}>Add</button></>
}


function App() {
  const [a, setA] = useMyState(0)
  const [b, setB] = useMyState(0)

  return <>
    <p>{a}<button onClick={() => setA(a + 1)}>Add a</button></p>
    <p>{b}<button onClick={() => setB(b + 1)}>Add b</button></p>
  </>
}


render();


```
