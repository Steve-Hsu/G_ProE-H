import React, { useEffect } from 'react';

const Select = ({
  purpose = null,
  subject,
  optionList,
  onChange,
  required = false,
  label,
  className,
  selectedOption,
  id,
  name,
}) => {
  useEffect(() => {
    loadCaseSelectUnitTagIndex();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject]);

  // useEffect(() => {
  //   if (selectedOption === '') {
  //   } else {
  //     loadCaseSelectUnitTagIndex();
  //   }
  //   // if (id === null) {
  //   //   if (subject.id) {
  //   //     id = purpose + subject.id;
  //   //   } else {
  //   //     id = purpose + subject._id;
  //   //   }
  //   // }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedOption]);

  let options = [];
  switch (purpose) {
    case 'caseUnit':
      options = [
        'Unit',
        'cm',
        // 'doz',
        'g',
        // 'gross',
        'in',
        'm',
        'pcs',
        'set',
        'yds',
      ];
      break;
    case 'unit':
      options = [
        'Unit',
        'cm',
        'doz',
        'g',
        'gross',
        'in',
        'm',
        'pcs',
        'set',
        'yds',
        // 'print size',
      ];
      break;
    case 'currency':
      options = [
        'Currency',
        'AUD',
        'EUR',
        'HKD',
        'JPY',
        'KHR',
        'KRW',
        'MMK',
        'MYR',
        'NTD',
        'PHP',
        'RMB',
        'SGD',
        'THB',
        'USD',
        'VND',
      ];
      break;
    case 'condition':
      options = [
        'Select',
        'Delivery',
        'Forwarder',
        'Inspection',
        'Packing',
        'Payment',
        'Remark',
        'Shipment',
        'Shipping Mark',
        'Shipping sample',
      ];
      break;
    case 'item':
      options = [
        'Other',
        'Elastic',
        'Fabric',
        'Insulation',
        'Interfacing',
        'Knit',
        'Label',
        'Thread',
        'Woven',
        'Zipper',
      ];
      break;
    default:
      options = optionList;
  }

  const loadCaseSelectUnitTagIndex = () => {
    let selected = null;
    let id = subject.id || subject._id;
    if (selectedOption) {
      selected = document.getElementById(`${purpose}${selectedOption}${id}`);
      // console.log('the id', id); // test Code
      // console.log('the selectedOption', selectedOption); // test Code
      // console.log('the selected', selected); // test Code
    } else {
      selected = document.getElementById(`${purpose}empty${id}`);
    }
    if (selected) {
      selected.removeAttribute('selected');
      selected.setAttribute('selected', 'selected');
      // console.log('the seleted in select', selected); // Test Code
    }
  };

  const theId = (id) => {
    if (id) {
      return id;
    } else {
      return `${purpose}${subject.id ? subject.id : subject._id}`;
    }
  };

  const theName = (name) => {
    if (name) {
      return name;
    } else {
      return `${subject.id ? subject.id : subject._id}`;
    }
  };

  return (
    <div>
      {label ? <div className='fs-tiny  transition fc-gray-4'>{label}</div> : null}
      <select
        // id={`${purpose}${subject.id ? subject.id : subject._id}`}
        id={theId(id)}
        name={theName(name)}
        // list='garmentSize'
        // placeholder={placeholder}
        onChange={onChange}
        // default='yd'
        className={className}
        required={required}
      >
        {options.map((o) => {
          // console.log(`${purpose}${o}${subject.id ? subject.id : subject._id}`) // Test code
          return (
            <option
              key={`${o}${subject.id ? subject.id : subject._id}`}
              id={
                o
                  ? `${purpose}${o}${subject.id ? subject.id : subject._id}`
                  : `${purpose}empty${subject.id ? subject.id : subject._id}`
              }
              value={o}
            >
              {o}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default Select;
