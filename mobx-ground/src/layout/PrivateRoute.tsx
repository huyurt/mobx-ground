import React  from "react";
import {
  RouteProps,
  RouteComponentProps,
  Route
} from "react-router-dom";
import { observer } from "mobx-react-lite";

interface IProps extends RouteProps {
  component: React.ComponentType<RouteComponentProps<any>>;
}

const PrivateRoute: React.FC<IProps> = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props =>
        <Component {...props} />
      }
    />
  );
};

export default observer(PrivateRoute);
