import React, { useContext, Fragment } from 'react';
// import PropTypes from 'prop-types';
import PopoverContext from '../../../context/popover/popoverContext';
import SrMtrl from '../../30_srMtrl/30_01_srMtrl';

import Mtrl from '../../20_cases/1_6_Mtrl';
import LockedBadge from '../badge/LockedBadge';
import MtrlLeadTime from '../../50_po/50_06_mrtlLeadTime';


const BoardItem = ({
  id,
  purpose,
  displayTitles,
  // subjects,
  subject,
  toggleItemAttributes,
  idx,
  currentPath,
}) => {
  const popoverContext = useContext(PopoverContext);

  const isEditingMtrl = subject.isEditingMtrl;

  const { togglePopover } = popoverContext;

  const onClick = (e) => {
    // console.log('Hit onClick'); // test Codes

    switch (purpose) {
      case 'CaseSelector':
        e.target.name = 'isEditingCase';
        //in here the toggleItemAttributes is an array containing 2 functions
        toggleItemAttributes[0](id);
        toggleItemAttributes[1](e);
        break;
      case '1_CaseForm':
        e.target.name = subject.id;
        e.target.id = 'isEditingMtrl';
        toggleItemAttributes(e);
        break;
      case 'quoCaseSelector':
        if (subject.cNo) {
          toggleItemAttributes(subject.cNo);
        }
        break;
      case 'quoFormSelector':
        toggleItemAttributes(subject._id);
        break;
      case 'srMtrlSelector':
      case 'quoSrMtrlSelector':
      case 'purCaseSelector':
      case 'leadTimePage':
        const theId = subject._id || subject.id;
        toggleItemAttributes[0](theId);
        break;
      case 'purchaseOrder':
        toggleItemAttributes('purchaseOrder', subject);
        break;
      case 'completeSetOfCase':
        toggleItemAttributes(subject._id);
        break;
      default:
    }
  };

  const selectedBackGround = (id) => {
    let style = { overflow: 'auto' };
    if (purpose === 'purCaseSelector') {
      let check = toggleItemAttributes[1].includes(id);
      if (check) {
        style = { background: 'var(--cp-1_2)', overflow: 'auto' };
      }
    }
    return style;
  };

  return (
    <Fragment>
      {purpose === '1_CaseForm' && isEditingMtrl == true ? (
        <Mtrl key={subject.id} mtrl={subject} />
      ) : (purpose === 'srMtrlSelector' &&
        toggleItemAttributes[1].includes(id)) ||
        (purpose === 'quoSrMtrlSelector' &&
          toggleItemAttributes[1].includes(id)) ? (
            <SrMtrl srMtrl={subject} currentPath={currentPath} idx={idx} />
          ) : purpose === 'leadTimePage' && toggleItemAttributes[1].includes(id) ? (
            <MtrlLeadTime caseMtrl={subject} idx={idx} />
          ) : purpose === 'purchaseOrder' ? (
            //BoardItem for purchaseOrder, the orderSummary
            <div
              className='boardChild round-card bg-cp-elem bd-light hover-moveUp-darker hover-pointer p-05'
              style={{ position: 'relative' }}
              onClick={onClick}
            >
              <div className='fs-small fc-fade-dark'>
                No.{idx + 1}
              </div>
              <div>
                {subject.supplier ? (
                  <div>
                    <div className='fs-lead fw-bold'>
                      {subject.supplier}
                    </div>
                    <div className='fs-small'>
                      {displayTitles}{' '}materials
                    </div>
                  </div>

                ) : (
                    <span className='fc-danger'>
                      <i className="fas fa-exclamation-triangle"></i>{' '}
                   Error, No supplier designated. Cancel the Order Summary, and check the materials in the cases again.
                    </span>
                  )}
              </div>
              {subject.poConfirmDate ? (
                <div
                  className='flexBox w-100'
                  style={{
                    position: 'absolute',
                    bottom: '0.5rem',
                    marginLeft: '-0.5rem',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                  }}
                >
                  <LockedBadge
                    id={id}
                    key={`confirmedBadge${id}`}
                    labels={[<i className='fas fa-check-circle'> Confirmed</i>]}
                    className='center-content mt-0'
                    style={{
                      height: '2rem',
                      flex: '1 1 auto',
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : (
                //Standard boardItems
                <div
                  className='boardChild round-card bg-cp-elem bd-light hover-moveUp-darker hover-pointer p-05'
                  style={selectedBackGround(id)}
                  onClick={onClick}
                >
                  <div className='fs-small fc-gray-5'>
                    No.
                  {idx + 1}
                  </div>
                  {displayTitles.map((title) => {
                    // console.log(title) // test Code
                    const keyOftitle = Object.keys(title)[0];
                    let className = 'fs-tiny'
                    //Switch for class, or the style and value of the divs
                    let returnedDiv = subject[keyOftitle];
                    switch (keyOftitle) {
                      case 'cNo':
                        className = 'fw-bold fs-normal'
                        break;
                      case 'style':
                        className = 'fw-bold fs-tiny fc-cp-2-c'
                        break;
                      case 'supplier':
                        className = 'fw-bold fs-lead'
                        break;
                      case 'ref_no':
                        className = 'fs-normal fc-cp-2-c'
                        break;
                      case 'position':
                        className = 'mb-05 fs-tiny'
                        break;
                      case 'descriptions':
                        className = 'mb-05 fs-tiny'
                        returnedDiv = subject[keyOftitle].map((d) => `${d} `);
                        break;
                      case 'poConfirmed':
                        const PoConfirmed = subject.price ? true : false;
                        returnedDiv = PoConfirmed ?
                          (<i className="fas fa-check-circle fc-success"> PO Confirmed</i>) :
                          <i className="fas fa-times-circle fc-danger"> PO Not Confirmed</i>
                        break;
                      case 'leadTimeSetUp':
                        const LeadTimesSetUp = subject.leadTimes ? true : false;
                        let resultDiv = (<i className="fas fa-times-circle fc-danger"> Not finished</i>)
                        if (LeadTimesSetUp) {
                          const totalMtrlQty = subject.purchaseQtySumUp + subject.purchaseLossQtySumUp + subject.purchaseMoqQty;
                          const leadTimeQty = subject.leadTimes.reduce((x, curr) => {
                            return x += curr.qty
                          }, 0)
                          if (totalMtrlQty == leadTimeQty) {
                            resultDiv = (<i className="fas fa-check-circle fc-success"> LeadTime OK</i>)
                          }
                        }
                        returnedDiv = resultDiv
                        break;
                      case 'prices':
                        className = 'fs-normal'
                        const mPricesNumber = subject.mPrices ? subject.mPrices.length : 0;
                        returnedDiv = (
                          <div>
                            {mPricesNumber ? `PRICEs : ${mPricesNumber}` : null}
                          </div>
                        )
                        break;
                      case 'complete':
                        className = 'fs-normal'
                        const mPId = subject.mainPrice
                        const theMainPrice = () => {
                          if (subject.mainPrice) {
                            const theMainPriceNotEquolToZero = subject.mPrices.find(({ id }) => id === mPId).mPrice > 0 ? true : false;
                            const noMPriceEquolToZero = subject.mPrices.filter((mP) => mP.mPrice <= 0).length === 0 ? true : false;
                            if (theMainPriceNotEquolToZero && noMPriceEquolToZero) {
                              return true
                            } else {
                              return false
                            }
                          } else {
                            return false
                          }
                        }
                        const complete = subject.mPrices.filter((mP) => mP.mPrice > 0).length === subject.mtrlColors.length * subject.sizeSPECs.length ||
                          theMainPrice() ? true : false;
                        returnedDiv = complete ? (<i className="fas fa-check-circle fc-success"></i>) : null

                        break;

                      default:
                    }
                    //Switch for the result

                    return (
                      <div className={className}
                        key={`${keyOftitle}${subject.id ? subject.id : subject._id
                          }`}
                      >
                        {returnedDiv}
                      </div>
                    );
                  })}
                </div>
              )}
    </Fragment>
  );
};

export default BoardItem;

// PropTyeps
// BoardItem.propTypes = {
//   // displayTitles: PropTypes.array.isRequired,
//   // subject: PropTypes.object.isRequired,
// };
