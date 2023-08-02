# 实现简单的 Promise

## 要求

1. 使用 Typescript 实现一个 FakePromise 类。
2. 必须实现全部 case 效果。
3. FakePromise 的入参须有类型定义。

## 内容

```ts
class FakePromise {
  constructor(handler) {

  }

  then (callback) {
    return this
  }

  catch (callback) {
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

case3.then(data => data++).then(console.log) // => 2

```
