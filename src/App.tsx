import React, {Fragment} from "react";
import {Container} from "semantic-ui-react";
import {observer} from "mobx-react-lite";
import NavigationBar from "./components/NavigationBar";
import {
    Route,
    withRouter,
    RouteComponentProps,
    Switch
} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import x01First from "./screen/x01First";

const App: React.FC<RouteComponentProps> = ({location}) => {
    return (
        <Fragment>
            <ToastContainer position="bottom-right"/>
            {//<Route exact path="/" component={AnaSayfa} />
            }
            <Route
                render={() => (
                    <Fragment>
                        <NavigationBar/>
                        <Container style={{marginTop: "7em"}}>
                            <Switch>
                                <Route
                                    exact
                                    path="/x01First"
                                    component={x01First}
                                />
                                {/*
                      <PrivateRoute
                          path="/etkinlikler/:id"
                          component={EtkinlikDetaylari}
                      />
                      <PrivateRoute
                          key={location.key}
                          path={["/etkinlikOlustur", "/manage/:id"]}
                          component={EtkinlikForm}
                      />
                      <PrivateRoute
                          path="/profil/:username"
                          component={ProfilSayfasi}
                      />
                      <Route component={NotFound} />
                      */}
                            </Switch>
                        </Container>
                    </Fragment>
                )}
            />
        </Fragment>
    );
};

export default withRouter(observer(App));
