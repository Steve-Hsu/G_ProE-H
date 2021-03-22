import React, { useState, useContext, useEffect, Fragment } from 'react';
import UserContext from '../../context/user/userContext';
import AlertContext from '../../context/alert/alertContext';

const UserLanSelector = () => {
  return (
    // <div className='v-center-content round-area bd-light bg-cp-1-light m-05'>
    //   <input type="radio" id="eng" name="lanquage" value="english" className='w-10' />
    //   <div>English</div>
    // </div>
    <div className='round-area bd-light bg-cp-1-light m-05 w-100'>
      <div>Please select your gender:</div>
      <div className='grid-2 w-100'>
        <div className='v-center-content  w-100'>
          <input className='w-1rem mr-05' type="radio" id="eng" name="lanquage" value="english" />
          <div>English</div>
        </div>
        <div className='v-center-content  w-100'>
          <input className='w-1rem mr-05' type="radio" id="vie" name="lanquage" value="vietnamese" />
          <div>Vietnamese</div>
        </div>
        <div className='v-center-content  w-100'>
          <input className='w-1rem mr-05' type="radio" id="chi" name="lanquage" value="Japanese" />
          <div>Japanese</div>
        </div>
        <div className='v-center-content  w-100'>
          <input className='w-1rem mr-05' type="radio" id="jap" name="lanquage" value="chinese" />
          <div>Chinese</div>
        </div>
      </div>
    </div>
  )
}

export default UserLanSelector;