import React, {useContext} from 'react';
import {RootStoreContext} from "../store/rootStore";
import {observer} from "mobx-react-lite";
import {Header, Grid, Button} from "semantic-ui-react";

const X01First: React.FC = () => {
    const rootStore = useContext(RootStoreContext);
    const {cart, incrementCount} = rootStore.x01FirstStore;

    return (
        <Grid>
            <Grid.Column width={10}>
                <Header as='h1'>
                    Count:&nbsp;
                    <Header as='h4'>
                        {cart.itemCount}
                    </Header>
                </Header>
                <Button
                    primary
                    onClick={incrementCount}
                >
                    Tab Here
                </Button>
            </Grid.Column>
        </Grid>
    );
};

export default observer(X01First);
