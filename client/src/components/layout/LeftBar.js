import React, { Fragment, useContext } from 'react';
import AuthUserContext from '../../context/authUser/authUserContext';
import CasesContext from '../../context/cases/casesContext';
import QuoContext from '../../context/quo/quoContext';
import PurContext from '../../context/pur/purContext';
import PopoverContext from '../../context/popover/popoverContext'
// import SearchBar from './SearchBar';
// import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file';
import SqBtnLarge from '../elements/btns/SqBtnLarge';
import LockedBadge from '../elements/badge/LockedBadge';
// Components
import SizeSelector from '../40_quo/40_03_01_sizeSelector';
import CWaySelector from '../40_quo/40_03_02_cWaySelector';

const LeftBar = ({ currentPath }) => {
  const authUserContext = useContext(AuthUserContext);
  const casesContext = useContext(CasesContext);
  const quoContext = useContext(QuoContext);
  const purContext = useContext(PurContext);
  const popoverContext = useContext(PopoverContext)
  const { name } = authUserContext
  const userName = name
  const {
    addCaseValue,
    mtrls,
    cNo,
    osNo,
    addcWay,
    addSize,
    addMtrl,
    clearcNo,
    getM_list,
    isImportedExcel,
    inputFileName,
    isEditingCase,
    toggleMtrlCard,
    showMtrlCard,
    caseConfirmDate,
    toggleCaseConfirmDate,
    merchandiser,
    caseList,
  } = casesContext;
  const {
    isQuotating,
    quotateFor,
    openQuoForm,
    quotation,
    currentQuoForm,
    downLoadmtrlPrice,
  } = quoContext;

  const { openPage, togglePoConfirmDate, currentPo, selectedCases, osList, currentOrderSummary } = purContext;
  // const { currentOsCaseList } = currentOrderSummary.caseList ? currentOrderSummary.caseList : [];
  const { toggleLoading } = popoverContext;

  const theCase = quotation.theCase;

  const SHEET_NAME_LIST = [
    'bom',
    'trims',
    'shell',
    'fabric',
    'accessories',
    'spec',
    '228184',
    '#334183',
    'tabelle1',
  ];
  //@ Define the current page for passing to searchBar
  let currentPage = '';
  switch (currentPath) {
    case '/api/case/merchandiser':
      currentPage = 'case';
      console.log(currentPage);
      break;
    case '/api/case/mprice':
      currentPage = 'mprice';
      console.log(currentPage);
      break;
    case '/api/quogarment':
      currentPage = 'quotation';
      console.log(currentPage);
      break;
    case '/api/purchase':
      currentPage = 'purchase';
      console.log(currentPage);
      break;
    default:
  }

  const onClick = (e) => {
    e.preventDefault();
    clearcNo(mtrls);
  };

  const onClick2 = (e) => {
    e.preventDefault();
    toggleMtrlCard();
  };

  const onClickQuo = async () => {
    toggleLoading(true)
    const body = {
      quoNo: currentQuoForm.quoNo,
      quoFormId: currentQuoForm._id,
      quoSizes: currentQuoForm.quoSizes,
      quocWays: currentQuoForm.quocWays,
    };
    downLoadmtrlPrice(body).then(() => {
      toggleLoading(false)
    });
  };

  const updateBtnlabel = () => {
    let obj = {};
    switch (currentPath) {
      case '/api/case/merchandiser':
        obj = {
          label: 'Save The Case',
          form: 'caseForm',
        };
        break;
      case '/api/case/mprice':
        obj = {
          label: 'Update the Price List',
          form: 'srMtrlForm',
        };
        break;
      case '/api/quogarment':
        if (quotateFor === 'material') {
          obj = {
            label: 'Update material quotation',
            form: 'srMtrlForm',
          };
        } else if (quotateFor === 'garment') {
          if (isQuotating !== null && openQuoForm === null) {
            obj = {
              label: 'Add new quotation',
              form: 'addNewQuoForm',
            };
          } else if (isQuotating !== null && openQuoForm !== null) {
            obj = {
              label: 'Uploadp the Quotation',
              form: 'quoForm',
            };
          }
        }
        break;
      case '/api/purchase':
        if (openPage === 'purchaseOrder') {
          obj = {
            label: 'Update PO',
            form: 'updatePurchaseOrder',
          };
        } else if (openPage === 'caseSelector') {
          obj = {
            label: 'Create Order Summary',
            form: 'purchase',
          };
        } else if (openPage === 'oSMtrlList') {
          obj = {
            label: 'Save HS-Code',
            form: 'updateOsCaseMtrlHsCode',
          }
        } else {
          obj = {
            label: 'Save LeadTime',
            form: 'updateOsCaseMtrlLeadTime',
          }
        }

        break;
      default:
    }
    return obj;
  };

  let btnSwitcher = updateBtnlabel();
  let excelName = '';
  const labelOfReadExcel = (e) => {
    if (document.getElementById('upload-excel').value) {
      excelName = document.getElementById('upload-excel').value;
      console.log('The e.target.value', e.target.value);
      addCaseValue(e);

      console.log(excelName);
      console.log(typeof excelName);
    }
    // let excelName = document.getElementById('upload-excel').value; // Test Code
  };

  // Parse CSV locally----,
  // const readCsv = (csv) => {
  //   if (csv) {
  //     Papa.parse(csv, {
  //       download: true,
  //       header: true,
  //       complete: async (result) => {
  //         console.log(result);
  //         getStyleFromCSV(result.data);
  //         console.log('In the left bar', cWays);
  //         // readCsvInsertMtrl(result.data);
  //       },
  //     });
  //   } else {
  //     console.log('Please Select a csv file before reading it');
  //   }
  // };

  // Parse Excel by http request
  const readExcel = () => {
    const excel = document.getElementById('upload-excel').files[0];
    // console.log('The excel', excel); // Test code
    // console.log('The type of the excel itself', typeof excel); // Test Code
    // Default the input, preventing double input the same bom
    const inputValue = document.getElementById('upload-excel').value;
    console.log('the inputValue', inputValue);

    if (inputValue) {
      toggleLoading(true)
      const styleName = inputValue
        .slice(12)
        .replace('.xlsx', '')
        .replace('.xls', '');
      addCaseValue({
        target: {
          name: 'style',
          value: styleName,
        },
      });
      addCaseValue({ target: { name: 'isImportedExcel' } });
    }

    document.getElementById('upload-excel').value = null;

    if (excel) {
      const regex = new RegExp(SHEET_NAME_LIST.join('|'), 'i');
      let resultSheet = new Array();

      readXlsxFile(excel, { getSheets: true }).then((sheets) => {
        console.log('the sheets name', sheets);

        const insertArr = new Promise((resolve) => {
          let num_L_1 = 0;
          sheets.map((sheet) => {
            if (regex.test(sheet.name)) {
              console.log('the sheet pushed', sheet.name);
              readXlsxFile(excel, { sheet: sheet.name }).then((rows) => {
                console.log(typeof rows);
                console.log('the rows', rows);

                rows.map((row, idx) => {
                  resultSheet.push(row);
                  if (idx + 1 == rows.length) {
                    num_L_1 = num_L_1 + 1;
                    if (num_L_1 === sheets.length) {
                      resolve();
                    }
                  }
                });
              });
            } else {
              num_L_1 = num_L_1 + 1;
              if (num_L_1 == sheet.length) {
                resolve();
              }
            }
          });
        });

        Promise.all([insertArr]).then(async () => {
          console.log('the resultSheet', resultSheet);
          const JSONRows = JSON.stringify(resultSheet);
          console.log('the json JSONRows', JSONRows);
          await getM_list(JSONRows).then(() => {
            toggleLoading(false)
          });
        });
      });
    } else {
      console.log('Please Select a excel file before reading it');
    }
  };

  const printPage = () => {
    window.print();
  };

  const onClickPrintPage = () => {
    printPage('quotationForm');
  };

  const printOutElement = () => {
    return (
      <div className='round-area bg-cp-3 mt-1 mb-1'>
        <i className='fas fa-print fc-cp-1 mb-05'> Print</i>
        <button
          className='btn bg-cp-2 btn-block bd-radius-s bd-light'
          onClick={onClickPrintPage}
        >
          Print out
        </button>
      </div>
    );
  };

  const normalSummitBtn = () => {
    return (
      <div className='round-area bg-cp-3'>
        <i className='fas fa-cloud-upload-alt fc-cp-1 mb-05'> Save</i>
        <input
          type='submit'
          form={btnSwitcher.form}
          className='btn bg-cp-2 btn-block'
          value={btnSwitcher.label || ''}
          style={{ height: '37px' }}
        />
      </div>
    );
  };

  const confirmArea = (title, confirmedLabel, notConfirmedLabel, checkPoint, onClick) => {
    return (
      <div className='round-area bd-light'>
        <div>
          <i className='fas fa-file-import'> {title}</i>
        </div>
        {checkPoint ? (
          <LockedBadge
            labels={[
              <i className='fas fa-check-circle'> {confirmedLabel}</i>,
            ]}
            style={{ marginTop: '0.5rem' }}
            className='h-center-content'
          />
        ) : (
            <LockedBadge
              labels={[notConfirmedLabel]}
              style={{
                background: 'var(--fade-color)',
                marginTop: '0.5rem',
              }}
              className='h-center-content'
            />
          )}
        <div className='h-scatter-content mt-05'>
          <div></div>
          <SqBtnLarge onClick={onClick} label='Confirme' />
        </div>
      </div>
    )
  }

  return (
    <div
      className='container-with-navbar leftbar bg-white bd-light bd-no-t h-100 noPrint'
      style={{ height: 'clamp(100vh, 100%, 100%)' }}
    >
      <div className='leftbar-component ml-1'>
        {' '}
        {/* Submit Btn */}
        {/*Submit BTN Case Set */}
        {currentPage === 'case' && osNo === null && isEditingCase === false ? (
          <div className='round-area bg-cp-3'>
            <i className='fas fa-folder-plus fc-cp-1 mb-05'> New Case</i>
            <button
              className='btn bg-cp-2 btn-block bd-radius-s bd-light'
              name='isEditingCase'
              onClick={addCaseValue}
            >
              Case ＋
            </button>
          </div>
        ) : currentPage === 'case' &&
          osNo === null &&
          caseConfirmDate === null &&
          showMtrlCard === false &&
          isEditingCase === true ? (
              normalSummitBtn()
            ) : currentPage === 'case' &&
              osNo === null &&
              merchandiser === userName &&
              showMtrlCard === false &&
              isEditingCase === true ? (
                normalSummitBtn()
              ) : null}
        {/*Submit BTN srMtr Set */}
        {currentPage === 'mprice' ? normalSummitBtn() : null}
        {/*Submit BTN quotation Set */}
        {currentPage === 'quotation' &&
          quotateFor === 'garment' &&
          isQuotating === null
          ? null
          : currentPage === 'quotation'
            ? normalSummitBtn()
            : null}
        {/*Submit BTN Purchase Set */}
        {(currentPage === 'purchase' && openPage === 'caseSelector' && selectedCases.length !== 0) ||
          (currentPage === 'purchase' && openPage === 'purchaseOrder') ||
          (currentPage === 'purchase' && openPage === 'oSMtrlList') ||
          (currentPage === 'purchase' && openPage === 'leadTimePage')
          ? normalSummitBtn()
          : null}
        {/* Other Btns */}
        {/* @Case Sets */}
        {isEditingCase && currentPage === 'case' ? (
          <>
            {/* Read CSV */}
            {showMtrlCard ? (
              printOutElement()
            ) : (
                <div>
                  {' '}
                  {osNo || caseConfirmDate ? null : (
                    <div>
                      {currentPage === 'case' ? (
                        isImportedExcel ? (
                          <div className='btn-block bd-radius-s bg-cp-2-light-c center-content mt-1'>
                            Have imported Style from Excel
                          </div>
                        ) : (
                            <div className='round-area bg-cp-3 mt-1'>
                              <i className='fas fa-table fc-cp-1'>
                                {' '}
                            Read Bom from Excel
                          </i>
                              <label className='btn btn-block mt-05 bd-radius-s bd-light bg-cp-1 fs-small'>
                                <input
                                  type='file'
                                  id='upload-excel'
                                  name='inputFileName'
                                  accept='.xls, .xlsx'
                                  style={{
                                    position: 'fixed',
                                    right: '100%',
                                    bottom: '100%',
                                  }}
                                  onChange={labelOfReadExcel}
                                />
                                {excelName.length > 0 ? String(excelName) : null}
                                {inputFileName}
                              </label>
                              {inputFileName == 'Select a File...' ? null : (
                                <button
                                  className='btn btn-block mt-05 h-100 bd-radius-s bd-light bg-cp-2'
                                  onClick={readExcel}
                                >
                                  Read
                                </button>
                              )}
                            </div>
                          )
                      ) : null}
                      <div className='h-scatter-content mt-1'>
                        <div> Color Way</div>
                        <SqBtnLarge
                          label={<i className='fas fa-swatchbook'> Color ＋</i>}
                          onClick={addcWay}
                        />
                      </div>
                      <div className='h-scatter-content mt-05'>
                        <div>Size </div>
                        <SqBtnLarge
                          label={<i className='fas fa-ruler'> Size ＋</i>}
                          onClick={addSize}
                        />
                      </div>
                      <div className='h-scatter-content mt-05'>
                        <div>Material</div>
                        <SqBtnLarge
                          label={<i className='fab fa-buffer '> Item ＋</i>}
                          onClick={addMtrl}
                        />
                      </div>
                    </div>
                  )}
                  {/* <div>
                  {cNo === null ? null : (
                    <input
                      type='submit'
                      // form='caseForm'
                      className='btn btn-block bg-cp-1 mt-1'
                      value='Material Card'
                      onClick={onClick2}
                    />
                  )}
                </div> */}
                  {/* <div> */}
                  {cNo === null ? null : (
                    <div>
                      {merchandiser === userName ? (<div className='mt-1'>
                        {confirmArea('Confirm the Case', 'Case is Confirmed', 'Not Confirmed', caseConfirmDate, toggleCaseConfirmDate)}
                      </div>) : null}

                      <input
                        type='submit'
                        // form='caseForm'
                        className='btn btn-block bg-cp-1 mt-1 hover-cp-2'
                        value='Material Card'
                        onClick={onClick2}
                      />
                      <input
                        type='submit'
                        // form='caseForm'
                        className='btn btn-block bg-cp-1 mt-1 hover-cp-2'
                        value='Copy this case as a new Case'
                        onClick={onClick}
                      />
                    </div>
                  )}
                  {/* </div> */}
                </div>
              )}
          </>
        ) : null}
        {/* @Quotation Set */}
        {
          (currentPage =
            'quotation' && quotateFor === 'garment' ? (
              isQuotating === null || openQuoForm === null ? null : (
                <div>
                  {' '}
                  {printOutElement()}
                  <div className='round-area bd-light bg-cp-3 noPrint mb-05'>
                    <i className='fas fa-calculator fc-cp-1 mb-05'>
                      {' '}
                      Get the suggested Price
                    </i>
                    <div className='round-area bd-light bg-cp-1 mb-05'>
                      Select Size
                      {theCase ? (
                        <SizeSelector
                          sizes={theCase.sizes ? theCase.sizes : []}
                          className='noPrint'
                        />
                      ) : null}
                    </div>
                    <div className='round-area bd-light bg-cp-1 mb-05'>
                      Select color Way
                      {theCase ? (
                        <CWaySelector
                          cWays={theCase.cWays ? theCase.cWays : []}
                          className='noPrint'
                        />
                      ) : null}
                    </div>
                    <button
                      name='quotationBtn'
                      value={currentQuoForm._id}
                      onClick={onClickQuo}
                      className='btn bg-cp-2 btn-block bd-radius-s bd-light'
                    >
                      Price suggestion
                    </button>
                    {/* <SqBtnLarge
                      name='quotationBtn'
                      value={currentQuoForm._id}
                      onClick={onClickQuo}
                      label='Price suggestion'
                      className='noPrint w-15vw mb-05 '
                    /> */}
                  </div>
                </div>
              )
            ) : null)
        }
        {/* @Purchase Set */}
        {(currentPath === '/api/purchase' && openPage === 'purchaseOrder') ||
          (currentPath === '/api/purchase' && openPage === 'oSMtrlList') ? (
            <Fragment>
              {printOutElement()}
              {openPage === 'purchaseOrder' ?
                confirmArea('Confrim the PO', 'PO Has Confirmed', 'Not Confirmed', currentPo.poConfirmDate, togglePoConfirmDate)
                : null}
            </Fragment>
          ) : (currentPath === '/api/purchase' && openPage === 'caseSelector') ? (
            <section className='round-area bd-light bg-cp-1 mt-1'>
              <div className='fw-bold'>
                {selectedCases.length === 0 ?
                  <i className="fas fa-exclamation-circle"> Click and select case</i> :
                  <i className="fas fa-check"> Selected Case : </i>}
              </div>
              {selectedCases.length === 0 ? null : selectedCases.map((sc) => {
                return (<div className='center-content fs-small' key={`selectedCaseId${sc}`}>{caseList.find(({ _id }) => _id === sc).cNo}</div>)
              })}
            </section>
          ) : (currentPath === '/api/purchase' && openPage === 'osSelector' && osList.length === 0) ?
              (<section className='round-area bd-light bg-cp-1 mt-1'>
                <i className="fas fa-exclamation-circle"> No order summary found.</i>
                <div className='fs-small'>
                  Please go back to page "Select case, Make order summary", make an order summary first.
                </div>
              </section>
              )
              : null}
        {/* @CompleteSet Set */}
        {(currentPath === '/api/completeset' && openPage === 'csCaseSelector') ? (
          <section className='round-area bd-light bg-cp-1 mt-1'>
            <div className='fw-bold'>
              Arrange the order of production
            </div>
            {currentOrderSummary.caseList.map((OsCase) => {
              return (
                <div key={`OsCase${OsCase._id}`} className='round-area' >
                  OsCase
                  {OsCase.cNo}
                </div>
              )
            })}
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default LeftBar;

//  {
//    /* </div>
//             <div className='h-scatter-content mt-05'>
//               <div>Print</div>
//               <SqBtnLarge
//                 label={<i className='fas fa-print '> Print</i>}
//                 onClick={onClickPrintPage}
//               />
//             </div> */
//  }

         // <div className='round-area bd-light'>
                //   <div>
                //     <i className='fas fa-file-import'> Confirm the PO</i>
                //   </div>
                //   {currentPo.poConfirmDate ? (
                //     <LockedBadge
                //       labels={[
                //         <i className='fas fa-check-circle'> PO Has Confirmed</i>,
                //       ]}
                //       style={{ marginTop: '0.5rem' }}
                //       className='h-center-content'
                //     />
                //   ) : (
                //       <LockedBadge
                //         labels={['Not Confirmed']}
                //         style={{
                //           background: 'var(--fade-color)',
                //           marginTop: '0.5rem',
                //         }}
                //         className='h-center-content'
                //       />
                //     )}
                //   <div className='h-scatter-content mt-05'>
                //     <div></div>
                //     <SqBtnLarge onClick={toggleConfirmDate} label='Confirme' />
                //   </div>
                // </div>