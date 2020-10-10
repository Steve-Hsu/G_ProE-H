import React, { useContext } from 'react';

// Components
import LeftBar from '../layout/LeftBar';
import CaseForm from '../20_cases/1_CaseForm';
import MtrlCard from '../20_cases/21_mtrlCard/21_MtrlCard';
import CaseContext from '../../context/cases/casesContext';

export const CaseMerchandiser = (props) => {
  const caseContext = useContext(CaseContext);
  const { showMtrlCard } = caseContext;
  const currentPath = props.location.pathname;
  return (
    <div className='grid-1-4'>
      {/* Grid-1 */}
      <LeftBar currentPath={currentPath} />

      {/* Grid-2 */}
      {showMtrlCard === true ? <MtrlCard /> : <CaseForm props={props} />}
    </div>
  );
};

export default CaseMerchandiser;
