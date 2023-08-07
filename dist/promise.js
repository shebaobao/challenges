"use strict";
class FakePromise {
    constructor(handler) {
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];
        handler((value) => {
            this.value = value;
            this.onFulfilledCallbacks.forEach(callback => callback(value));
        }, (error) => {
            this.error = error;
            this.onRejectedCallbacks.forEach(callback => callback(error));
        });
    }
    then(callback) {
        if (this.value !== undefined) {
            callback(this.value);
        }
        else {
            this.onFulfilledCallbacks.push(callback);
        }
        return this;
    }
    catch(callback) {
        if (this.error !== undefined) {
            callback(this.error);
        }
        else {
            this.onRejectedCallbacks.push(callback);
        }
        return this;
    }
}
// 执行您的测试案例
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
case3.then(data => data++).then(console.log); // => 2
const case4 = new FakePromise((resolve) => {
    resolve(4);
});
case4.then(console.log); // => 4
const case5 = new FakePromise((resolve, reject) => {
    reject(Error('wrong'));
});
case5.catch(console.error); // => Error('wrong')
