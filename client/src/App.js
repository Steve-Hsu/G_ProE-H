import React, { Fragment, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ComRegister from './components/authPage/00_ComRegister';

//Pages
import NotFound from './components/pages/NotFound';
import ComManager from './components/pages/01_ComManager';
import UserManager from './components/pages/11_UserManager';
import Director from './components/pages/21_Director';
import CaseMerchandiser from './components/pages/22_CaseMerchandiser';
import MPrice from './components/pages/31_MPrice';
import Quotation from './components/pages/41_Quotation';
import Purchase from './components/pages/51_Purchase';
import CompleteSet from './components/pages/61_CompleteSet';
//ComRouter
import ComLogin from './components/authPage/10_ComLogin';
import UserLogin from './components/authPage/20_UserLogin';

//CSS Sheet
import './App.css';
//Private route
import PrivateComRoute from './components/routing/PrivateComRoute';
import PrivateUserRoute from './components/routing/PrivateUserRoute';

//Context API
import PopoverState from './context/popover/PopoverState';
import ComState from './context/company/ComState';
import AuthComState from './context/authCom/AuthComState';
import AuthUserState from './context/authUser/AuthUserState';
import AlertState from './context/alert/AlterState';
import UserState from './context/user/UserState';
import CasesState from './context/cases/CasesState';
import SearchBarState from './context/searchBar/SearchBarState';
import SrMtrlState from './context/srMtrl/SrMtrlState';
import QuoState from './context/quo/QuoState';
import PurState from './context/pur/PurState';

//Global Header for token
import setAuthToken from './utils/setAuthToken';
import popoverReducer from './context/popover/popoverReducer';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  return (
    <AuthComState>
      <ComState>
        <UserState>
          <AuthUserState>
            <AlertState>
              <CasesState>
                <SearchBarState>
                  <SrMtrlState>
                    <QuoState>
                      <PurState>
                        <PopoverState>
                          <Router>
                            <Fragment>
                              <Navbar />
                              <div>
                                <Switch>
                                  <Route
                                    exact
                                    path='/registercom'
                                    component={ComRegister}
                                  />
                                  {/* on construction */}
                                  {/* <Route
                                    exact
                                    path='/registercom/manager'
                                    component={ComManager}
                                  /> */}
                                  {/* LoginPages */}
                                  <Route
                                    exact
                                    path='/api/auth/company'
                                    component={ComLogin}
                                  />
                                  <Route
                                    exact
                                    path='/api/auth/user'
                                    component={UserLogin}
                                  />
                                  {/* <PrivateRoute */}
                                  {/* <Route */}
                                  <PrivateComRoute
                                    exact
                                    path='/api/users'
                                    component={UserManager}
                                  />
                                  <PrivateUserRoute
                                    exact
                                    path='/api/case/director'
                                    component={Director}
                                  />
                                  <PrivateUserRoute
                                    exact
                                    path='/api/case/merchandiser'
                                    component={CaseMerchandiser}
                                  />
                                  <PrivateUserRoute
                                    path='/api/case/mprice'
                                    component={MPrice}
                                  />
                                  <PrivateUserRoute
                                    path='/api/quogarment'
                                    component={Quotation}
                                  />
                                  <PrivateUserRoute
                                    path='/api/purchase'
                                    component={Purchase}
                                  />
                                  <PrivateUserRoute
                                    path='/api/completeset'
                                    component={CompleteSet}
                                  />
                                  {/* This NotFound return a page when the previous page is not found. */}
                                  <Route component={NotFound} />
                                </Switch>
                              </div>
                            </Fragment>
                          </Router>
                        </PopoverState>
                      </PurState>
                    </QuoState>
                  </SrMtrlState>
                </SearchBarState>
              </CasesState>
            </AlertState>
          </AuthUserState>
        </UserState>
      </ComState>
    </AuthComState>
  );
};

export default App;
