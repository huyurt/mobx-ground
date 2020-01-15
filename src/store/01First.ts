import {action, autorun, observable} from "mobx";

let cart = observable({
    itemCount: 0,
    modified: new Date()
});

autorun(() => {
    console.log(`The cart contains ${cart.itemCount} item(s).`);
});

const incrementCount = action(() => {
    cart.itemCount++;
});

incrementCount();
