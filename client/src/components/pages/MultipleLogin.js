import React from 'react';

export const NotFound = () => {
    return (
        <div className='container container-with-navbar'>
            <h1><i className="fas fa-exclamation-triangle"> Warning !</i></h1>
            <p className='lead'>Some one may try to login the server with your identification. Please change your password and login again.</p>
        </div>
    );
};

export default NotFound;
