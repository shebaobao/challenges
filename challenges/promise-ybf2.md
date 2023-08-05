# 实现简单的 Promise

## 要求

1. 使用 Typescript 实现一个 FakePromise 类。
2. 必须实现全部 case 效果。
3. FakePromise 的入参须有类型定义。

## 内容
关闭 copilot
不参考文档
AI 找 bug
迭代器模拟 promise

```ts

type callbackType = (res:any) => any
type handlerType = (
  resolve:callbackType,
  reject:callbackType
) => void

class FakePromise {
  handler: handlerType
  thenQueue: [callbackType, callbackType][]
  endCatch: callbackType
  finalCallback: callbackType
  status: 'padding' | 'fulfilled' | 'rejected'

  constructor (handler:handlerType) {
    this.handler = handler
    this.status = 'padding'
    this.thenQueue = []

    setTimeout(() => {
      this.handler(
        (res) => {
          this.status = 'fulfilled'
          this.start(res)
        },
        (res) => {
          this.status = 'rejected'
          this.start(res)
        })
    })
  }

  start (res:any) {
    const control = this.step(res)
    let last = control.next()
    while (!last.done) {
      last = control.next(last.value)
    }
    if (this.status === 'rejected') {
      this.endCatch?.(last.value)
    }
    this.finally?.(last.value)
  }

  *step (res:any):any {
    let temp = res
    for (const [onfulfilled, onrejected] of this.thenQueue) {
      if (this.status === 'fulfilled') {
        temp = onfulfilled(temp)
      } else if (onrejected) {
        this.status = 'fulfilled'
        temp = onrejected(temp)
      }
      yield temp
    }
    return temp
  }

  then (onfulfilled:callbackType, onrejected?:callbackType) {
    this.thenQueue.push([onfulfilled, onrejected])
    return this
  }
  catch (onrejected:callbackType) {
    this.endCatch = onrejected
    return this
  }
  finally (callback:callbackType) {
    this.finalCallback = callback
    return this
  }

  resolve (res:any) {
    this.status = 'fulfilled'
    return res
  }
  reject (res:any) {
    this.status = 'rejected'
    return res
  }
}


const temp:any = new FakePromise((resolve, reject) => {
  resolve (1)
})
  .then (
    res => {
      console.log('then-1-1', res)
      return res + 1
    },
    res => {
      console.log('then-1-2', res)
      return res + 1
    }
  )
  .then (
    res => {
      console.log('then-2-1', res)
      return temp.reject(res + 1)
    },
    res => {
      console.log('then-2-2', res)
      return res + 1
    }
  )
  .then (
    res => {
      console.log('then-3-1', res)
      return res + 1
    },
    res => {
      console.log('then-3-2', res)
      return res + 1
    }
  )
  .then (
    res => {
      console.log('then-4-1', res)
      return res + 1
    },
    res => {
      console.log('then-4-2', res)
      return res + 1
    }
  )
  .catch(e => {
    console.log('catch', e)
  })
  .finally(e => {
    console.log('finally', e)
  })



// new Promise<number>((resolve, reject) => {
//   reject (1)
// }).then (
//   res => {
//     console.log('then-1-1', res)
//     return res + 1
//   },
//   // res => {
//   //   console.log('then-1-2', res)
//   //   return Promise.reject(res + 1)
//   // }
// ).then (
//   res => {
//     console.log('then-2-1', res)
//     return res + 1
//   },
//   // res => {
//   //   console.log('then-2-2', res)
//   //   return res + 1
//   // }
// )
//   .catch(e => {
//     console.log(e)
//   })

```
