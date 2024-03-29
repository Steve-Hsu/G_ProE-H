import React from 'react';
import MtrlItem from './21_01_03_01_MtrlItem';

const CWayTable = ({ cWays, mtrlColors }) => {
  return (
    <div className='flexBox'>
      {mtrlColors.map((i) => {
        const gColor = cWays.find(({ id }) => id === i.cWay).gClr;
        const checkWords = 'Empty-ColorWay_Duplicated'.toUpperCase()
        const gColorLable = gColor.includes(checkWords) ? gColor.slice(26) : gColor
        return (
          <MtrlItem
            key={`MtrlItem${i.cWay}`}
            colorWay={gColorLable}
            mColor={i.mColor}
            style={{ flex: '1 0 5cm' }}
          />
        );
      })}
    </div>
  );
};

export default CWayTable;
