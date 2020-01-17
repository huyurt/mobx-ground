import {action, autorun, observable} from "mobx";
import {ICart} from "../model/ICart";
import {RootStore} from "./rootStore";

export default class x01FirstStore {
    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;

        autorun(() => {
            console.log(`The cart contains ${this.cart.itemCount} item(s).`);
        });
    }

    @observable cart: ICart = {
        itemCount: 0,
        modified: new Date()
    };

    @action incrementCount = () => {
        this.cart.itemCount++;
    };
}