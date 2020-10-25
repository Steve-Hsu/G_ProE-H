import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import CasesContext from '../../context/cases/casesContext';

const MtrlSizeSPEC = ({ sizeSPEC, mtrlId }) => {
  const casesContext = useContext(CasesContext);
  const { addValueMtrlSizeSPEC, sizes, mtrls, osNo, caseConfirmDate } = casesContext;
  const { mSizeSPEC } = sizeSPEC;
  const sizeLable = sizes.find(({ id }) => id === sizeSPEC.size).gSize;
  const multipleSPEC = mtrls.find(({ id }) => id === mtrlId).multipleSPEC;

  //@ Value for input
  //words length limit
  const maxWdsLength = '77';
  const SizeSPECLength = maxWdsLength;

  return (
    <div className='mr-1'>
      <input
        name={mtrlId}
        id={sizeSPEC.id}
        type='text'
        placeholder='.'
        value={mSizeSPEC}
        onChange={addValueMtrlSizeSPEC}
        maxLength={SizeSPECLength}
        className='MPH-input'
        readOnly={caseConfirmDate || osNo ? true : false}
      />
      <label htmlFor={sizeSPEC.id} className='MPH-input-label'>
        {multipleSPEC == true ? `${sizeLable}` : 'For all Size'}
      </label>
    </div>
  );
};

export default MtrlSizeSPEC;

MtrlSizeSPEC.propTypes = {
  sizeSPEC: PropTypes.object.isRequired,
  mtrlId: PropTypes.string.isRequired,
};
