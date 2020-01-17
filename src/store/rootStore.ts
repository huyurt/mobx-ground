import {createContext} from "react";
import {configure} from "mobx";
import x01FirstStore from "./x01FirstStore";

configure({enforceActions: 'always'});

export class RootStore {
    x01FirstStore: x01FirstStore;

    constructor() {
        this.x01FirstStore = new x01FirstStore(this);
    }
}

export const RootStoreContext = createContext(new RootStore());
