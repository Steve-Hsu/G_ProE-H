import React, { useState, useContext, useEffect, Fragment } from 'react';
import UserContext from '../../context/user/userContext';
import AlertContext from '../../context/alert/alertContext';
// import SqBtnLarge from '../elements/btns/SqBtnLarge';

const UserForm = () => {
  const userContext = useContext(UserContext);
  const alertContext = useContext(AlertContext);

  const { addUser, current, clearCurrent, updateUser } = userContext;
  const { setAlert } = alertContext;
  useEffect(() => {
    if (current !== null) {
      // If UserState.current is not empty, set UserForm.state === UserState.current
      setUser(current);
    } else {
      // Default it
      setUser({
        name: '',
        email: '',
        password: '',
        password2: '',
        cases: false,
        mtrl: false,
        cspt: false,
        mp: false,
        quo: false,
        po: false,
      });
    }
    // make useEffect only check the changing of userContext and current
  }, [userContext, current]);

  //Set state for this UserForm
  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    cases: false,
    mtrl: false,
    cspt: false,
    mp: false,
    quo: false,
    po: false,
    language: 'english',
  });

  const {
    // name,
    // email,
    password,
    password2,
    // cases,
    // mtrl,
    // cspt,
    // mp,
    // quo,
    // po,
  } = user;

  const onChange = (e) =>
    // Link each input to UserForm.state, input name matcked to state name
    setUser({ ...user, [e.target.name]: e.target.value });

  //@ onChange for checkbox -------
  // const onChangeCB = (e) => {
  //   if (e.target.checked) {
  //     setUser({ ...user, [e.target.name]: true });
  //   } else if (!e.target.checked) {
  //     setUser({ ...user, [e.target.name]: false });
  //   }
  // };
  // @ Offered by gdh form stackOverflow, works as the above one
  // const onChangeCB = (e) => {
  //   const target = e.target;
  //   setUser((prev) => ({ ...prev, [target.name]: !prev[target.name] }));
  // };
  const onChangeCB = (e) => {
    // const { name, checked } = e.target;
    setUser({ ...user, [e.target.name]: e.target.checked ? true : false });
  };

  const selectLanquage = (e) => {
    setUser({ ...user, language: e.target.value });
  }

  const onSubmit = (e) => {
    // Prevent renew all the variables on browser(client), the userState and UserForm.state
    e.preventDefault();
    if (password2 !== password) {
      setAlert('Password and Password-Confirmation not matched', 'danger');
    } else {
      if (current === null) {
        // Grab the "User" from UserForm.state.
        // Add the "User" to userState.userpanies
        addUser(user);
      } else {
        updateUser(user);
      }
      // Default the current and UserForm.state
      clearAll();
    }
  };

  const clearAll = () => {
    clearCurrent();
  };

  return (
    <Fragment>
      <section id='userFormArea' className='round-area bd-light bg-cp-1'>
        <form onSubmit={onSubmit}>
          <div className='text-primary fs-lead'>
            {current ? 'Edit User' : 'Add User'}
          </div>
          {['name', 'email', 'password', 'password2'].map((i) => {
            if (
              (current && i === 'password') ||
              (current && i === 'password2')
            ) {
              return null;
            } else {
              return (
                <div key={`userforminput${i}`} className='flexBox mb-05'>
                  <div style={{ width: '8rem' }} className='v-center-content'>
                    {i === 'name'
                      ? 'Name'
                      : i === 'email'
                        ? 'Email'
                        : i === 'password'
                          ? 'Password'
                          : i === 'password2'
                            ? 'Password check'
                            : null}
                  </div>
                  <div style={{ flex: '1 1' }}>
                    <input
                      type='text'
                      placeholder={i}
                      name={i}
                      // React require add || '' to prevent warning the input changed from controlled to uncontrolled.
                      value={user[i] || ''}
                      onChange={onChange}
                    />
                  </div>
                </div>
              );
            }
          })}
          <div className='grid-2'>
            {['cases', 'mtrl', 'cspt', 'mp', 'quo', 'po'].map((i) => {
              return (
                <div
                  key={`userformcheckbox${i}`}
                  className='v-center-content round-area bd-light bg-cp-1-light m-05'
                >
                  <input
                    type='checkbox'
                    name={i}
                    //Setting default when the box is checked, means the state.cases is true.
                    checked={user[i] === true}
                    onChange={onChangeCB}
                    className='w-1rem'
                  />
                  <div className='px-05'>
                    {i === 'cases'
                      ? 'Cases'
                      : i === 'mtrl'
                        ? ' Material'
                        : i === 'cspt'
                          ? ' Cunsumption'
                          : i === 'mp'
                            ? ' Material Price'
                            : i === 'quo'
                              ? ' Quotation'
                              : i === 'po'
                                ? ' Purchase order'
                                : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* @ UserLanSelector */}
          <div className='round-area bd-light bg-cp-1-light w-100 '>
            <div>Please select your gender:</div>
            <div className='grid-2 w-100'>
              {['english', 'vietnamese', 'japanese', 'chinese'].map((i) => {
                return (
                  <div key={`langauge${i}`} className='v-center-content  w-100'>
                    <input className='w-1rem mr-05' type="radio" name="language" value={i} onChange={selectLanquage} checked={user.language === i} />
                    <div>{i.charAt(0).toUpperCase() + i.slice(1)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Submit btn for user form */}
          <div>
            <input
              type='submit'
              value={current ? 'Update User' : 'Add User'}
              className='btn btn-primary btn-block sq-block bg-cp-2 w-100 mt-05'
            />
          </div>
          {current && (
            <div>
              <button
                className='btn btn-light btn-block sq-block w-100 mt-05'
                onClick={clearAll}
              >
                Clear
              </button>
            </div>
          )}
        </form>
      </section>
    </Fragment>
  );
};

export default UserForm;
