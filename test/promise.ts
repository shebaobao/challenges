type Callback<T> = (value: T) => void
type ErrorHandler = (error: Error) => void

class FakePromise<T> {
  value?: T
  error?: Error
  onFulfilledCallbacks: Callback<T>[] = []
  onRejectedCallbacks: ErrorHandler[] = []

  constructor(handler: (resolve: Callback<T>, reject: ErrorHandler) => void) {
    handler(
      (value) => {
        this.value = value
        this.onFulfilledCallbacks.forEach(callback => callback(value))
      },
      (error) => {
        this.error = error
        this.onRejectedCallbacks.forEach(callback => callback(error))
      }
    )
  }

  then(callback: Callback<T>): FakePromise<T> {
    if (this.value !== undefined) {
      callback(this.value)
    } else {
      this.onFulfilledCallbacks.push(callback)
    }
    return this
  }

  catch(callback: ErrorHandler): FakePromise<T> {
    if (this.error !== undefined) {
      callback(this.error)
    } else {
      this.onRejectedCallbacks.push(callback)
    }
    return this
  }
}

// 执行您的测试案例
const case1 = new FakePromise((resolve) => {
  setTimeout(() => {
    resolve(1)
  })
})

case1.then(console.log) // => 1

const case2 = new FakePromise((resolve, reject) => {
  setTimeout(() => {
    reject(Error('wrong'))
  })
})

case2.catch(console.error) // => Error('wrong')

const case3 = new FakePromise<number>((resolve) => {
  setTimeout(() => {
    resolve(1)
  })
})

case3.then(data => data++).then(console.log) // => 2

const case4 = new FakePromise((resolve) => {
  resolve(4)
})

case4.then(console.log) // => 4

const case5 = new FakePromise((resolve, reject) => {
  reject(Error('wrong'))
})

case5.catch(console.error) // => Error('wrong')
