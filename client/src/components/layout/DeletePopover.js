import React, { useContext } from 'react';
import CasesContext from '../../context/cases/casesContext';
import AuthUserContext from '../../context/authUser/authUserContext';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
import PopoverContext from '../../context/popover/popoverContext';
import QuoContext from '../../context/quo/quoContext';
import PurContext from '../../context/pur/purContext';
import CompleteSetContext from '../../context/completeSet/completeSetContext'
import Spinner from '../../components/layout/Spinner';
import UserContext from '../../context/user/userContext';
import DeleteBtnSmallNoWarning from '../elements/btns/DeleteBtnSmallNoWarning'

const DeletePopover = () => {
  const casesContext = useContext(CasesContext);
  const authUserContext = useContext(AuthUserContext);
  const srMtrlContext = useContext(SrMtrlContext);
  const popoverContext = useContext(PopoverContext);
  const purContext = useContext(PurContext);
  const quoContext = useContext(QuoContext);
  const completeSetContext = useContext(CompleteSetContext)
  const userContext = useContext(UserContext);
  const { _id, cNo, deleteMtrl, deletecWayOrgSize, deleteCase, caseError, clearCaseError } = casesContext;
  const { deleteSRMtrlByMtrl, deleteSrMtrlPrice, srMtrlError, clearSrMtrlError } = srMtrlContext;
  const { comName, comSymbol } = authUserContext;
  const {
    togglePopover,
    toggleLoading,
    current,
    isLoading,
    doubleCheck,
    addDoubleCheckValue,
  } = popoverContext;
  const { deleteQuoForm, switchQuoForm, quoError, clearQuoError } = quoContext;
  const { deleteOs, osError, clearOsError } = purContext;
  const { deleteUser, clearCurrent } = userContext;
  const { csError, clearCsError } = completeSetContext;
  // }
  const onChangeDelete = async (e) => {
    e.preventDefault();
    const caseId = _id;

    switch (current.target) {
      case 'cWay':
        deletecWayOrgSize('gClr', caseId, current.id);
        break;
      case 'size':
        deletecWayOrgSize('gSize', caseId, current.id);
        break;
      case 'mtrl':
        deleteSRMtrlByMtrl(comName, comSymbol, current, _id);
        deleteMtrl(caseId, current.id);
        break;
      case 'case':
        if (doubleCheck === cNo) {
          deleteCase(current.caseId);
          console.log('Yes We can delete the case');
        }
        break;
      case 'quoForm':
        const body = {
          quoNo: current.quoNo,
          quoFormId: current._id,
        };
        deleteQuoForm(body);
        switchQuoForm(null);
        break;
      case 'deleteOs':
        toggleLoading(true);
        await deleteOs(current._id).then(() => {
          toggleLoading(false);
        });
        break;
      case 'deleteMPrice':
        const ids = {
          srMtrlId: current.srMtrlId,
          mPriceId: current.id,
        };
        deleteSrMtrlPrice(ids);
        break;
      case 'user':
        deleteUser(current._id);
        clearCurrent();
        alert('The user is deleted');
        break;
      default:
    }
    toggleLoading(true);
    setTimeout(() => {
      toggleLoading(false);
      togglePopover(e);
    }, 1500);
  };

  const words = () => {
    switch (current.target) {
      case 'cWay':
        return `Color : ${current.gClr}`;
      case 'size':
        return `Size :  ${current.gSize}`;
      case 'mtrl':
        return `Material :  ${current.item}, Ref_no : ${current.ref_no}`;
      case 'case':
        return `This Case : ${current.cNo}`;
      case 'quoForm':
        return `Quotation Form : ${current.quoNo}`;
      case 'deleteOs':
        return `Order Summary : ${current.osNo}`;
      case 'deleteOs':
        return `Order Summary : ${current.osNo}`;
      case 'deleteMPrice':
        return ` Price in SPEC : ${current.sizeSPEC}, and Color : ${current.mColor}`;
      case 'user':
        return `user ${current.name}`;
      default:
        return 'No defined';
    }
  };

  const doubleCheckInput = () => {
    if (
      current.target === 'case' ||
      current.target === 'quoForm' ||
      current.target === 'deleteOs' ||
      current.target === 'user'
    ) {
      return (
        <div key='doubleCheckDiv' className='px-1'>
          <div className='fs-tiny'>{`Enter the ${current.cNo || current.quoNo || current.osNo ? 'Number' : 'Name'
            } for deleting`}</div>
          <input
            key='doubleCheckInput'
            type='text'
            value={doubleCheck || ''}
            onChange={addDoubleCheckValue}
            placeholder={
              current.cNo
                ? current.cNo
                : current.quoNo
                  ? current.quoNo
                  : current.osNo
                    ? current.osNo
                    : current.name
            }
          />
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className='popup'>
      <div className='popup-inner bd-radius-s'>
        {isLoading === true ? (
          <div className='popup-container bd-light bd-radius-s bg-cp-2'>
            <div className='h-10 w-100 p-1'><i className="fas fa-code-branch"> Server is working...</i></div>

            <div className='center-content h-80 w-100'>
              <Spinner />
            </div>
          </div>
        ) : csError !== null || osError !== null || caseError !== null || srMtrlError !== null || quoError !== null ? (<div className='popup-container bd-light bd-radius-s bg-cp-2'>
          <div className='h-10 w-100 h-scatter-content'>
            <div className='h-10 p-1'><i className="fas fa-exclamation-triangle"> Notice : </i></div>
            <div><DeleteBtnSmallNoWarning className='mr-05' onClick={csError !== null ? clearCsError : osError !== null ? clearOsError :
              caseError !== null ? clearCaseError :
                srMtrlError !== null ? clearSrMtrlError :
                  quoError !== null ? clearQuoError : null} /></div>
          </div>
          <div className='center-content h-80 w-100 p-1'>
            {csError || osError || caseError || srMtrlError || quoError}
          </div>
        </div>) : (
              <div className='popup-container bd-light bd-radius-s bg-cp-2'>
                <div className='p-2 h-20'>Delete this {`${words()}`}</div>
                <div className='center-content h-40'>
                  {' '}
                  <h3>Are you sure?</h3>
                </div>

                <div className='h-20 px-2 py-0'>{doubleCheckInput()}</div>
                <div className='h-scatter-content p-1 h-20'>
                  <div className='center-content w-50'>
                    <button
                      className='btn btn-sq btn-block sq-block bg-safe'
                      onClick={togglePopover}
                    >
                      Back
                </button>
                  </div>
                  <div className='center-content w-50'>
                    {(current.target === 'case' && doubleCheck != current.cNo) ||
                      (current.target === 'quoForm' &&
                        doubleCheck != current.quoNo) ||
                      (current.target === 'deleteOs' &&
                        doubleCheck != current.osNo) ||
                      (current.target === 'user' && doubleCheck != current.name) ? (
                        <div className='sq-block bd-radius-s  bg-fade fc-fade-dark center-content'>
                          Delete
                        </div>
                      ) : (
                        <button
                          className='btn btn-sq btn-block sq-block bg-warning'
                          onClick={onChangeDelete}
                        >
                          Delete
                        </button>
                      )}
                  </div>
                </div>
              </div>
            )}
      </div>
    </div>
  );
};

export default DeletePopover;
