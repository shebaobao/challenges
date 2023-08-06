# 实现简单的 Promise

## 要求

1. 使用 Typescript 实现一个 FakePromise 类。
2. 必须实现全部 case 效果。
3. FakePromise 的入参须有类型定义。

## 内容

```ts

type State = 'pending' | 'rejected' | 'fulfilled'
type callbackType = (val: any) => any 

class FakePromise {
  state: State = 'pending'
  value: any
  thenQueue: Function[] = []
  catchQueue: Function[] = []
    
  constructor(callback: { (f1: callbackType, f2: callbackType): any }) {
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
  
  onSuccess(value: any) {
  	queueMicrotask(() => {
      if (this.state !== 'pending') return
      this.state = 'fulfilled'
      this.value = value
      this.runCallbacks()
    })
  }
  
  onFail(value: any) {
  	queueMicrotask(() => {
      if (this.state !== 'pending') return
      this.state = 'rejected'
      this.value = value
      this.runCallbacks()
    })
  }

  then(thenCb: callbackType, catchCb?: callbackType) {
  	return new FakePromise((resolve, reject) => {
  	      this.thenQueue.push(result => {
  	        if (thenCb === null) {
  	          resolve(result)
  	          return 
  	        }
  	        
  	        try {
  	          resolve(thenCb(result))
  	        } catch(e) {
  	          reject(e)
  	        }
  	        
  	      })
  	      
  	      this.catchQueue.push(result => {
  	        if (catchCb === null) {
  	          reject(result)
  	          return 
  	        }
  	        
  	        try {
  	          resolve(catchCb(result))
  	        } catch(e) {
  	          reject(e)
  	        }
  	        
  	      })
  	
  	      this.runCallbacks()
  	    })
  }

  catch(callback: callbackType) {
  	this.then(undefined, callback)
  }
  
  finally(callback: callbackType) {
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
  
  static resolve(value: any) {
  	return new FakePromise(resolve => {
    	resolve(value)
    })
  }
  
  static reject(value: any) {
  	return new FakePromise((resolve, reject) => {
    	reject(value)
    })
  }
}

  const case1 = new FakePromise((resolve, reject) => {
  setTimeout(() => {
    resolve(1)
    reject(2)
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
      resolve(2)
    })
  })
  
  case3.then(data => data++).then(console.log) // => 2
  
  
const case4 = new FakePromise((resolve, reject) => {
  resolve(4)
})

case4.then(console.log) // => 4

const case5 = new FakePromise((resolve, reject) => {
  reject(Error('wrong'))
})

case5.catch(console.error) // => Error('wrong')
```
