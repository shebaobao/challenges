# 实现简单的 Promise

## 要求

1. 使用 Typescript 实现一个 FakePromise 类。
2. 必须实现全部 case 效果。
3. FakePromise 的入参须有类型定义。

## 规则
Promise A+规则:
1. Promise的状态：一个Promise可以处于三种状态之一：pending（进行中）、fulfilled（已完成）或rejected（已拒绝）。只能从pending状态转换到fulfilled或rejected状态，并且一旦转换，就不能再改变状态。
2. then方法：Promise对象必须提供一个then方法，用于注册回调函数。then方法接受两个参数：onFulfilled（当Promise状态变为fulfilled时调用的回调函数）和onRejected（当Promise状态变为rejected时调用的回调函数）。
3. 异步执行：Promise的回调函数必须异步执行，即在当前事件循环结束后执行，以确保Promise的状态能够正确传播。
4. 链式调用：then方法返回一个新的Promise对象，可以通过链式调用多个then方法。每个then方法可以返回一个值或一个新的Promise对象，用于构建Promise链。
5. 错误处理：如果在Promise链中的任何一个then方法中抛出异常或返回一个rejected状态的Promise，那么后续的then方法将被跳过，直到找到一个带有onRejected回调的then方法来处理错误。
6. Promise解决程序：Promise的解决程序是一个函数，它接受两个参数：resolve（用于将Promise状态转换为fulfilled的函数）和reject（用于将Promise状态转换为rejected的函数）。解决程序在Promise构造函数中被调用，并且负责执行异步操作并最终调用resolve或reject。

## 内容
Promise ts实现
```ts
enum PromiseStatus {
  PENDING = 'pending',
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected'
}

class MyPromise<T = any> {
  private status: PromiseStatus;
  private value: T | null;
  private reason: any | null;
  private onFulfilledCallbacks: Function[];
  private onRejectedCallbacks: Function[];

  constructor(executor: (resolve: (value: T) => void, reject: (reason: any) => void) => void) {
    this.status = PromiseStatus.PENDING;
    this.value = null;
    this.reason = null;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value: T) => {
      if (this.status === PromiseStatus.PENDING) {
        this.status = PromiseStatus.FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    }

    const reject = (reason: any) => {
      if (this.status === PromiseStatus.PENDING) {
        this.status = PromiseStatus.REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    }

    try {
      executor(resolve, reject);
    }
    catch (e) {
      reject(e);
    }
  }
  public then<TResult1 = T, TResult2 = never>(
    onFulfilled?: ((value: T) => TResult1 | MyPromise<TResult1>) | null,
    onRejected?: ((reason: any) => TResult2 | MyPromise<TResult2>) | null
  ): MyPromise<TResult1 | TResult2> {
    let promise2!: MyPromise<TResult1 | TResult2>

    if (this.status === PromiseStatus.FULFILLED) {
      promise2 = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            if (typeof onFulfilled !== 'function') {
              resolve(this.value as any);
            } else {
              const x = onFulfilled(this.value as any);
              this.resolvePromise(promise2, x, resolve, reject)
            }
          }
          catch (e) {
            reject(e);
          }
        }, 0);
      })
    }

    if (this.status === PromiseStatus.REJECTED) {
      promise2 = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            if (typeof onRejected !== 'function') {
              reject(this.reason);
            } else {
              const x = onRejected(this.reason);
              this.resolvePromise(promise2, x, resolve, reject)
            }
          }
          catch (e) {
            reject(e);
          }
        }, 0);
      })
    }

    if (this.status === PromiseStatus.PENDING) {
      promise2 = new MyPromise((resolve, reject) => {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              if (typeof onFulfilled !== 'function') {
                resolve(this.value as any);
              } else {
                const x = onFulfilled(this.value as any);
                this.resolvePromise(promise2, x, resolve, reject)
              }
            }
            catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              if (typeof onRejected !== 'function') {
                reject(this.reason);
              } else {
                const x = onRejected(this.reason);
                this.resolvePromise(promise2, x, resolve, reject)
              }
            }
            catch (e) {
              reject(e);
            }
          }, 0);
        });
      })
    }
    return promise2;
  }

  private resolvePromise(promise2: MyPromise, x: any, resolve: (value: any) => void, reject: (reason: any) => void) {
    if (promise2 === x) {
      reject(new TypeError('Chaining cycle detected for promise #<Promise>'));
    }
    if (x instanceof MyPromise) {
      x.then((y) => {
        this.resolvePromise(promise2, y, resolve, reject);
      },
        reject)

    } else if (typeof x === 'object' || typeof x === 'function') {
      if (x === null) resolve(x);

      let then;
      try {
        then = x.then;
      } catch (error) {
        return reject(error);
      }

      if (typeof then === 'function') {
        let called = false;
        try {
          then(
            (y: any) => {
              if (called) return;
              called = true;
              this.resolvePromise(promise2, y, resolve, reject);
            },
            (r: any) => {
              if (called) return;
              called = true;
              reject(r);
            })
        } catch (error) {
          if (called) return;
          reject(error);
        }
      } else {
        resolve(x);
      }
    } else {
      resolve(x);
    }
  }
}


const temp = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  }, 0);
})
temp.then(
  (res) => {
    console.log('then-1-1', res)
    return new MyPromise((resolve, reject) => {
      setTimeout(() => {
        resolve(res + 1)
      }, 0);
    })
  },
  res => {
    console.log('then-1-2', res)
    return new MyPromise((resolve, reject) => {
      setTimeout(() => {
        resolve(res + 1)
      }, 0);
    })
  }
)
  .then(
    res => {
      console.log('then-2-1', res)
      return new MyPromise((resolve, reject) => {
        setTimeout(() => {
          resolve(res + 1)
        }, 0);
      })
    },
    res => {
      console.log('then-2-2', res)
      return new MyPromise((resolve, reject) => {
        setTimeout(() => {
          resolve(res + 1)
        }, 0);
      })
    }
  )

```
