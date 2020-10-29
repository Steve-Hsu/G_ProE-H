import React from 'react';
import purContext from '../../../context/pur/purContext';
import BoardItem from './BoardItem';

const Board = ({
  purpose,
  subjects,
  displayTitles,
  toggleItemAttributes,
  currentPath,
  label,
}) => {
  let target = '';
  switch (purpose) {
    case '1_CaseForm':
      target = 'item';
      break;
    case 'CaseSelector':
    case 'quoCaseSelector':
    case 'purCaseSelector':
      target = 'client';
      break;
    case 'srMtrlSelector':
    case 'quoSrMtrlSelector':
    case 'leadTimePage':
      target = 'supplier';
      break;
    case 'purchaseOrder':
    case 'completeSetOfCase':
      target = 'noTargetBoard';
      break;

    default:
  }

  // Big swither
  if (target !== 'noTargetBoard') {
    // @Standard Board
    const categories = (switcher) => {
      const valueOfCategories = subjects.map((subject) => {
        let str = '';
        if (subject[target]) {
          str = subject[target].toLowerCase();
        }
        // console.log('The target', target); // Test Code
        // console.log('The subject', subject); // Test Code
        return str;
      });
      // console.log('valueOfCategories', valueOfCategories); // Test Code

      const uniques = valueOfCategories.filter((vcate, idx) => {
        return valueOfCategories.indexOf(vcate) == idx;
      });

      switch (switcher) {
        case 'result':
          let result = [];
          uniques.map((uni) => {
            let re = '';
            let lengthOftheUni = 0;
            if (uni) {
              re = new RegExp(uni, 'i');
              lengthOftheUni = subjects.filter((subject) =>
                re.test(subject[target])
              ).length;
            } else {
              lengthOftheUni = subjects.filter((subject) => {
                return subject === '';
              }).length;
            }
            // console.log('thelengthOfTheUni', lengthOftheUni); // Test Code

            if (lengthOftheUni) {
              if (uni == '') {
                result.push('undefined');
              } else if (uni) {
                result.push(uni);
              } else {
                result.push('empty');
              }
            }
          });
          // console.log('The result', result);// Test Code
          return result;

        case 'lengthOfItems':
          const lengthOfCategories = uniques.map((uni) => {
            if (uni) {
              let re = new RegExp(`\\b${uni}\\b`, 'i');
              return subjects.filter((subject) => re.test(subject[target]))
                .length;
            } else {
              return 0;
            }
          });
          // console.log('The lengthOfCategories', lengthOfCategories); // Test Code
          return lengthOfCategories;

        case 'unique':
          // console.log('the uniques', uniques); // Test Code
          return uniques;
        case 'noPoCase':
          const lengthOfnoPoCase = uniques.map((uni) => {
            if (uni) {
              let re = new RegExp(`\\b${uni}\\b`, 'i');
              return subjects.filter((subject) => re.test(subject[target]) && subject.poDate === null)
                .length;
            } else {
              return 0;
            }
          });
          return lengthOfnoPoCase
        default:
      }
    };

    return (
      <div>
        {categories('result').map((cate, idx) => {
          const lengthOfTheCategory = categories('lengthOfItems')[idx];
          if (lengthOfTheCategory == 0) {
          } else {
            return (
              <div key={`boardOf${cate}`} className='my-05 bg-cp-bg round-area'>
                <div className='flexBox p-1'>
                  <div className='fc-cp-2 fs-lead mr-1'>{cate.toUpperCase()}</div>
                  <div className='fc-cp-1 center-content'>
                    {purpose === 'purCaseSelector' ? (
                      <span>
                        {categories('noPoCase')[idx]}{' '}Items
                      </span>
                    ) :
                      (<span>
                        {categories('lengthOfItems')[idx]}{' '}Items
                      </span>)}
                  </div>
                </div>
                <div className='center-content'>
                  <div className='boardParent' key={`flexBoxOf${cate}`}>
                    {subjects.map((subject, subject_idx) => {
                      var re = new RegExp(`\\b${subject[target]}\\b`, 'i');

                      switch (subject[target]) {
                        case undefined:
                          if (cate === 'empty') {
                            return (
                              <BoardItem
                                key={`empty${subject.id ? subject.id : subject._id
                                  }`}
                                id={subject.id ? subject.id : subject._id}
                                purpose={purpose}
                                displayTitles={displayTitles}
                                // subjects={subjects}
                                subject={subject}
                                toggleItemAttributes={toggleItemAttributes}
                                idx={subject_idx}
                                currentPath={currentPath}
                              />
                            );
                          } else {
                            return null;
                          }
                        case '':
                          if (cate === 'undefined') {
                            return (
                              <BoardItem
                                key={`empty${subject.id ? subject.id : subject._id
                                  }`}
                                id={subject.id ? subject.id : subject._id}
                                purpose={purpose}
                                displayTitles={displayTitles}
                                // target={target}
                                // subjects={subjects}
                                subject={subject}
                                toggleItemAttributes={toggleItemAttributes}
                                idx={subject_idx}
                                currentPath={currentPath}
                              />
                            );
                          } else {
                            return null;
                          }
                        default:
                          if (re.test(categories('unique')[idx])) {
                            // console.log(
                            //   "categories('unique')[idx]",
                            //   categories('unique')[idx]
                            // );
                            // console.log('the re', re);
                            // console.log('The cate', cate);
                            if (purpose === 'purCaseSelector' && subject.poDate !== null) {
                              return null
                            } else {
                              return (
                                <BoardItem
                                  key={`empty${subject.id ? subject.id : subject._id
                                    }`}
                                  id={subject.id ? subject.id : subject._id}
                                  purpose={purpose}
                                  displayTitles={displayTitles}
                                  // target={target}
                                  // subjects={subjects}
                                  subject={subject}
                                  toggleItemAttributes={toggleItemAttributes}
                                  idx={subject_idx}
                                  currentPath={currentPath}
                                />
                              );
                            }
                          } else {
                            return null;
                          }

                      }

                    })}
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  } else {
    // @No target board
    let loopItems = subjects
    if (purpose === 'purchaseOrder' || purpose === 'completeSetOfCase') {
      loopItems = subjects[0]
    }
    return (
      <div>
        <div className='my-05 bg-cp-bg round-area'>
          <div className='flexBox fc-cp-2 fs-lead p-1'>
            <div className='mr-2'>{label}</div>
            <div>
              {subjects[1].length}
              <span className='fs-normal fc-cp-1'>{purpose === 'purchaseOrder' ? ' materials' : ' Items'}</span>
            </div>
          </div>
          <div className='center-content'>
            <div className='boardParent' key={`flexBoxOf${purpose}`}>
              {loopItems.map((subject, subject_idx) => {
                return (
                  <BoardItem
                    key={`${subject.id || subject._id}${subject_idx}`}
                    id={`${subject.id || subject._id}${subject_idx}`}
                    purpose={purpose}
                    displayTitles={purpose === 'purchaseOrder' ?
                      subjects[1].filter((s) => s.supplier === subject.supplier).length
                      : purpose === 'completeSetOfCase' ? [
                        { cNo: true },
                        { style: true },
                        { caseType: true },
                        { client: true },
                        { merchandiser: true },
                        { quoNo: true },
                      ] : []}
                    subject={subject}
                    toggleItemAttributes={toggleItemAttributes}
                    idx={subject_idx}
                    currentPath={currentPath}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Board;
