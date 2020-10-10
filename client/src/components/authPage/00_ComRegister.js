import React, { useState, useContext, useEffect } from 'react';
import AlertContext from '../../context/alert/alertContext';
import AuthComContext from '../../context/authCom/authComContext';

const ComRegister = (props) => {
  // Initialize Alert
  const alertContext = useContext(AlertContext);
  const authComContext = useContext(AuthComContext);

  const { setAlert } = alertContext;
  const { registerCom, error, clearErrors, isAuthenticated } = authComContext;

  useEffect(() => {
    if (isAuthenticated) {
      props.history.push('/api/users');
    }
    if (error) {
      setAlert(error, 'danger');
      clearErrors();
    }
    // eslint-disable-next-line
  }, [error, isAuthenticated, props.history]);

  const [company, setCompany] = useState({
    comName: '',
    comNameTail: '',
    comSymbol: '',
    email: '',
    password: '',
    password2: '',
    code: '',
  });

  const {
    comName,
    comNameTail,
    comSymbol,
    email,
    password,
    password2,
    code,
  } = company;

  const onChange = (e) =>
    setCompany({ ...company, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    if (comName === '' || email === '' || password === '') {
      setAlert('Please enter all fields', 'danger');
      console.log('Please enter all fields', 'danger'); // Test Code
    } else if (password !== password2) {
      setAlert('Passwords do not match', 'danger');
    } else if (code !== process.env.REACT_APP_STEVE_ID) {
      setAlert('Wrong Code, you are not Steve', 'danger');
    } else {
      registerCom({
        //This is a formData
        comName,
        comNameTail,
        comSymbol,
        email,
        password,
        // This code is essential in form, since I set an authenticat-code on backend
        code,
      });
    }
  };

  return (
    <div className='form-container'>
      <h1>
        Account <span className='text-primary'>Register</span>
      </h1>
      <form onSubmit={onSubmit}>
        {/* {Name} */}
        <div className='form-group'>
          <label htmlFor='name'>Name</label>
          <input
            type='text'
            name='comName'
            value={comName}
            onChange={onChange}
          />
        </div>
        {/* {Company name tail, like Co.,Ltd, Ltd, etc.} */}
        <div className='form-group'>
          <label htmlFor='comNameTail'>Limited Company</label>
          <input
            type='text'
            name='comNameTail'
            value={comNameTail}
            onChange={onChange}
          />
        </div>
        {/* {Company Symbol, the symbol will be used in document numbering} */}
        <div className='form-group'>
          <label htmlFor='comSymbol'>ComSymbol</label>
          <input
            type='text'
            name='comSymbol'
            value={comSymbol}
            onChange={onChange}
          />
        </div>
        {/* {Email Address} */}
        <div className='form-group'>
          <label htmlFor='email'>Email Address</label>
          <input type='email' name='email' value={email} onChange={onChange} />
        </div>
        {/* {Password} */}
        <div className='form-group'>
          <label htmlFor='password'>password</label>
          <input
            type='password'
            name='password'
            value={password}
            onChange={onChange}
          />
        </div>
        {/* {Password for confirm} */}
        <div className='form-group'>
          <label htmlFor='password2'>password2</label>
          <input
            type='password'
            name='password2'
            value={password2}
            onChange={onChange}
          />
        </div>
        {/* {Code for pass as a APP manager} */}
        <div className='form-group'>
          <label htmlFor='CODE'>CODE</label>
          <input type='password' name='code' value={code} onChange={onChange} />
        </div>
        {/* Submit button */}
        <input
          type='submit'
          value='Register'
          className='btn btn-primary btn-block'
        />
      </form>
    </div>
  );
};

export default ComRegister;
