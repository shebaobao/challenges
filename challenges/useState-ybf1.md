# 使用 Typescript 实现 useState

## 内容

```ts

import ReactDOM from 'react-dom/client';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);


class Node<T = any> {
  value?: T
  next?: Node<T>
  constructor(value?: T, next?: Node<T>) {
    this.value = value
    this.next = next
  }
}

let head = new Node()
let curr: Node

function render() {
  curr = head
  root.render(<App />);
}


function useMyState<T = any>(initialState?: T): [T, (done: T | ((state: T) => T)) => void] {
  let node: Node<T>
  if (!curr.next) {
    node = new Node(initialState)
    curr.next = node
    curr = node
  } else {
    node = curr.next as Node
    curr = curr.next as Node
  }

  const handleSetState = (done: T | ((state: T) => T)) => {
    setTimeout(() => {
      if (typeof done === 'function') {
        node.value = (done as (state: T) => T)(node.value as T);
      } else {
        node.value = done;
      }
      render()
    });
  }

  return [node.value as T, handleSetState]
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
