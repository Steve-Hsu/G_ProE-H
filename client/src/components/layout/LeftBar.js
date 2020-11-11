import React, { Fragment, useContext, useEffect } from 'react';
import AuthUserContext from '../../context/authUser/authUserContext';
import CasesContext from '../../context/cases/casesContext';
import QuoContext from '../../context/quo/quoContext';
import PurContext from '../../context/pur/purContext';
import CompleteSetContext from '../../context/completeSet/completeSetContext'
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
  const completeSetContext = useContext(CompleteSetContext)
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
  const { openPage, togglePoConfirmDate, currentPo, selectedCases, osList, } = purContext;
  const { csPage, setNewCsOrder, newCsOrder, csError } = completeSetContext;
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
    case '/api/completeset':
      currentPage = 'completeset';
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
        } else if (openPage === 'leadTimePage') {
          obj = {
            label: 'Save LeadTime',
            form: 'updateOsCaseMtrlLeadTime',
          }
        }

        break;
      case '/api/completeset':
        obj = {
          label: 'Check the leadTimes',
          form: 'updateCompleteSet',
        };
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

  //@ Drag functions for completeset
  // Functions for drag and drop
  // const allListDiv = () => {
  //   let rectArr = []
  //   let idArry = []
  //   if (currentPath === '/api/completeset' && openPage === 'csCaseSelector') {
  //     if (currentOrderSummary) {
  //       if (currentOrderSummary.caseList) {
  //         currentOrderSummary.caseList.map((OsCase) => {
  //           rectArr.push(document.getElementById(`OsCase${OsCase._id}`).getBoundingClientRect())
  //           idArry.push(`${OsCase._id}`)
  //         })
  //       } else {
  //       }
  //     }
  //   }
  //   let rects = rectArr
  //   let ids = idArry
  //   return { rects, ids }
  // }


  // const checkUpOrDown = (draggedDiv, droppableDiv) => {
  //   const topOfDraggedDiv = draggedDiv.getBoundingClientRect().top
  //   const topOfDroppableDiv = droppableDiv.getBoundingClientRect().top
  //   if (topOfDraggedDiv === topOfDroppableDiv) {
  //     return 'same'
  //   } else if (topOfDraggedDiv < topOfDroppableDiv) {
  //     return 'up'
  //   } else {
  //     return 'down'
  //   }
  // }



  // const movingWhenOver = (UpOrDown, draggedDiv, droppableDiv) => {
  //   if (UpOrDown === 'same') {
  //   } else if (UpOrDown === 'up') {
  //     let startPoint = false
  //     const allDiv = allListDiv()
  //     allDiv.ids.map((id, idx) => {
  //       const targetId = `OsCaseChild${id}`
  //       if (startPoint) {
  //         const theDiv = document.getElementById(targetId)
  //         // console.log(allDiv.rects[idx - 1].top)
  //         // if (targetId !== droppableDiv.id) {
  //         let b = 'yellow'
  //         const topPointForMoving = allDiv.rects[idx - 1].top
  //         console.log("allDiv top", topPointForMoving)
  //         console.log('the content ', theDiv.innerHTML)
  //         theDiv.style = `background:${b}; transform: translateY(-${theDiv.getBoundingClientRect().height}px); transition: all 0.5s;`
  //         // theDiv.style.top = allDiv.rects[idx - 1].top
  //         console.log("theDiv after move", theDiv.getBoundingClientRect().top)
  //         // } else {
  //         //   theDiv.style = 'height: 5rem'
  //         //   console.log("yes i'm the problem div,", theDiv.innerHTML)
  //         // }
  //       }
  //       if (targetId === draggedDiv.id) {
  //         startPoint = true
  //       }

  //       if (targetId === droppableDiv.id) {
  //         startPoint = false
  //         console.log('called')
  //       }

  //     })

  //   } else {

  //   }
  // }

  // // CallBacks for darg and drop
  // let draggedElement = null
  // let draggedObject = null
  // const bodyRect = document.body.getBoundingClientRect()

  // const handleDragStart = (e) => {
  //   draggedObject = e.target
  //   draggedElement = e.target.innerHTML
  //   let red = 'red'
  //   e.target.style = `background: ${red}`
  //   movingWhenOver(e)
  // }
  // const dragLeave = (e) => {
  //   if (e.target.innerHTML === draggedElement) {
  //     e.target.style = 'opacity:0'
  //   } else {
  //     e.target.style = 'background:var(--cp-1_1-light)'
  //   }

  // }

  // const dragEnter = (e) => {
  //   console.log(e.target.id)

  //   movingWhenOver(checkUpOrDown(draggedObject, e.target), draggedObject, e.target)

  // }

  // const dragOver = (e) => {
  //   e.preventDefault()
  //   if (e.target.innerHTML === draggedElement) {
  //     e.target.style = 'cursor:grab'
  //   } else {
  //     e.target.style = 'background:var(--cp-1_2); cursor:grab'
  //   }
  //   // console.log(e.target.id)

  // }

  // const handleDragEnd = (e) => {
  //   e.target.style = 'background:var(--cp-1_1-light)'
  // }

  // const handleDrop = (e) => {
  //   e.preventDefault();
  //   let currentHTML = e.target.innerHTML
  //   if (draggedElement !== e.target.innerHTML) {
  //     e.target.innerHTML = draggedElement
  //     draggedObject.innerHTML = currentHTML
  //   }
  //   e.target.style = 'opacity:1; background:var(--cp-1_1-light)'
  // }

  //@Drag and drop function 2 test ==-----
  //https://htmldom.dev/drag-and-drop-element-in-a-list/
  // The current dragging item
  let draggingEle;
  // The current position of mouse relative to the dragging element
  let x = 0
  let y = 0
  let placeholder;
  // The flag to switch dragging or not dragging
  let isDragginStarted = false;
  let theWidth = 0

  const mouseDownHandler = (e) => {
    if (isDragginStarted) {
      //Prevent doudle select, if user's dragging, can't trigger this func drag another div
    } else {
      draggingEle = e.target;
      // Calculate the mouse position
      const rect = draggingEle.getBoundingClientRect();
      // x = e.pageX
      // y = e.pageY
      x = e.pageX - rect.left;
      y = e.pageY - rect.top;
      console.log('the e.pageY', e.pageY)
      console.log('the rect.top', rect.top)
      console.log('the y', y)
      console.log('the y of client', e.clientY)
      console.log('the width of e.target', rect.width)
      theWidth = rect.width
      // Attach the listeners to `document`
      //This event mousemove is keeping triggered while you hold the item.
      document.addEventListener('mousemove', mouseMoveHandler);
      // //This event fired once you let go the mouse.
      document.addEventListener('mouseup', mouseUpHandler);
    }
  };

  const mouseMoveHandler = (e) => {
    console.log('the mouse moving')
    const draggingRect = draggingEle.getBoundingClientRect();
    let container = document.getElementById('osCaseListContainer')
    let index = 0
    if (!isDragginStarted) {
      // Update the flag
      isDragginStarted = true;



      // Let the placeholder take the height of dragging element
      // So the next element won't move up
      placeholder = document.createElement('div');
      placeholder.classList.add('v-center-content')
      placeholder.classList.add('p-05')
      placeholder.classList.add('fw-bold')
      placeholder.classList.add('fc-cp-2-c')
      placeholder.style.height = `${draggingRect.height}px`;


      placeholder.setAttribute('id', 'placeHolder')
      draggingEle.parentNode.insertBefore(
        placeholder,
        draggingEle.nextSibling
      );

    }
    // Get the 
    // Set position for dragging element
    draggingEle.style.position = 'absolute';
    // Steve: Don't konw why the positoin in y axis is not correct so I adjust it by adding '-55'
    draggingEle.style.top = `${e.pageY - y - 55}px`;
    draggingEle.style.left = `${e.pageX - x}px`;
    // Steve: I setting the width of the draggedEle by it original width.
    draggingEle.style.width = `${theWidth}px`
    draggingEle.style.background = `var(--cp-1_2)`
    draggingEle.style.cursor = 'grabbing'
    // console.log('The width of div when moving', theWidth)

    // nextEle
    //As user moves the item around, we define the previous and next sibling items:
    const prevEle = draggingEle.previousElementSibling;
    const nextEle = placeholder.nextElementSibling;

    // User moves item to the top
    if (prevEle && isAbove(draggingEle, prevEle)) {
      // The current order    -> The new order
      // prevEle              -> placeholder
      // draggingEle          -> draggingEle
      // placeholder          -> prevEle
      console.log("the preEle", prevEle)
      console.log("the nextEle", nextEle)
      swap(placeholder, draggingEle);
      swap(placeholder, prevEle);
      return;
    }
    // User moves the dragging element to the bottom
    if (nextEle && isAbove(nextEle, draggingEle)) {
      // The current order    -> The new order
      // draggingEle          -> nextEle
      // placeholder          -> placeholder
      // nextEle              -> draggingEle
      swap(nextEle, placeholder);
      swap(nextEle, draggingEle);
    }
    var arr = Array.prototype.slice.call(container.childNodes);
    index = arr.indexOf(placeholder); // The index of your element :)
    placeholder.innerHTML = index
  };

  const swap = function (nodeA, nodeB) {
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

    // Move `nodeA` to before the `nodeB`
    nodeB.parentNode.insertBefore(nodeA, nodeB);

    // Move `nodeB` to before the sibling of `nodeA`
    parentA.insertBefore(nodeB, siblingA);
  };

  const mouseUpHandler = function () {
    let thePlaceholder = document.getElementById('placeHolder')
    if (thePlaceholder) {
      // console.log("the placeholder", placeholder)
      // console.log("the placeholder parentNode", placeholder.parentNode)
      // Remove the placeholder

      thePlaceholder.remove()
      // placeholder && placeholder.parentNode.removeChild(placeholder);
      // placeholder && placeholder.parentNode.removeChild(placeholder);
      // Reset the flag
      isDragginStarted = false;

      // Remove the position styles
      // draggingEle.style = 'transition: 0.3s cubic-bezier(0.2, 1, 0.1, 1)'
      draggingEle.style.removeProperty('top');
      draggingEle.style.removeProperty('left');
      draggingEle.style.removeProperty('position');
      draggingEle.style.removeProperty('width');
      draggingEle.style.removeProperty('background');
      draggingEle.style.removeProperty('cursor');

      x = null;
      y = null;
      draggingEle = null;

      // Remove the handlers of `mousemove` and `mouseup`
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    }

    let container = document.getElementById('osCaseListContainer')
    var arr = Array.prototype.slice.call(container.childNodes);
    const orderList = arr.map((a) => {
      return a.innerHTML
    })
    setNewCsOrder(orderList)
  };

  const isAbove = function (nodeA, nodeB) {
    // Get the bounding rectangle of nodes
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();

    return (rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2);
  };

  return (
    <div
      className='container-with-navbar leftbar bg-white bd-light bd-no-t h-100 noPrint'
      style={{ height: 'clamp(100vh, 100%, 100%)' }}
    >
      <div className='leftbar-component ml-1'>
        {' '}
        {/*@Submit Btn */}
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
        {/*Submit BTN CompleteSet Set */}
        {currentPage === 'completeset' && csPage === 'completeSetSelector' ? normalSummitBtn() : null}
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
                      {merchandiser === userName ? osNo === null ? (<div className='mt-1'>
                        {confirmArea('Confirm the Case', 'Case is Confirmed', 'Not Confirmed', caseConfirmDate, toggleCaseConfirmDate)}
                      </div>) : null : null}

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
                return (<div className='center-content fs-small' key={`selectedCaseId${sc}`}>{sc}</div>)
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
        {(currentPath === '/api/completeset' && csPage === 'completeSetSelector') ? (
          <section className='round-area bd-light bg-cp-1 mt-1'>
            <div className='fw-bold'>
              Arrange the order of production
            </div>
            <div id='osCaseListContainer'>
              {newCsOrder.map((c) => {
                return (
                  <div
                    key={`OsCase${c}`}
                    id={`OsCase${c}`}
                    className='round-area bd-light bg-cp-1-light grabbable'
                    onMouseDown={mouseDownHandler}
                  >
                    {c}
                  </div>
                )
              })}
            </div>



            {/* {currentOrderSummary.caseList.map((OsCase) => {
              return (
                <div key={`OsCase${OsCase._id}`}
                  id={`OsCase${OsCase._id}`}
                  className='round-area bd-light bg-cp-1-light grabbable'
                  onDragStart={handleDragStart}
                  onDragLeave={dragLeave}
                  onDragEnter={dragEnter}
                  onDragOver={dragOver}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  draggable='true'
                >
                  OsCase
                  {OsCase.cNo}
                </div>
              )
            })} */}
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