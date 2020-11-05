import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import CasesContext from '../../context/cases/casesContext';

const MtrlClr = ({ mtrlColor, mtrlId }) => {
  const casesContext = useContext(CasesContext);
  const { addValueMtrlColor, cWays, mtrls, osNo, caseConfirmDate } = casesContext;
  const { mColor } = mtrlColor;
  const cWayLabel = cWays.find(({ id }) => id === mtrlColor.cWay).gClr;
  const multipleColor = mtrls.find(({ id }) => id === mtrlId).multipleColor;

  //@ Value for input
  //words length limit
  const maxWdsLength = '50';
  const mColorLength = maxWdsLength;

  var re = new RegExp("Empty-ColorWay_Duplicated", 'i')
  return (
    // <div style={{ height: '68px' }}>
    <div className='mr-1'>
      <input
        name={mtrlId}
        id={mtrlColor.id}
        type='text'
        placeholder='.'
        value={mColor}
        onChange={addValueMtrlColor}
        maxLength={mColorLength}
        className='MPH-input'
        readOnly={caseConfirmDate || osNo ? true : false}
      />
      <label htmlFor={mtrlColor.id} className='MPH-input-label'>
        {multipleColor === true ? re.test(cWayLabel) ? cWayLabel.slice(26) : cWayLabel : 'For all ColorWay'}
      </label>
    </div>
  );
};

export default MtrlClr;

MtrlClr.propTypes = {
  mtrlColor: PropTypes.object.isRequired,
  mtrlId: PropTypes.string.isRequired,
};
