import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import ComContext from '../../context/company/comContext';

const CompanyItem = ({ company }) => {
  const comContext = useContext(ComContext);
  const { deleteCompany, setCurrent, clearCurrent } = comContext;
  const { id, comName, email, userNumLimit, userNum, type } = company;

  const onDelete = () => {
    deleteCompany(id);
    clearCurrent();
  };

  return (
    <div className='card bg-light'>
      <h3 className='text-primary text-let'>
        {comName}{' '}
        <span
          style={{ float: 'right' }}
          className={
            'badge ' + (type === 'paid' ? 'badge-primary' : 'badge-success')
          }
        >
          {type}
        </span>
      </h3>
      <ul>
        <li>
          <i className='fas fa-envelope-open' /> {email}
        </li>
        <li>
          <i className='fas fa-users' /> {userNumLimit}
        </li>
        <li>
          <i className='fas fa-user-check' /> {userNum}
        </li>
      </ul>
      <p>
        <button
          className='btn btn-dark btn-sm'
          onClick={() => setCurrent(company)}
        >
          Edit
        </button>
        <buttom className='btn btn-danger btn-sm' onClick={onDelete}>
          delete
        </buttom>
      </p>
    </div>
  );
};

CompanyItem.propTypes = {
  //Set the variable, the company, passedin must be an array.
  company: PropTypes.array.isRequired,
};

export default CompanyItem;
