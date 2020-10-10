import {
  ADD_USER,
  DELETE_USER,
  SET_CURRENT,
  CLEAR_CURRENT,
  FILTER_USER,
  CLEAR_FILTER_USER,
  USER_ERROR,
  COM_GET_USERS,
  CLEAR_USERS_STATE,
  // CONFIRM_DELETE_USER,
  // CLEAR_CONFIRM_DELETE,
  TOGGLE_LOSS_SET,
  TOGGLE_LOSS_CATEGORY,
  UPDATE_LOSS,
} from '../types';

export default (state, action) => {
  switch (action.type) {
    case COM_GET_USERS:
      return {
        ...state,
        users: action.payload,
        loading: false,
      };
    case ADD_USER:
      return {
        ...state,
        // ...State.users are users existing alread, the action.payload is the new USER just set
        // users: [action.payload, ...state.users],
        loading: false,
      };
    // case UPDATE_USER:
    //   return {
    //     ...state,
    //     users: state.users.map((user) =>
    //       //If the id of the USER passed in match to any id in the UserState.users, then set the values of this USER passed in to the id matched USER in ComState.users
    //       // user._id === action.payload._id ? action.payload : user
    //       user._id === action.payload._id ? user : action.payload
    //     ),
    //     loading: false,
    //   };
    // case CONFIRM_DELETE_USER:
    //   return {
    //     ...state,
    //     confirmDelete: action.payload,
    //   };

    // case CLEAR_CONFIRM_DELETE:
    //   return {
    //     ...state,
    //     confirmDelete: null,
    //   };
    case DELETE_USER:
      return {
        ...state,
        // Set ComState.users equals to USER that with different Id in payload
        users: state.users.filter((user) => user._id !== action.payload),
      };
    case SET_CURRENT:
      return {
        ...state,
        current: { ...action.payload, password: '', password2: '' },
      };
    case CLEAR_USERS_STATE:
      return {
        ...state,
        users: null,
        filtered: null,
        error: null,
        current: null,
      };
    case CLEAR_CURRENT:
      return {
        ...state,
        current: null,
      };
    case FILTER_USER:
      return {
        ...state,
        filtered: state.users.filter((USER) => {
          const regex = new RegExp(`${action.payload}`, 'gi');
          return USER.name.match(regex) || USER.email.match(regex);
        }),
      };
    case CLEAR_FILTER_USER:
      return {
        ...state,
        filtered: null,
      };
    case USER_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case TOGGLE_LOSS_SET:
      return {
        ...state,
        openLossSets: !state.openLossSets,
      };
    case TOGGLE_LOSS_CATEGORY:
      return {
        ...state,
        openLossCategory: action.payload,
      };
    case UPDATE_LOSS:
      return {
        ...state,
        users: state.users.map((u) => {
          if (u._id === action.payload._id) {
            u = action.payload;
          }
          return u;
        }),
      };
    default:
      return state;
  }
};
