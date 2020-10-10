import React from 'react';

//#### Notice !!! Not finish this obj yet !!!
const ToggleSwitch = ({
  id,
  name,
  checked,
  onChange,
  readOnlyIndicator,
  onLabel,
  offLabel,
  slider = 'slider',
}) => {
  return (
    <div className='toggleSwitch'>
      <label className='switch'>
        <input
          className='switchInput'
          id={id}
          type='checkbox'
          name={name}
          checked={checked == true}
          onChange={onChange}
          readOnly={readOnlyIndicator ? true : false}
        />
        <span className={`${slider} round`}></span>
      </label>
      {onLabel == null || offLabel == null ? null : (
        <span>{checked == true ? onLabel : offLabel}</span>
      )}
    </div>
  );
};

export default ToggleSwitch;
