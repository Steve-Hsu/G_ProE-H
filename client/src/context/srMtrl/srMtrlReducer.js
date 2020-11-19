import {
  SRMTRL_DOWNLOAD,
  TOGGLE_ISUPDATE,
  SRMTRL_UPDATE,
  SRMTRL_UPLOAD,
  SRMTRL_CLEAR,
  UPDATE_EDITING_LIST,
  TOGGLE_MAINPRICE,
  UPDATE_ERROR,
  SRPAGE_SWITCH,
  SRINQUIRY_SUPPLIER_UPDATE,
} from '../types';

export default (state, action) => {
  switch (action.type) {
    case SRMTRL_DOWNLOAD:
      return {
        ...state,
        srMtrls: action.payload,
      };
    case TOGGLE_ISUPDATE:
      return {
        ...state,
        isUpdated: action.payload,
      };
    case SRMTRL_UPDATE:
      return {
        ...state,
        srMtrls: action.payload,
      };
    case SRMTRL_UPLOAD:
      return {
        ...state,
        srMtrls: action.payload,
        isUpdated: true,
      };
    case SRMTRL_CLEAR:
      return {
        srMtrls: [],
        isUpdated: false,
        editingList: [],
        srMtrlError: null,
        currentSrPage: null,
        inquirySupplier: null,
      };
    case UPDATE_EDITING_LIST:
      return {
        ...state,
        editingList: action.payload,
      };
    case TOGGLE_MAINPRICE:
      return {
        ...state,
        srMtrls: state.srMtrls.map((sr) => {
          const srMtrlId = action.payload.srMtrlId;
          const mPriceId = action.payload.mPriceId;
          if (sr._id === srMtrlId) {
            if (sr.mainPrice) {
              const check = sr.mainPrice.includes(mPriceId);
              if (check) {
                sr.mainPrice = null;
              } else {
                sr.mainPrice = mPriceId;
              }
            } else {
              sr.mainPrice = mPriceId;
            }
          }
          return sr;
        }),
      };
    case UPDATE_ERROR:
      return {
        ...state,
        srMtrlError: action.payload,
      }
    case SRPAGE_SWITCH:
      return {
        ...state,
        currentSrPage: action.payload
      }
    case SRINQUIRY_SUPPLIER_UPDATE:
      return {
        ...state,
        inquirySupplier: action.payload
      }
    default:
  }
};
