import {
  ADD_COMPANY,
  DELETE_COMPANY,
  SET_CURRENT,
  CLEAR_CURRENT,
  UPDATE_COMPANY,
  FILTER_COMPANY,
  CLEAR_FILTER_COMPANY,
} from '../types';

export default (state, action) => {
  switch (action.type) {
    case ADD_COMPANY:
      return {
        ...state,
        // ...State.companies are companies existing alread, the action.payload is the new company just set
        companies: [...state.companies, action.payload],
      };
    case UPDATE_COMPANY:
      return {
        ...state,
        companies: state.companies.map((company) =>
          //If the id of the company passed in match to any id in the ComState.companies, then set the values of this company passed in to the id matched company in ComState.companies
          company.id === action.payload.id ? action.payload : company
        ),
      };
    case DELETE_COMPANY:
      return {
        ...state,
        // Set ComState.companies equals to company that with different Id in payload
        companies: state.companies.filter(
          (company) => company.id !== action.payload
        ),
      };
    case SET_CURRENT:
      return {
        ...state,
        current: action.payload,
      };
    case CLEAR_CURRENT:
      return {
        ...state,
        current: null,
      };
    case FILTER_COMPANY:
      return {
        ...state,
        filtered: state.companies.filter((company) => {
          const regex = new RegExp(`${action.payload}`, 'gi');
          return company.comName.match(regex) || company.email.match(regex);
        }),
      };
    case CLEAR_FILTER_COMPANY:
      return {
        ...state,
        filtered: null,
      };
    default:
      return state;
  }
};
