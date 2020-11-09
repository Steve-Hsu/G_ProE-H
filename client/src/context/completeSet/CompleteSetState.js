import React, { useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import CompleteSetContext from './completeSetContext';
import CompleteSetReducer from './completeSetReducer';

import {
    UPDATE_ERROR,
    OS_LIST_DOWNLOAD,
    OS_DOWNLOAD,
    CSPAGE_SWITCH,
    CS_CURRENT,
    DEFAULT,
    NEW_CS_ORDER,
} from '../types';

const CompleteSetState = (props) => {
    // @State
    const initialState = {
        osHeads: [],
        csPage: null,
        currentOS: {},
        currentCompleteSet: {},
        csError: null,
        newCsOrder: null,
    };
    const [state, dispatch] = useReducer(CompleteSetReducer, initialState);
    const { currentOS, newCsOrder } = state;

    //@Actions
    const getOsHeads = async () => {
        const res = await axios.get(`/api/completeset`);
        console.log('getOsHeads triggered')
        // console.log("the res ",res) // test code
        if (res.data.length === 0) {
            console.log('No order summary found!');
            dispatch({ type: UPDATE_ERROR, payload: 'No complete set found' })
            setTimeout(() => {
                dispatch({ type: UPDATE_ERROR, payload: null })
            }, 3500);
        } else {
            if (res.data[0].err) {
                const err = res.data[0].err
                console.log('Multiple user login~!')
                dispatch({ type: UPDATE_ERROR, payload: err });
                setTimeout(() => {
                    dispatch({ type: UPDATE_ERROR, payload: null });
                }, 3500);
            } else {
                console.log('download succeed!');
                dispatch({ type: OS_LIST_DOWNLOAD, payload: res.data });
            }
        }
    }
    const getCs = async (osNo) => {
        console.log('I triggered here !!!')
        const res = await axios.get(`/api/completeset/getcs/${osNo}`);
        // console.log("the res ",res) // test code
        if (!res.data) {
            console.log('No order summary found!');
            dispatch({ type: UPDATE_ERROR, payload: 'No complete set found' })
            setTimeout(() => {
                dispatch({ type: UPDATE_ERROR, payload: null })
            }, 3500);
        } else if (res.data.err) {
            const err = res.data.err
            console.log('Multiple user login~!')
            dispatch({ type: UPDATE_ERROR, payload: err });
            setTimeout(() => {
                dispatch({ type: UPDATE_ERROR, payload: null });
            }, 3500);
        } else {
            console.log('download succeed!');
            dispatch({ type: OS_DOWNLOAD, payload: res.data });
        }
    };

    const switchCsPage = (pageName) => {
        dispatch({ type: CSPAGE_SWITCH, payload: pageName });
    }

    const openCompleteSet = (elementId) => {
        dispatch({ type: CS_CURRENT, payload: elementId });
    }

    const clearCsError = () => {
        dispatch({ type: UPDATE_ERROR, payload: null })
    }

    const defaultCS = () => {
        dispatch({ type: DEFAULT })
    }

    const setNewCsOrder = (arr) => {
        dispatch({ type: NEW_CS_ORDER, payload: arr })
    }

    const uploadCsOrder = async () => {
        if (newCsOrder === null) {
            console.log('no new Cs Order')
        } else {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const body = {
                osNo: currentOS.osNo,
                newCsOrder
            }

            const res = await axios.post(
                '/api/completeset/',
                body,
                config
            );
            dispatch({ type: OS_DOWNLOAD, payload: res.data })
        }

    }

    return (
        <CompleteSetContext.Provider
            value={{
                osHeads: state.osHeads,
                csPage: state.csPage,
                currentOS: state.currentOS,
                currentCompleteSet: state.currentCompleteSet,
                csError: state.csError,
                newCsOrder: state.newCsOrder,
                getOsHeads,
                getCs,
                switchCsPage,
                openCompleteSet,
                clearCsError,
                defaultCS,
                setNewCsOrder,
                uploadCsOrder,

            }}
        >
            {props.children}
        </CompleteSetContext.Provider>
    );
}

export default CompleteSetState;