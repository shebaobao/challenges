const effects: ({
  callback: () => void
  dependencies?: any[]
})[] = []

let currentEffectIndex = 0
let isInitialMount = true

function useEffect(callback: () => void, dependencies?: any[]): void {
  const currentIndex = currentEffectIndex

  if (!effects[currentIndex]) {
    effects[currentIndex] = {
      callback,
      dependencies,
    };
    currentEffectIndex++
  }

  if (isInitialMount) {
    effects[currentIndex].callback()
    isInitialMount = false
  } else if (!dependencies || dependenciesChanged(effects[currentIndex].dependencies, dependencies)) {
    effects[currentIndex] = {
      callback,
      dependencies,
    }

    currentEffectIndex++
    
    callback()
  }
}


function dependenciesChanged(prevDeps?: any[], deps?: any[]): boolean {
  if (!prevDeps || prevDeps.length !== deps?.length) return true

  for (let i = 0; i < deps.length; i++) {
    if (deps[i] !== prevDeps[i]) return true
  }

  return false
}