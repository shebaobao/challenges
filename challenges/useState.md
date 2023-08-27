function useState (initialState) {

}

// CaseA
function CaseA () {
  const [value, setValue] = useState(0)

  return <>{value}<button onClick={() => setValue(value + 1)}>Add`</button>`</>
}

// CaseB
function CaseA () {
  const [value, setValue] = useState(0)

  return <>{value}<button onClick={() => setValue(prev => prev + 1)}>Add`</button>`</>
}

// CaseC
function CaseC () {
  const [a, setA] = useState(0)
  const [b, setB] = useState(0)

  return <>
    `<p>`{a}<button onClick={() => setA(a + 1)}>Add a `</button></p>`
    `<p>`{b}<button onClick={() => setB(b + 1)}>Add b `</button></p>`
  </>
}
