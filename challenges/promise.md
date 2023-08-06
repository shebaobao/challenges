# 实现简单的 Promise

## 要求

1. 使用 Typescript 实现一个 FakePromise 类。
2. 必须实现全部 case 效果。
3. FakePromise 的入参须有类型定义。

## 内容

```ts
type Callback<T> = (value: T) => void;

class FakePromise<T> {
  private value: T | undefined;
  private error: Error | undefined;
  private onFulfilledCallbacks: Callback<T>[] = [];
  private onRejectedCallbacks: Callback<Error>[] = [];
  private resolved: boolean = false;
  private rejected: boolean = false;

  constructor(handler: (resolve: Callback<T>, reject: Callback<Error>) => void) {
    const resolve: Callback<T> = (value: T) => {
      if (!this.resolved && !this.rejected) {
        this.value = value;
        this.resolved = true;
        this.onFulfilledCallbacks.forEach(callback => callback(value));
      }
    };

    const reject: Callback<Error> = (error: Error) => {
      if (!this.resolved && !this.rejected) {
        this.error = error;
        this.rejected = true;
        this.onRejectedCallbacks.forEach(callback => callback(error));
      }
    };

    try {
      handler(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(callback: Callback<T>): FakePromise<T> {
    if (this.resolved) {
      callback(this.value!);
    } else {
      this.onFulfilledCallbacks.push(callback);
    }
    return this;
  }

  catch(callback: Callback<Error>): FakePromise<T> {
    if (this.rejected) {
      callback(this.error!);
    } else {
      this.onRejectedCallbacks.push(callback);
    }
    return this;
  }
}

const case1 = new FakePromise<number>((resolve) => {
  setTimeout(() => {
    resolve(1);
  });
});

case1.then(console.log); // => 1

const case2 = new FakePromise<number>((resolve, reject) => {
  setTimeout(() => {
    reject(Error('wrong'));
  });
});

case2.catch(console.error); // => Error('wrong')

const case3 = new FakePromise<number>((resolve) => {
  setTimeout(() => {
    resolve(1);
  });
});

case3.then(data => data++).then(console.log); // => 2

const case4 = new FakePromise<number>((resolve) => {
  resolve(4);
});

case4.then(console.log); // => 4

const case5 = new FakePromise<number>((resolve, reject) => {
  reject(Error('wrong'));
});

case5.catch(console.error); // => Error('wrong')


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


const case4 = new FakePromise((resolue, reject) => {
  resolve(4)
})

case4.then(console.log) // => 4

const case5 = new FakePromise((resolve, reject) => {
  reject(Error('wrong'))
})

case5.catch(console.error) // => Error('wrong')

```
