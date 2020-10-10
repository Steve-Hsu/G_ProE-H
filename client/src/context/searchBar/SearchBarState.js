import React, { useReducer } from 'react';
import axios from 'axios';
import SearchBarContext from './searchBarContext';
import SearchBarReducer from './searchBarReducer';
import { SEARCHBAR_TOGGLE_LIST, SEARCHBAR_SEARCH_INDEX } from '../types';

const SearchBarState = (props) => {
  //@ State
  const initialState = {
    isQuery: false,
    indexList: [],
  };

  const [state, dispatch] = useReducer(SearchBarReducer, initialState);

  //@ Action
  const searchCaseIndex = async (body) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const res = await axios.post('/api/case/query', body, config);
      console.log('Search result returned!');
      dispatch({ type: SEARCHBAR_SEARCH_INDEX, payload: res.data });
    } catch (err) {
      console.log(err.msg, 'Query failed');
    }
  };

  const searchSrMtrlIndex = async (body) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const res = await axios.post('/api/srmtrl/query', body, config);
      console.log('Seach result returned');
      dispatch({ type: SEARCHBAR_SEARCH_INDEX, payload: res.data });
    } catch (err) {
      console.log(err.msg, 'Query failed');
    }
  };

  const toggleIndexList = () => {
    dispatch({ type: SEARCHBAR_TOGGLE_LIST });
  };

  return (
    <SearchBarContext.Provider
      value={{
        isQuery: state.isQuery,
        indexList: state.indexList,
        searchCaseIndex,
        searchSrMtrlIndex,
        toggleIndexList,
      }}
    >
      {props.children}{' '}
    </SearchBarContext.Provider>
  );
};

export default SearchBarState;
