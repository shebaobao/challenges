import ReactDOM from "react-dom";

type StateSetter<T> = (newValue: T | ((prev: T) => T)) => void;
type StateHookResult<T> = [T, StateSetter<T>];

const state: any[] = [];
const setters: StateSetter<any>[] = [];
let stateIndex: number = 0;

function useState<T>(initialValue: T): StateHookResult<T> {
  const currentIndex: number = stateIndex;

  if (state[currentIndex] !== undefined) {
    stateIndex++;
    return [state[currentIndex], setters[currentIndex]];
  }

  state[currentIndex] = initialValue;

  function setState(newState: T | ((prev: T) => T)): void {
    if (typeof newState === "function") {
      state[currentIndex] = (newState as (prev: T) => T)(state[currentIndex]);
    } else {
      state[currentIndex] = newState;
    }
    render();
  }

  setters[currentIndex] = setState;
  stateIndex++;

  return [state[currentIndex], setState];
}

function render(): void {
  stateIndex = 0;
  ReactDOM.render(<CaseA />, document.getElementById("root"));
}


// CaseA
function CaseA () {
  const [value, setValue] = useState(0)

  return <>{value}<button onClick={() => setValue(value + 1)}>Add</button></>
}

// CaseB
function CaseB () {
  const [value, setValue] = useState(0)

  return <>{value}<button onClick={() => setValue(prev => prev + 1)}>Add</button></>
}

// CaseC
function CaseC () {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)

  return <>
    <p>{a}<button onClick={() => setA(a + 1)}>Add a</button></p>
    <p>{b}<button onClick={() => setB(b + 1)}>Add b</button></p>
  </>
}