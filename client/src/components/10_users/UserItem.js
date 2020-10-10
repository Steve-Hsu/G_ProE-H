import React, { useContext, Fragment } from 'react';
import PropTypes from 'prop-types';
import UserContext from '../../context/user/userContext';
// import DeleteUserPopForm from '../10_users/DeleteUserPopForm';
import Deletepopover from '../layout/DeletePopover';
import PopoverContext from '../../context/popover/popoverContext';
import SqBtnLarge from '../elements/btns/SqBtnLarge';
import DeleteBtnSmall from '../elements/btns/DeleteBtnSmall';

const UserItem = ({ user }) => {
  const userContext = useContext(UserContext);
  const {
    // confirmDeleteUser,
    setCurrent,
    clearCurrent,
  } = userContext;
  const { _id, name, email, cases, mtrl, cspt, mp, quo, po } = user;
  const popoverContext = useContext(PopoverContext);
  const { popover, togglePopover } = popoverContext;

  const onDelete = (e) => {
    // confirmDeleteUser(name);
    togglePopover(e);
    clearCurrent();
  };

  return (
    <Fragment>
      {popover ? <Deletepopover /> : null}
      <div className='round-area bg-cp-1-light bd-light mt-1'>
        <div className='h-scatter-content mb-05'>
          <div className='fs-lead'>
            {' '}
            <i className='fas fa-user'> {name}</i>
          </div>
          <div>
            <DeleteBtnSmall
              name='user'
              value={_id}
              onClick={onDelete}
              className='mt-0'
            />
          </div>
        </div>

        {/* Child element of grid - 1 */}

        <div className='mb-05'>
          <i className='fas fa-envelope-open'> E-mail : {email}</i>
        </div>

        {/* Child element of grid - 2 */}
        <div>
          <i className='fas fa-user-check'> The user can do : </i>
        </div>
        <div className='flexBox mb-05 round-area'>
          {['cases', 'mtrl', 'cspt', 'mp', 'quo', 'po'].map((i) => {
            let label = '';
            switch (i) {
              case 'cases':
                label = 'Cases';
                break;
              case 'mtrl':
                label = 'Material';
                break;
              case 'cspt':
                label = 'Consumption';
                break;
              case 'mp':
                label = 'Material Price';
                break;
              case 'quo':
                label = 'Quotation';
                break;
              case 'po':
                label = 'Purchase Order';
                break;
              default:
            }
            return user[i] ? (
              <span
                key={`badge${i}${_id}`}
                className='badge badge-success bg-cp-2-light-c'
              >
                {label}
              </span>
            ) : null;
          })}
        </div>
        <div className='h-scatter-content'>
          <div></div>
          <SqBtnLarge onClick={() => setCurrent(user)} label='Edit' />
        </div>
      </div>
    </Fragment>
  );
};

UserItem.propTypes = {
  //Set the variable, the user, passedin must be an object.
  user: PropTypes.object.isRequired,
};

export default UserItem;
