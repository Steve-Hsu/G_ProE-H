import React, { Fragment, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AuthComContext from '../../context/authCom/authComContext';
import AuthUserContext from '../../context/authUser/authUserContext';
import UserContext from '../../context/user/userContext';
import SearchBarContext from '../../context/searchBar/searchBarContext';
import CasesContext from '../../context/cases/casesContext';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
import QuoContext from '../../context/quo/quoContext'
import PopoverContext from '../../context/popover/popoverContext';
import PurContext from '../../context/pur/purContext';
import CompleteSetContext from '../../context/completeSet/completeSetContext'

const Navbar = (props) => {
  const authComContext = useContext(AuthComContext);
  const authUserContext = useContext(AuthUserContext);
  const userContext = useContext(UserContext);
  const searchBarContext = useContext(SearchBarContext);
  const casesContext = useContext(CasesContext);
  const srMtrlContext = useContext(SrMtrlContext);
  const quoContext = useContext(QuoContext)
  const popoverContext = useContext(PopoverContext);
  const purContext = useContext(PurContext);
  const completeSetContext = useContext(CompleteSetContext)


  // Destructure
  const acom = authComContext;
  const au = authUserContext;
  const u = userContext;
  const s = searchBarContext;
  const c = casesContext;
  const sm = srMtrlContext;
  const q = quoContext;
  const p = popoverContext;
  const pur = purContext;
  const cs = completeSetContext;


  // const currentPath = props.location
  // console.log("the props of navbar", props)

  useEffect(() => {
    if (c.isUpdated && sm.isUpdated) {
      // Turn the isUpdated in cases and srMtrl false 3 seconds later
      setTimeout(function () {
        c.turnCaseIsUpdatedFalse();
        sm.turnSrMtrlIsUpdatedFalse();
      }, 3500);
    } else if (sm.isUpdated) {
      setTimeout(function () {
        sm.turnSrMtrlIsUpdatedFalse();
      }, 3500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sm.isUpdated]);

  useEffect(() => {
    console.log("here useEffect")
    setTimeout(() => {
      onLogout()
      console.log("hte timeout", props)
      // props.history.push('/multipleloging');
    }, 36000000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [au.isAuthenticated])

  const onLogout = () => {
    acom.logoutCom();
    au.logoutUser();
    s.toggleIndexList();
    c.defaultCase();
    u.clearUsers();
    sm.clearSrMtrl();
    q.defaultQuo();
    p.defaultPopover();
    pur.defaultPurState();
    cs.defaultCS();
  };

  const authComLinks = (
    <Fragment>
      <li>Hello ! {acom.company && acom.company.comName.toUpperCase()}</li>
      <li>
        <a onClick={onLogout} href='#!'>
          <i className='fas fa-sign-out-alt'></i>{' '}
          <span className='hide-sm'>Logout</span>
        </a>
      </li>
    </Fragment>
  );

  const authUserLinks = (
    <Fragment>
      <li>
        Hello ! {au.name && au.name.charAt(0).toUpperCase() + au.name.slice(1)}
      </li>
      <li>
        <a onClick={onLogout} href='#!'>
          <i className='fas fa-sign-out-alt'></i>{' '}
          <span className='hide-sm'>Logout</span>
        </a>
      </li>
    </Fragment>
  );

  const guestLinks = (
    <Fragment>
      <li>
        <Link to='/api/auth/company'>Company Login</Link>
      </li>
      <li>
        <Link to='/api/auth/user'>User Login</Link>
      </li>
    </Fragment>
  );

  // const updateNotice = (notice) => {
  //   return (
  //     <Fragment>
  //       <div className='fs-lead fc-success'>{notice}</div>
  //     </Fragment>
  //   );
  // };

  return (
    <div className='navbar bd-light-b-2px noPrint bg-white'>
      <h1 className='syen-regular'>
        <Link to='/'>
          <span className='fc-cp-2'>G</span><span >-Pro</span>
          <span className='fc-gray-5 '>E</span>
        </Link>
      </h1>
      {/* {sm.isUpdated && c.isUpdated
        ? updateNotice('Upload succeed')
        : sm.isUpdated
        ? updateNotice('Upload succeed')
        : null} */}

      {/* {currentPath === '/' ? null : ( */}
      <ul>
        {acom.isAuthenticated !== true && au.isAuthenticated !== true
          ? guestLinks
          : null}
        {acom.isAuthenticated ? authComLinks : null}
        {au.isAuthenticated ? authUserLinks : null}
      </ul>
      {/* // )} */}

    </div>
  );
};

// Navbar.propTypes = {
//   title: PropTypes.string.isRequired,
//   icon: PropTypes.string,
// };

// Navbar.defaultProps = {
//   title: 'G-ProE',
//   icon: 'fas fa-tshirt',
// };

export default Navbar;
