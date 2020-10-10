import React, { useContext } from 'react';
import FormTitle from '../../elements/formPart/FormTitle';
import NoAndDateHeader from '../../elements/formPart/NoAndDateHeader';
import CardItem from './21_01_CardItem';
import CaseContext from '../../../context/cases/casesContext';
import GoBackBtn from '../../elements/btns/GoBackBtn';

const MtrlCard = () => {
  const caseContext = useContext(CaseContext);
  const { cNo, style, sizes, cWays, mtrls, toggleMtrlCard } = caseContext;

  const onClick = () => {
    toggleMtrlCard();
  };
  return (
    <div className='container container-with-navbar whenPrint'>
      <GoBackBtn onClick={onClick} />
      <NoAndDateHeader No={cNo} />
      <FormTitle title='Material Card' />
      <div className='center-content fs-large'>Style : {style}</div>
      {mtrls.map((mtrl, idx) => {
        return (
          <CardItem
            cNo={cNo}
            style={style}
            sizes={sizes}
            cWays={cWays}
            mtrl={mtrl}
            key={`mtrlCard${mtrl.id}`}
            no={idx + 1}
          />
        );
      })}
    </div>
  );
};

export default MtrlCard;
