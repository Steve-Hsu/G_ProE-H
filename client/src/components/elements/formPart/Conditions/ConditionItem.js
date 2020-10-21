import React from 'react';
import DeleteBtnSmall from '../../btns/DeleteBtnSmall';
import Select from '../../select/Select';

const ConditionItem = ({
  subject,
  itemClassName,
  deleteBtnName,
  deleteBtnOnClick,
  selectName,
  selectOnChange,
  inputName,
  inputOnChange,
  isDisplay,
}) => {
  return (
    <div>
      {isDisplay === null ? (
        <div className={`grid-Quo-condition m-0 p-0 noPrint ${itemClassName}`}>
          <div className='v-center-content noPrint'>
            <div className='noPrint p-05' style={{ width: '50px' }}>
              <DeleteBtnSmall
                name={deleteBtnName}
                value={subject.id}
                onClick={deleteBtnOnClick}
                className='noPrint m-0'
              />
            </div>

            <Select
              purpose={selectName}
              id={`${selectName}${subject.id}`}
              subject={subject}
              name={selectName}
              onChange={selectOnChange}
              selectedOption={subject[selectName]}
              className='noPrint'
            />
          </div>
          <div className='v-center-content noPrint'>
            <input
              type='text'
              id={`${inputName}${subject.id}`}
              name={inputName}
              maxLength='200'
              value={subject[inputName] || ''}
              onChange={inputOnChange}
              className='whenPrintNoBorder whenPrintFSSmall ml-05'
            />
          </div>
        </div>
      ) : (
          <div className='noPrint w-100 mb-05'>
            <span className='fw-bold'>{subject.condition} : </span>
            {subject.conditionDescription}
          </div>
        )}
      {/* Show only when print */}
      <div className='showWhenPrint w-100 fs-small'>
        <span className='fw-bold'>{subject.condition} : </span>
        {subject.conditionDescription}
      </div>
    </div>
  );
};

export default ConditionItem;
