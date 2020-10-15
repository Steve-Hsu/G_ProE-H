import React from 'react';

const SqToggleSwitchL = ({ name, checked, onChange, label_1, label_2 }) => {
  return (
    <div className='sq-toggleSwitch ml-1 ' style={{ gridColumn: '3/4' }}>
      <label className='sq-switch'>
        <input
          className='sq-switchInput'
          name={name}
          type='checkbox'
          checked={checked == true}
          onChange={onChange}
        />
        <div className='sq-slider bg-cp-3 h-scatter-content v-center-content'>
          <div className='sq-block center-content '>{label_1}</div>
          <div className='sq-block center-content '>{label_2}</div>
        </div>
      </label>
    </div>
  );
};

export default SqToggleSwitchL;
