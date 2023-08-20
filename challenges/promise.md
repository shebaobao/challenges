# 实现简单的 Promise

## 要求

1. 使用 Typescript 实现一个 FakePromise 类。
2. 必须实现全部 case 效果。
3. FakePromise 的入参须有类型定义。

## 内容

```ts

type State = 'pending' | 'rejected' | 'fulfilled'

class FakePromise<T = any> {
  state: State = 'pending'
  value: any
  thenQueue: Function[] = []
  catchQueue: Function[] = []
    
  constructor(callback: (resolve: (value: T) => void, reject?: (reason: any) => void) => void) {
    try{
      callback(this.onSuccess.bind(this), this.onFail.bind(this))
    } catch(e) {
    	this.onFail(e)
    }
  }
  
  runCallbacks() {
  	if (this.state === 'fulfilled') {
    	this.thenQueue.forEach(callback => {
      	callback(this.value)
      })
      
      this.thenQueue = []
    }
    
  	if (this.state === 'rejected') {
    	this.catchQueue.forEach(callback => {
      	callback(this.value)
      })
      
      this.catchQueue = []
    }
  }
  
  onSuccess(value: T) {
  	queueMicrotask(() => {
      if (this.state !== 'pending') return
      this.state = 'fulfilled'
      this.value = value
      this.runCallbacks()
    })
  }
  
  onFail(reason: any) {
  	queueMicrotask(() => {
      if (this.state !== 'pending') return
      this.state = 'rejected'
      this.value = reason
      this.runCallbacks()
    })
  }

  then(onFulfilled?: (value: T) => void, onRejected?: (reason: any) => void) {
  	return new FakePromise((resolve, reject) => {
  	      this.thenQueue.push((result: T) => {
  	        if (onFulfilled === null) {
  	          resolve(result)
  	          return 
  	        }
  	        
  	        try {
  	          resolve(onFulfilled(result))
  	        } catch(e) {
  	          reject(e)
  	        }
  	      })
  	      
  	      this.catchQueue.push((result: any) => {
  	        if (onRejected === null) {
  	          reject(result)
  	          return 
  	        }
  	        
  	        try {
  	          resolve(onRejected(result))
  	        } catch(e) {
  	          reject(e)
  	        }
  	      })
  	
  	      this.runCallbacks()
  	    })
  }

  catch(onRejected: (reason: any) => void) {
  	this.then(undefined, onRejected)
  }
  
  finally(callback: () => void) {
  	return this.then(
    	result => {
      	callback()
        return result
      },
      result => {
      	callback()
        throw result
      }
    )
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

case3.then(data => data+1).then(console.log) // => 2
  
  
const case4 = new FakePromise((resolve, reject) => {
  resolve(4)
})

case4.then(console.log) // => 4

const case5 = new FakePromise((resolve, reject) => {
  reject(Error('wrong'))
})

case5.catch(console.error) // => Error('wrong')

```
