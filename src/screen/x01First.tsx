import React, {useContext} from 'react';
import {observer} from "mobx-react-lite";
import {RootStoreContext} from "../store/rootStore";
import {Button, Header, Grid} from "semantic-ui-react";

const x01First: React.FC = () => {
    const rootStore = useContext(RootStoreContext);
    const {cart, incrementCount} = rootStore.x01FirstStore;

    return (
        <Grid>
            <Grid.Row>
                <Grid.Column>
                    <Header as='h1'>
                        Count:&nbsp;
                        <Header as='h4'>
                            {cart.itemCount}
                        </Header>
                    </Header>
                    <Button
                        label='Tab Here'
                        onClick={incrementCount}
                    />
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );
};

export default observer(x01First);
