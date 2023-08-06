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
关闭 copilot
链表 promise

```ts
type callbackType<T> = (res?:T) =>any

class FakePromise<T> {
  status: 'padding' | 'fulfilled' | 'rejected'
  onfulfilled: callbackType<T>
  onrejected?: callbackType<T>
  catchCallback?: callbackType<T>
  finalCallback?: callbackType<T>
  // 下一个 promise
  next?: FakePromise<T>
  // 尾部 Promise
  last?: FakePromise<T>
  // 类型方法暂存值
  tempValue: T

  constructor (handler?:(resolve: callbackType<T>, reject: callbackType<T>) => void) {
    this.status = 'padding'
    setTimeout(() => {
      handler?.((res) => {
        this.start(res, 'fulfilled')
      }, (res) => {
        this.start(res, 'rejected')
      })
    })

    return this
  }

  start (res:T, status: 'fulfilled' | 'rejected'):void {
    // 维护链表指向
    let nextCurr = this.next
    nextCurr.status = status
    // 维护状态
    let currStatus = status
    // 维护返回值
    let value:any = res

    while (nextCurr) {
      if (nextCurr.status === 'fulfilled') {
        value = nextCurr.onfulfilled(value)
        nextCurr = nextCurr.next
        nextCurr && (nextCurr.status = 'fulfilled')
        currStatus = 'fulfilled'
      }
      else if (nextCurr.status === 'rejected') {
        if (nextCurr.onrejected) {
          value = nextCurr.onrejected(value)
          nextCurr = nextCurr.next
          nextCurr && (nextCurr.status = 'fulfilled')
          currStatus = 'fulfilled'
        } else {
          // 跳过没有rejected的 then
          nextCurr = nextCurr.next
          nextCurr && (nextCurr.status = 'rejected')
        }
      }
      // 如果返回 FakePromise 则改变指向
      if (value instanceof FakePromise) {
        nextCurr && (nextCurr.status = value.status)
        currStatus = value.status as ('fulfilled' | 'rejected')
        value = value.tempValue
      }
    }
    // 是否调用最后的 catch
    if (currStatus === 'rejected') {
      value = this.catchCallback?.(value)
    }
    // 调用 finally 方法
    this.finalCallback?.(value)
  }

  then (onfulfilled:callbackType<T>, onrejected?:callbackType<T>):FakePromise<T> {
    const temp = new FakePromise<T>()
    temp.onfulfilled = onfulfilled
    temp.onrejected = onrejected

    // 构建链表
    if (!this.next) {
      this.next = temp
      this.last = temp
    } else {
      this.last.next = temp
      this.last = temp
    }
    return this
  }
  catch (onrejected:callbackType<T>) : FakePromise<T> {
    this.catchCallback = onrejected
    return this
  }
  finally (onfinally:callbackType<T>) :FakePromise<T> {
    this.finalCallback = onfinally
    return this
  }
  static resolve (res:any) {
    const temp = new FakePromise()
    temp.status = 'fulfilled'
    temp.tempValue = res
    return temp
  }
  static reject (res:any) {
    const temp = new FakePromise()
    temp.status = 'rejected'
    temp.tempValue = res
    return temp
  }
}



const temp = new FakePromise<number>((resolve, reject) => {
  reject(1)
})
  .then (
    (res) => {
      console.log('then-1-1', res)
      return res + 1
    },
    res => {
      console.log('then-1-2', res)
      return FakePromise.reject(res + 1)
    }
  )
  .then (
    res => {
      console.log('then-2-1', res)
      return res + 1
    },
    res => {
      console.log('then-2-2', res)
      return res + 1
    }
  )
  .catch(res => {
    console.log('error', res)
    return res + 1
  })
  .finally(res => {
    console.log('finally', res)
  })


```
