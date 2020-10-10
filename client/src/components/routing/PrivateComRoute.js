import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import AuthComContext from '../../context/authCom/authComContext';

const PrivateComRoute = ({ component: Component, ...rest }) => {
  const authComContext = useContext(AuthComContext);
  const { isAuthenticated } = authComContext;
  return (
    <Route
      {...rest}
      render={(props) =>
        !isAuthenticated ? (
          <Redirect to='/api/auth/company' />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};

export default PrivateComRoute;
