import React, {Fragment} from "react";
import {Container} from "semantic-ui-react";
import {observer} from "mobx-react-lite";
import {
    Route,
    withRouter,
    RouteComponentProps,
    Switch
} from "react-router-dom";
import NotFound from "./NotFound";
import {ToastContainer} from "react-toastify";
import PrivateRoute from "./PrivateRoute";
import NavigationBar from "./NavigationBar";
import X01First from "../screen/x01First";
import MainPage from "../screen/mainPage";

const App: React.FC<RouteComponentProps> = ({location}) => {
    return (
        <Fragment>
            <ToastContainer position="bottom-right"/>
            <Route
                render={() => (
                    <Fragment>
                        <NavigationBar/>
                        <Container style={{marginTop: "7em"}}>
                            <Switch>
                                <PrivateRoute
                                    exact
                                    path="/"
                                    component={MainPage}
                                />
                                <PrivateRoute
                                    exact
                                    path="/01"
                                    component={X01First}
                                />
                                <Route component={NotFound}/>
                            </Switch>
                        </Container>
                    </Fragment>
                )}
            />
        </Fragment>
    );
};

export default withRouter(observer(App));
