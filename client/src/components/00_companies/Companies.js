import React, { Fragment, useContext } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import CompanyItem from './CompanyItem';
import ComContext from '../../context/company/comContext';

const Companies = () => {
  //Init Context
  const comContext = useContext(ComContext);
  //Destructure, pull out the variables form comContext
  const { companies, filtered } = comContext;

  if (companies.length === 0) {
    return <h4>Please Enter A Company</h4>;
  }

  return (
    <Fragment>
      <TransitionGroup>
        {filtered !== null
          ? // if the filtered is not empty, then show the company in the filtered
            filtered.map((company) => (
              <CSSTransition key={company.id} timeout={500} classNames='item'>
                <CompanyItem company={company} />
              </CSSTransition>
            ))
          : // else show all company in companies
            companies.map((company) => (
              <CSSTransition key={company.id} timeout={500} classNames='item'>
                <CompanyItem company={company} />
              </CSSTransition>
            ))}
      </TransitionGroup>
    </Fragment>
  );
};

export default Companies;
