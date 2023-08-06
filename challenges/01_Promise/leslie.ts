type InitConfig = (resolve: (value: unknown) => void, reject: (reason: Error) => void) => void

type State = 'pending' | 'fulfilled' | 'rejected'

type Execution = {
  resolve: (value: unknown) => void
  reject: (reason: Error) => void
}

class FakePromise {
  private state: State
  private executionStack: Execution[] = [] // TODO - type
  private result: unknown

  private handleCallbacks() {
    this.executionStack.forEach(cb => {
      if (this.state === 'fulfilled') cb.resolve(this.result)
      else cb.reject(this.result as Error)
    })
    this.executionStack = []
  }

  constructor(config: InitConfig) {
    this.state = 'pending'
    this.result = null

    const resolve = (value: unknown) => {
      if (this.state !== 'pending') return
      this.state = 'fulfilled'
      this.result = value
      this.handleCallbacks()
    }

    const reject = (value: unknown) => {
      if (this.state !== 'pending') return
      this.state = 'rejected'
      this.result = value
      this.handleCallbacks()
    }

    try {
      config(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFulfilled: (value: any) => unknown) {
    return new FakePromise((resolve, reject) => {
      const callback = {
        resolve: (value: unknown) => {
          try {
            const result = onFulfilled(value)
            resolve(result)
          } catch (error) {
            reject(error as Error)
          }
        },
        reject: (reason: Error) => reject(reason)
      }

      if (this.state === 'rejected') return
      if (this.state === 'pending') this.executionStack.push(callback)
      if (this.state === 'fulfilled') callback.resolve(this.result)
    })
  }

  catch(onRejected: (value: Error) => unknown) {
    return new FakePromise((resolve, reject) => {
      const callback = {
        resolve: (value: unknown) => resolve(value),
        reject: (reason: Error) => {
          try {
            const result = onRejected(reason)
            resolve(result)
          } catch (error) {
            reject(error as Error)
          }
        }
      }

      if (this.state === 'fulfilled') return
      if (this.state === 'pending') this.executionStack.push(callback)
      if (this.state === 'rejected') callback.reject(this.result as Error)
    })
  }
}

const case1 = new FakePromise((resolve, reject) => {
  setTimeout(() => resolve(1))
})

case1.then(res => console.log(res)) // => 1


const case2 = new FakePromise((resolve, reject) => {
  setTimeout(() => reject(Error('wrong')))
})

case2.catch(err => console.log(err.message)) // => 'wrong'


const case3 = new FakePromise((resolve, reject) => {
  setTimeout(() => resolve(1))
})

case3.then((data) => data++).then(res => console.log(res)) // => 2 TODO - 1


const case4 = new FakePromise((resolve, reject) => {
  resolve(4)
})

case4.then((res) => console.log(res)) // => 4


const case5 = new FakePromise((resolve, reject) => {
  reject(Error('wrong'))
})

case5.catch(err => console.log(err.message)) // => 'wrong'
