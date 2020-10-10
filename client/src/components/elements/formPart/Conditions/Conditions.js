import React, { Fragment } from 'react';
import SqBtnLarge from '../../btns/SqBtnLarge';
import ConditionItem from './ConditionItem';

const Conditions = ({
  onClick,
  subjects,
  deleteBtnName,
  deleteBtnOnClick,
  selectName,
  selectOnChange,
  inputName,
  inputOnChange,
  itemClassName,
  isDisplay = null,
}) => {
  return (
    <Fragment>
      {isDisplay === null ? (
        <SqBtnLarge
          name='addCondition'
          onClick={onClick}
          label='Add condition'
          className='noPrint w-15vw mb-05'
        />
      ) : null}

      {subjects.length > 0 ? (
        <section id='conditions' className='mb-2 noBreak'>
          <div className='fs-lead'>Condition</div>
          {subjects
            ? subjects.map((s) => (
                <ConditionItem
                  key={`${selectName}${s.id || s._id}`}
                  subject={s}
                  itemClassName={`noBreak mt-0 mb-0 whenPrintFSSmall ${itemClassName}`}
                  deleteBtnName={deleteBtnName}
                  deleteBtnOnClick={deleteBtnOnClick}
                  selectName={selectName}
                  selectOnChange={selectOnChange}
                  inputName={inputName}
                  inputOnChange={inputOnChange}
                  isDisplay={isDisplay}
                />
              ))
            : null}
        </section>
      ) : null}
    </Fragment>
  );
};

export default Conditions;
