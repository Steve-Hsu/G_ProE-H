import React from 'react';
import TableItem from './TableItem';

const Table = ({
  purpose,
  subjects,
  displayTitles,
  toggleItemAttributes,
  currentPath,
}) => {
  let supplier,
    ref_no,
    position,
    descriptions = false;

  displayTitles.filter((obj) => {
    switch (Object.keys(obj)[0]) {
      case 'supplier':
        supplier = obj['supplier'];
        break;
      case 'ref_no':
        ref_no = obj['ref_no'];
        break;
      case 'position':
        position = obj['position'];
        break;
      case 'descriptions':
        descriptions = obj['descriptions'];
        break;
      default:
    }
  });

  const trueInDisplayTitles = displayTitles.filter((obj) => {
    return Object.values(obj)[0] == true;
  }).length;

  const cellStyle = (keyWord, switcher = 4) => {
    let width = '13%';
    switch (keyWord) {
      case 'no':
        width = '3%';
        break;
      case 'supplier':
      case 'item':
        width = '13%';
        break;
      case 'ref_no':
        switch (switcher) {
          case 2:
            if (supplier) {
              width = '63%';
            }
            break;
          case 1:
            width = '78%';
          default:
            width = '13%';
        }
        break;
      case 'descriptions':
      case 'position':
        switch (switcher) {
          case 4:
            width = '23%';
            // console.log('Now', keyWord, ' applying width', width); // Test Code
            break;
          case 3:
            if (!position || !descriptions) {
              width = '48%';
              // console.log('Now', keyWord, ' applying width', width); // Test Code
            } else {
              width = '30.5%';
              // console.log('Now', keyWord, ' applying width', width); // Test Code
            }
            break;
          case 2:
            if (!position || !descriptions) {
              width = '63%';
              // console.log('Now', keyWord, ' applying width 63%'); // Test Code
            } else {
              width = '38%';
              // console.log('Now', keyWord, ' applying width', width); // Test Code
            }
            break;
          case 1:
            width = '78%';
            // console.log('Now', keyWord, ' applying width', width); // Test Code
            break;
          default:
            width = '23%';
          // console.log('Now', keyWord, ' applying width', width); // Test Code
        }
      default:
    }
    let style = {
      width,
      height: '2.5rem',
      display: 'flex',
      whiteSpace: 'nowrap',
      overflowY: 'auto',
      margin: '0 1%',
      padding: '0.5rem 0',
    };
    return style;
  };

  return (
    <div className='mt-05 mb-05 bg-cp-bg round-area' id='table'>
      {/* Taggole Header */}
      <div className='flexBox fc-cp-1 pb-05'>
        <div style={cellStyle('no')}>NO.</div>
        {purpose === '1_CaseForm' ? (
          <div style={cellStyle('item')}>ITEM</div>
        ) : null}
        {displayTitles.map((obj) => {

          const theTitle = Object.keys(obj)[0]
          if (theTitle) {
            let showTitle = ''
            switch (theTitle) {
              case 'cNo':
                showTitle = 'Case No.'
                break;
              case 'caseType':
                showTitle = 'Type.'
                break;
              case 'quoNo':
                showTitle = 'Quotation'
                break;
              case 'osNo':
                showTitle = 'OS No.'
                break;
              case 'mColor':
                showTitle = 'Color'
                break;
              case 'mSizeSPEC':
                showTitle = 'SPEC'
                break;
              default:
                showTitle = theTitle
            }
            return (
              <div
                key={`headerCellOf${Object.keys(obj)[0]}`}
                style={cellStyle(Object.keys(obj)[0], trueInDisplayTitles)}
              >
                {showTitle.toUpperCase()}
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
      {/* Table body */}
      <div className='overflow-auto-y ' style={{ maxHeight: '75vh' }}>
        {subjects.map((subject, idx) => (
          <TableItem
            key={subject.id ? subject.id : subject._id}
            id={subject.id ? subject.id : subject._id}
            subject={subject}
            idx={idx}
            displayTitles={displayTitles}
            cellStyle={cellStyle}
            toggleItemAttributes={toggleItemAttributes}
            purpose={purpose}
            currentPath={currentPath}
          />
        ))}
      </div>
    </div>
  );
};

export default Table;
