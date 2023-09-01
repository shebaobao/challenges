```
function useEffect(initialState, cb) {

}
```

```
function Case1 () {

  const [num, setNum] = useState(0)

  useEffect(() => {
    setInterval(() => setNum(++num), 1000)
  }, [])

  return <div>{num}</div>

}
```

```
function Case2 () {

  const [num, setNum] = useState(0)

  useEffect(() => {
    setTimeout(() => setNum(++num), 1000)
  }, [num])

  return <div>{num}</div>

}
```

// case 3
```
import ReactDOM from "react-dom"

function Case3() {

  const [num, setNum] = useState(0)
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => setNum(++num), 1000)
    return () => {
      clearInterval(interval)
    };
  });
  return (
    <div>
      { num }
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<Case3 />, rootElement);
```