import React from 'react';
import MtrlItem from './21_01_03_01_MtrlItem';

const CWayTable = ({ cWays, mtrlColors }) => {
  return (
    <div className='grid-5'>
      {mtrlColors.map((i) => {
        const gColor = cWays.find(({ id }) => id === i.cWay).gClr;
        return (
          <MtrlItem
            key={`MtrlItem${i.cWay}`}
            colorWay={gColor}
            mColor={i.mColor}
          />
        );
      })}
    </div>
  );
};

export default CWayTable;
