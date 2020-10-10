import React, { useContext } from 'react';
import SearchBarContext from '../../context/searchBar/searchBarContext';
import CasesContext from '../../context/cases/casesContext';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';

const SearchBarListItem = ({ item, currentPage }) => {
  const casesContext = useContext(CasesContext);
  const searchBarContext = useContext(SearchBarContext);
  const srMtrlContext = useContext(SrMtrlContext);
  const { indexList, toggleIndexList } = searchBarContext;
  const { downloadCase } = casesContext;
  const { getSpecificSrMtrl } = srMtrlContext;

  const onClick = (e) => {
    e.preventDefault();
    const targetId = e.target.id;
    switch (currentPage) {
      case 'case':
        downloadCase(targetId);
        break;
      case 'mprice':
        const obj = indexList.find(({ _id }) => _id === targetId);
        getSpecificSrMtrl(obj);
      default:
    }

    toggleIndexList();
  };

  const itemList = ['cNo', 'style', 'client', 'userName', 'supplier', 'ref_no'];

  return (
    <div
      className='btn'
      style={{ background: 'black', width: '100%' }}
      key={item._id}
      id={item._id}
      onClick={onClick}
    >
      {itemList.map((i) => {
        if (item[i]) {
          return (
            <span key={`${i}${item._id}`} className='badge'>
              {item[i]}
            </span>
          );
        } else {
          return null;
        }
      })}
    </div>
  );
};

export default SearchBarListItem;
