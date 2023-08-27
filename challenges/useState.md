# 使用 Typescript 实现 useState

```tsx

/**
 *  TODO
 *  1. 直接 state = xxx 会触发 render
 *  2. state定义不支持惰性初始化
 */

// online: https://playcode.io/1574819

import ReactDom from 'react-dom'

const states: any[] = []
const setStates: ((newValue: any | ((prev: any) => any)) => void)[] = []
let index = 0

function useState<T>(initialValue?: T): [T, (newValue: T | ((prev: T) => T)) => void] {
    const curIdx = index++

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

function render() {
    index = 0
    ReactDom.render(App(), document.getElementById('root'))
}

function App() {
    return <>
        <CaseA />
        <CaseB />
        <CaseC />
    </>
}

function CaseA() {
    const [value, setValue] = useState(0)

    return (
        <>
            {value}
            <button onClick={() => setValue(value + 1)}>
                Add
            </button>
        </>
    )
}

// CaseB
function CaseB() {
    const [value, setValue] = useState(0)

    return <>{value}
        <button onClick={() => setValue(prev => prev + 1)}>Add</button>
    </>
}

// CaseC
function CaseC() {
    const [a, setA] = useState(0)
    const [b, setB] = useState(0)

    return <>
        <p>{a}
            <button onClick={() => setA(a + 1)}>Add a</button>
        </p>
        <p>{b}
            <button onClick={() => setB(b + 1)}>Add b</button>
        </p>
    </>
}

render()

```
