class FakePromise<T = any> {
  state: "pending" | "fulfilled" | "rejected" = "pending"
  data?: T | any
  onFulfilledCallback: ((value: T) => void)[] = []
  onRejectedCallback: ((reason: any) => void)[] = []

  constructor(executor: (resolve: (value: T) => void, reject: (reason: any) => void) => void) {
    const resolve = (value: T) => {
      setTimeout(() => {
        if (this.state === "pending") {
          this.state = "fulfilled"
          this.data = value
          this.onFulfilledCallback.forEach((callback) => callback(value))
        }
      })
    }

    const reject = (reason: any) => {
      setTimeout(() => {
        if (this.state === "pending") {
          this.state = "rejected"
          this.data = reason
          this.onRejectedCallback.forEach((callback) => callback(reason))
        }
      })
    }

    try {
      executor(resolve, reject)
    } catch (reason) {
      reject(reason)
    }
  }

  then<U>(onFulfilled?: ((value: T) => U) | null, onRejected?: ((reason: any) => U) | null): FakePromise<U> {
    return new FakePromise<U>((resolve, reject) => {
      const handleFulfilled = (value: T) => {
        setTimeout(() => {
          if (typeof onFulfilled === "function") {
            try {
              const x = onFulfilled(this.data)
              promiseResolutionProcedure(this as FakePromise, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          } else {
            resolve(this.data)
          }
        })
      }

      const handleRejected = () => {
        setTimeout(() => {
          if (typeof onRejected === "function") {
            try {
              const x = onRejected(this.data)
              promiseResolutionProcedure(this as FakePromise, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          } else {
            reject(this.data)
          }
        })
      }

      if (this.state === "fulfilled") {
        handleFulfilled(this.data)
      } else if (this.state === "rejected") {
        handleRejected()
      } else if (this.state === "pending") {
        this.onFulfilledCallback.push(handleFulfilled)
        this.onRejectedCallback.push(handleRejected)
      }
    })
  }

  catch<U>(onRejected: (reason: any) => U): FakePromise<U> {
    return this.then(null, onRejected)
  }
}

function promiseResolutionProcedure<U>(
  promise2: FakePromise<U>,
  x: any,
  resolve: (value: U) => void,
  reject: (reason: any) => void
) {
  if (promise2 === x) {
    return reject(new TypeError("Chaining cycle detected for promise"))
  }

  if (x instanceof FakePromise) {
    switch (x.state){
      case 'pending':
        x.then(resolve, reject)
        break
      case 'fulfilled':
        resolve(x.data)
        break
      case 'rejected':
        reject(x.data)
    }
    return
  }

  if (x && (typeof x === "object" || typeof x === "function")) {
    let isCalled = false

    try {
      if (typeof x.then === "function") {
        x.then.call(
          x,
          (y: any) => {
            if (isCalled) return
            isCalled = true
            return promiseResolutionProcedure(promise2, y, resolve, reject)
          },
          (r: any) => {
            if (isCalled) return
            isCalled = true
            return reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (e) {
      if (isCalled) return
      isCalled = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}

// Execute your test cases
const case1 = new FakePromise<number>((resolve) => {
  setTimeout(() => {
    resolve(1)
  })
})

case1.then(console.log) // => 1

const case2 = new FakePromise<number>((resolve, reject) => {
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

case3.then(data => ++data).then(console.log) // => 2

const case4 = new FakePromise<number>((resolve) => {
  resolve(4)
})

case4.then(console.log) // => 4

const case5 = new FakePromise<number>((resolve, reject) => {
  reject(Error('wrong'))
})

case5.catch(console.error) // => Error('wrong')
