---
typora-copy-images-to: images
---

# Notes About MobX

## 1. Introduction

MobX is a reactive state management library.

![flow](notes/images/flow.png)

## 2. Observables, Actions, and Reactions

Observables capture the state of application. Observers (also called reactions) include both the side effect handlers as well as the UI. The actions are that cause a change in the observable state.

observers -> autorun, reactions, when

```typescript
import { observable, autorun, action } from 'mobx';

let cart = observable({
	itemCount: 0,
    modified: new Date()
});

autorun(() => {
	console.log(`The Cart contains ${cart.itemCount} item(s).`);
});

const incrementCount = action(() => {
    cart.itemCount++;
});

incrementCount();
```

 `autorun` makes the passed-in function (the tracking-function) an observer of the observables it references.

### Observables

An observer can observe one or more observables and get notified when any of them change value.

The simplest way to create an observable is to use the `observable()` function (`observable.object()` when using regular JavaScript):

````typescript
const item = observable({
    name: 'Tükenmez Kalem',
    itemId: '12345',
    quantity: 3,
    price: 33,
    coupon: {
		code: '2020YENIYIL',
		discountPercent: 15
    }
});
````

The `observable()` function automatically converts an object, an array, or a map into an observable entity. This automatic conversion is not applied for other types of data such as JavaScript primitives (number, string, boolean, null, undefined), functions, or for class-instances (objects with prototypes). So, if you call `observable(50)`, it will fail with an error.

We have to use the more specialized `observable.box()` to convert primitive values into an observable. Observables that wrap primitives, functions, or class-instances are called **boxed observables**.

```typescript
const count = observable.box(15);
console.log(`Count is ${count.get()}`); // Get the count
count.set(25); // Change count
```

|                                        |                          |
| -------------------------------------- | ------------------------ |
| objects                                | `observable.object({ })` |
| arrays                                 | `observable.array([ ])`  |
| maps                                   | `observable.map(value)`  |
| primitives, functions, class-instances | `observable.box(value)`  |

