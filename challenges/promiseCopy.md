# 实现简单的 Promise

## 要求

1. 使用 Typescript 实现一个 FakePromise 类。
2. 必须实现全部 case 效果。
3. FakePromise 的入参须有类型定义。

## 内容

```ts

// 对于代码中有的实现, 有的同学可能会有疑问, 这里为什么会有异常, 为什么一定要这么写. 
// 大家可以去看一下promise aplus的测试用例, 里面列举了各种奇奇怪怪的异常情况 https://github.com/promises-aplus/promises-tests/blob/master/lib/tests.

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MPromise {

    FULFILLED_CALLBACK_LIST = [];
    REJECTED_CALLBACK_LIST = [];
    _status = PENDING;
    constructor(fn) {
        // 初始状态为pending
        this.status = PENDING;
        this.value = null;
        this.reason = null;
        try {
            fn(this.resolve.bind(this), this.reject.bind(this));
        } catch (e) {
            this.reject(e);
        }
    }

    get status() {
        return this._status;
    }

    set status(newStatus) {
        this._status = newStatus;
        switch (newStatus) {
            case FULFILLED: {
                this.FULFILLED_CALLBACK_LIST.forEach(callback => {
                    callback(this.value);
                });
                break;
            }
            case REJECTED: {
                this.REJECTED_CALLBACK_LIST.forEach(callback => {
                    callback(this.reason);
                });
                break;
            }
        }
    }

    resolve(value) {
        if (this.status === PENDING) {
            this.value = value;
            this.status = FULFILLED;
        }
    }

    reject(reason) {
        if (this.status === PENDING) {
            this.reason = reason;
            this.status = REJECTED;
        }
    }

    then(onFulfilled, onRejected) {
        const realOnFulfilled = this.isFunction(onFulfilled) ? onFulfilled : (value) => {
            return value
        }
        const realOnRejected = this.isFunction(onRejected) ? onRejected : (reason) => {
            throw reason;
        };
        const promise2 = new MPromise((resolve, reject) => {
            const fulfilledMicrotask = () => {
                queueMicrotask(() => {
                    try {
                        const x = realOnFulfilled(this.value);
                        this.resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e)
                    }
                })
            };
            const rejectedMicrotask = () => {
                queueMicrotask(() => {
                    try {
                        const x = realOnRejected(this.reason);
                        this.resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                })
            }

            switch (this.status) {
                case FULFILLED: {
                    fulfilledMicrotask()
                    break;
                }
                case REJECTED: {
                    rejectedMicrotask()
                    break;
                }
                case PENDING: {
                    this.FULFILLED_CALLBACK_LIST.push(fulfilledMicrotask)
                    this.REJECTED_CALLBACK_LIST.push(rejectedMicrotask)
                }
            }
        })
        return promise2

    }

    catch (onRejected) {
        return this.then(null, onRejected);
    }

    isFunction(param) {
        return typeof param === 'function';
    }

    resolvePromise(promise2, x, resolve, reject) {
        // 如果 newPromise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 newPromise
        // 这是为了防止死循环
        if (promise2 === x) {
            return reject(new TypeError('The promise and the return value are the same'));
        }

        if (x instanceof MPromise) {
            // 如果 x 为 Promise ，则使 newPromise 接受 x 的状态
            // 也就是继续执行x，如果执行的时候拿到一个y，还要继续解析y
            queueMicrotask(() => {
                x.then((y) => {
                    this.resolvePromise(promise2, y, resolve, reject);
                }, reject);
            })
        } else if (typeof x === 'object' || this.isFunction(x)) {
            // 如果 x 为对象或者函数
            if (x === null) {
                // null也会被判断为对象
                return resolve(x);
            }

            let then = null;

            try {
                // 把 x.then 赋值给 then 
                // 这种首先保存 x.then 的引用，然后测试此引用，再调用此引用的处理，避免了对 x.then 属性的多次访问。这种预防措施在面对一些特殊访问器时十分重要，因为有的访问器每次访问都会导致其值的改变。
                then = x.then;
            } catch (error) {
                // 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise
                return reject(error);
            }

            // 如果 then 是函数
            if (this.isFunction(then)) {
                let called = false;
                // 将 x 作为函数的作用域 this 调用
                // 传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise
                try {
                    then.call(
                        x,
                        // 如果 resolvePromise 以值 y 为参数被调用，则运行 resolvePromise
                        (y) => {
                            // 需要有一个变量called来保证只调用一次.
                            if (called) return;
                            called = true;
                            this.resolvePromise(promise2, y, resolve, reject);
                        },
                        // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
                        (r) => {
                            if (called) return;
                            called = true;
                            reject(r);
                        });
                } catch (error) {
                    // 如果调用 then 方法抛出了异常 e：
                    if (called) return;

                    // 否则以 e 为据因拒绝 promise
                    reject(error);
                }
            } else {
                // 如果 then 不是函数，以 x 为参数执行 promise
                resolve(x);
            }
        } else {
            // 如果 x 不为对象或者函数，以 x 为参数执行 promise
            resolve(x);
        }
    }

    static resolve(value) {
        if (value instanceof MPromise) {
            return value;
        }

        return new MPromise((resolve) => {
            resolve(value);
        });
    }

    static reject(reason) {
        return new MPromise((resolve, reject) => {
            reject(reason);
        });
    }

    static race(promiseList) {
        return new MPromise((resolve, reject) => {
            const length = promiseList.length;

            if (length === 0) {
                return resolve();
            } else {
                for (let i = 0; i < length; i++) {
                    MPromise.resolve(promiseList[i]).then(
                        (value) => {
                            return resolve(value);
                        },
                        (reason) => {
                            return reject(reason);
                        });
                }
            }
        });

    }

    static resolved(value) {
        var d = new Deferred();
        d.resolve(value);
        return d.promise;
    };

    static rejected(value) {
        var d = new Deferred();
        d.reject(value);
        return d.promise;
    };
}


function Deferred() {
    this.promise = new MPromise(function (resolve, reject) {
        this._resolve = resolve;
        this._reject = reject;
    }.bind(this));
}
Deferred.prototype.resolve = function (value) {
    this._resolve.call(this.promise, value);
};
Deferred.prototype.reject = function (reason) {
    this._reject.call(this.promise, reason);
};

var dummy = {
    dummy: "dummy"
};

var sentinel = {
    sentinel: "sentinel"
}; // a sentinel fulfillment value to test for with strict equality
var other = {
    other: "other"
};

function xFactory() {
    var d = new Deferred();
    setTimeout(function () {
        d.resolve(sentinel);
    }, 50);

    return {
        then: function (resolvePromise, rejectPromise) {
            resolvePromise(d.promise);
            rejectPromise(other);
        }
    };
}

var promise = MPromise.resolved(dummy).then(function onBasePromiseFulfilled() {
    return xFactory();
});

// var promise = MPromise.reject(dummy).then(null, function onBasePromiseRejected() {
//     return xFactory();
// });

promise.then((res) => {
    console.log(res);
}, (res) => {
    console.log(res);
})

```
