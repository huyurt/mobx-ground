import React from "react";
import {Menu, Container} from "semantic-ui-react";
import {observer} from "mobx-react-lite";
import {NavLink} from "react-router-dom";

const NavigationBar: React.FC = () => {
    return (
        <Menu fixed="top" inverted vertical>
            <Container>
                <Menu.Item
                    as={NavLink}
                    to="/x01First"
                    name="x01First"
                />
            </Container>
        </Menu>
    );
};

export default observer(NavigationBar);
