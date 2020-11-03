import React, { useContext, Fragment } from 'react';
import PropTypes from 'prop-types';
import PopoverContext from '../../../context/popover/popoverContext';
import SrMtrl from '../../30_srMtrl/30_01_srMtrl';
import MtrlLeadTime from '../../50_po/50_06_mrtlLeadTime';

import Mtrl from '../../20_cases/1_6_Mtrl';

const TableItem = ({
  id,
  subject,
  idx,
  displayTitles,
  cellStyle,
  toggleItemAttributes,
  purpose,
  currentPath,
}) => {
  const popoverContext = useContext(PopoverContext);

  //   const { mtrls, addMtrlValue, displayTitles } = casesContext;
  const isEditingMtrl = subject.isEditingMtrl;

  const { togglePopover } = popoverContext;

  const trueInDisplayTitles = displayTitles.filter((obj) => {
    return Object.values(obj)[0] == true;
  }).length;

  const onClick = (e) => {
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
      case 'osSelector':
        // e.target.name = 'osSelector'
        console.log('The osSelector click is triggered');
        toggleItemAttributes[0](subject);
        toggleItemAttributes[1](purpose === 'osSelector' ? 'orderSummary' : 'csCaseSelector');
        break;
      case 'csOsSelector':
        console.log('The csOsSelector click is triggered');
        toggleItemAttributes[0](subject.osNo);
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

  const checkSrMtrlId = (id) => {
    if (toggleItemAttributes[1]) {
      return toggleItemAttributes[1].includes(id);
    } else {
      return false;
    }
  };

  return (
    <Fragment>
      {purpose === '1_CaseForm' && isEditingMtrl == true ? (
        <Mtrl key={subject.id} mtrl={subject} />
      ) : purpose === 'srMtrlSelector' && checkSrMtrlId(id) ||
        purpose === 'quoSrMtrlSelector' && checkSrMtrlId(id) ? (
            <SrMtrl srMtrl={subject} currentPath={currentPath} idx={idx} />
          ) : purpose === 'leadTimePage' && checkSrMtrlId(id) ? (
            <MtrlLeadTime caseMtrl={subject} idx={idx} />
          ) : purpose === 'purCaseSelector' && subject.poDate !== null ? null : (
            <div
              className='flexBox bd-light bd-no-t bg-cp-elem hover-cp-2 fs-small'
              onClick={onClick}
              style={selectedBackGround(id)}
            // style={{ background: 'red' }}
            >
              <div style={cellStyle('no')} className='fs-small'>{idx + 1}</div>
              {purpose === '1_CaseForm' ? (
                <div style={cellStyle('item')}>{subject.item}</div>
              ) : null}
              {displayTitles.map((title) => {
                if (title[Object.keys(title)[0]]) {
                  //   console.log('the length of dispalytitles', trueInDisplayTitles); // Test Code
                  const theTitle = Object.keys(title)[0]
                  switch (theTitle) {
                    case 'descriptions':
                      return (
                        <div
                          style={cellStyle(
                            Object.keys(title)[0],
                            trueInDisplayTitles
                          )}
                          key={`${Object.keys(title)[0]}${subject.id}`}
                        >
                          {subject[Object.keys(title)[0]].map((des, idx) => (
                            <div
                              key={`${des}OfNum${idx}Of${subject.id}`}
                              className='mr-1'
                              style={{
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <div> {des}</div>
                            </div>
                          ))}
                        </div>
                      )
                    case 'poConfirmed':
                      const PoConfirmed = subject.price ? true : false;
                      return (
                        <div className='center-content' style={cellStyle(
                          Object.keys(title)[0],
                          trueInDisplayTitles
                        )} key={`${Object.keys(title)[0]}${subject.id}`}>
                          {PoConfirmed ? (<i className="fas fa-check-circle fc-success"></i>) : <span className='fc-danger'>Not Confirmed</span>}

                        </div>
                      )
                    case 'leadTimeSetUp':
                      const LeadTimesSetUp = subject.leadTimes ? true : false;
                      let resultDiv = (<span className='fc-danger'>Not finished</span>)
                      if (LeadTimesSetUp) {
                        const totalMtrlQty = subject.purchaseQtySumUp + subject.purchaseLossQtySumUp + subject.purchaseMoqQty;
                        const leadTimeQty = subject.leadTimes.reduce((x, curr) => {
                          return x += curr.qty
                        }, 0)
                        if (totalMtrlQty == leadTimeQty) {
                          resultDiv = (<i className="fas fa-check-circle fc-success"></i>)
                        }
                      }
                      return (
                        <div className='center-content' style={cellStyle(
                          Object.keys(title)[0],
                          trueInDisplayTitles
                        )} key={`${Object.keys(title)[0]}${subject.id}`}>
                          {resultDiv}
                        </div>
                      )

                    default:
                      return (
                        <div
                          style={cellStyle(
                            Object.keys(title)[0],
                            trueInDisplayTitles
                          )}
                          key={`${Object.keys(title)[0]}${subject.id}`}
                        >
                          {subject[Object.keys(title)[0]]}
                        </div>
                      );
                  }
                } else {
                  return null;
                }
              })}
            </div>
          )}
    </Fragment>
  );
};

export default TableItem;

// PropTyeps
TableItem.propTypes = {
  subject: PropTypes.object.isRequired,
  cellStyle: PropTypes.func.isRequired,
  displayTitles: PropTypes.array.isRequired,
  idx: PropTypes.number.isRequired,
};
