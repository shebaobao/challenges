# 实现简单的 Promise

## 要求

1. 使用 Typescript 实现一个 FakePromise 类。
2. 必须实现全部 case 效果。
3. FakePromise 的入参须有类型定义。

## 内容

```ts

type callbackType = (res:any) => any
type handlerType = (
  resolve:callbackType,
  reject:callbackType
) => void

class FakePromise {
  handler: handlerType
  thenQueue: callbackType[]
  catchQueue: callbackType[]
  status: 'padding' | 'resolve' | 'reject'

  constructor (handler:handlerType) {
    this.handler = handler
    this.status = 'padding'
    this.thenQueue = []
    this.catchQueue = []

    setTimeout(() => {
      this.start()
    })
  }

  start () {
    this.handler(
      (res) => {
        let temp = res
        for (const item of this.thenQueue) {
          temp = item(temp)
        }
      },
      (res) => {
        let temp = res
        for (const item of this.catchQueue) {
          temp = item(temp)
        }
      })
  }


  then (callback:callbackType) {
    this.thenQueue.push(callback)
    return this
  }

  catch (callback:callbackType) {
    this.catchQueue.push(callback)
    return this
  }
}

const case1 = new FakePromise((resolve, reject) => {
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

const case3 = new FakePromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
  })
})

case3.then(data => ++data).then(console.log) // => 2


const case4 = new FakePromise((resolve, reject) => {
  resolve(4)
})

case4.then(console.log) // => 4

const case5 = new FakePromise((resolve, reject) => {
  reject(Error('wrong'))
})

case5.catch(console.error) // => Error('wrong')

```
