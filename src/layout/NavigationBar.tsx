import React from "react";
import {Menu, Container} from "semantic-ui-react";
import {observer} from "mobx-react-lite";
import {NavLink} from "react-router-dom";

const NavigationBar: React.FC = () => {
    return (
        <Menu fixed="top" vertical>
            <Container>
                <Menu.Item header as={NavLink} exact to="/">
                    Ana Sayfa
                </Menu.Item>
                <Menu.Item name="01 First" as={NavLink} to="/01"/>
            </Container>
        </Menu>
    );
};

export default observer(NavigationBar);
