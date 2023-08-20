"use strict";
class FakePromise {
    constructor(executor) {
        this.state = "pending";
        this.onFulfilledCallback = [];
        this.onRejectedCallback = [];
        const resolve = (value) => {
            setTimeout(() => {
                if (this.state === "pending") {
                    this.state = "fulfilled";
                    this.data = value;
                    this.onFulfilledCallback.forEach((callback) => callback(value));
                }
            });
        };
        const reject = (reason) => {
            setTimeout(() => {
                if (this.state === "pending") {
                    this.state = "rejected";
                    this.data = reason;
                    this.onRejectedCallback.forEach((callback) => callback(reason));
                }
            });
        };
        try {
            executor(resolve, reject);
        }
        catch (reason) {
            reject(reason);
        }
    }
    then(onFulfilled, onRejected) {
        return new FakePromise((resolve, reject) => {
            const handleFulfilled = () => {
                setTimeout(() => {
                    if (typeof onFulfilled === "function") {
                        try {
                            const x = onFulfilled(this.data);
                            promiseResolutionProcedure(this, x, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                    else {
                        resolve(this.data);
                    }
                });
            };
            const handleRejected = () => {
                setTimeout(() => {
                    if (typeof onRejected === "function") {
                        try {
                            const x = onRejected(this.data);
                            promiseResolutionProcedure(this, x, resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    }
                    else {
                        reject(this.data);
                    }
                });
            };
            if (this.state === "fulfilled") {
                handleFulfilled();
            }
            else if (this.state === "rejected") {
                handleRejected();
            }
            else if (this.state === "pending") {
                this.onFulfilledCallback.push(handleFulfilled);
                this.onRejectedCallback.push(handleRejected);
            }
        });
    }
    catch(onRejected) {
        return this.then(null, onRejected);
    }
}
function promiseResolutionProcedure(promise2, x, resolve, reject) {
    if (promise2 === x) {
        return reject(new TypeError("Chaining cycle detected for promise"));
    }
    if (x instanceof FakePromise) {
        switch (x.state) {
            case 'pending':
                x.then(resolve, reject);
                break;
            case 'fulfilled':
                resolve(x.data);
                break;
            case 'rejected':
                reject(x.data);
        }
        return;
    }
    if (x && (typeof x === "object" || typeof x === "function")) {
        let isCalled = false;
        try {
            if (typeof x.then === "function") {
                x.then.call(x, (y) => {
                    if (isCalled)
                        return;
                    isCalled = true;
                    return promiseResolutionProcedure(promise2, y, resolve, reject);
                }, (r) => {
                    if (isCalled)
                        return;
                    isCalled = true;
                    return reject(r);
                });
            }
            else {
                resolve(x);
            }
        }
        catch (e) {
            if (isCalled)
                return;
            isCalled = true;
            reject(e);
        }
    }
    else {
        resolve(x);
    }
}
// Execute your test cases
const case1 = new FakePromise((resolve) => {
    setTimeout(() => {
        resolve(1);
    });
});
case1.then(console.log); // => 1
const case2 = new FakePromise((resolve, reject) => {
    setTimeout(() => {
        reject(Error('wrong'));
    });
});
case2.catch(console.error); // => Error('wrong')
const case3 = new FakePromise((resolve) => {
    setTimeout(() => {
        resolve(1);
    });
});
case3.then(data => ++data).then(console.log); // => 2
const case4 = new FakePromise((resolve) => {
    resolve(4);
});
case4.then(console.log); // => 4
const case5 = new FakePromise((resolve, reject) => {
    reject(Error('wrong'));
});
case5.catch(console.error); // => Error('wrong')
