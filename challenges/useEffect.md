```
functionCase1 () {

  const [num, setNum] =useState(0)

  useEffect(() => {

    setInterval(() =>setNum(++num), 1000)

  }, [])

  return `<div>`{num}`</div>`

}

functionCase2 () {

  const [num, setNum] =useState(0)

  useEffect(() => {

    setTimeout(() =>setNum(++num), 1000)

  }, [num])

  return `<div>`{num}`</div>`

}

functionCase3() {

  const [num, setNum] =useState(0)

  useEffect(() => {

    leti=0

    constinterval=setInterval(() =>setNum(++num), 1000)

    return () => {

    clearInterval(interval)

    };

  });

  return (

    `<div>`

    { num }

    `</div>`

  );

}
```
