import React from 'react';
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
      target = 'client';
      break;
    case 'srMtrlSelector':
    case 'quoSrMtrlSelector':
      target = 'supplier';
      break;
    case 'purchaseOrder':
      target = 'noTargetBoard';
      break;

    default:
  }

  // Big swither
  if (target !== 'noTargetBoard') {
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
                <div className='grid-4 p-1'>
                  <div className='fc-cp-2'>{cate.toUpperCase()}</div>
                  <div className='fc-cp-1'>
                    The number of this category is{' '}
                    {categories('lengthOfItems')[idx]}
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
                                key={`empty${
                                  subject.id ? subject.id : subject._id
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
                                key={`empty${
                                  subject.id ? subject.id : subject._id
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
                            return (
                              <BoardItem
                                key={`empty${
                                  subject.id ? subject.id : subject._id
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
    return (
      <div>
        <div className='my-05 bg-cp-bg round-area'>
          <div className='grid-4 p-1'>
            <div className='fc-cp-2'>{label}</div>
            <div className='fc-cp-1'>
              The number of {label} is {subjects.length}
            </div>
          </div>
          <div className='center-content'>
            <div className='boardParent' key={`flexBoxOf${purpose}`}>
              {subjects.map((subject, subject_idx) => {
                return (
                  <BoardItem
                    key={`${subject.id || subject._id}${subject_idx}`}
                    id={`${subject.id || subject._id}${subject_idx}`}
                    purpose={purpose}
                    displayTitles={[]}
                    // subjects={subjects}
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
