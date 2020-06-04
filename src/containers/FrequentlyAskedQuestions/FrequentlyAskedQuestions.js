import React, { useState } from 'react';
import onClickOutside from 'react-onclickoutside';
import './FrequentlyAskedQuestions.scss';
import { StaticPage, TopbarContainer } from '..';
import {
    LayoutSingleColumn,
    LayoutWrapperTopbar,
    LayoutWrapperMain,
    LayoutWrapperFooter,
    Footer,
  } from '../../components';

function FrequentlyAskedQuestions({ title, items, multiSelect = false }) {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState([]);
  const toggle = () => setOpen(!open);
  FrequentlyAskedQuestions.handleClickOutside = () => setOpen(false);

  function handleOnClick(item) {
    if (!selection.some(current => current.id === item.id)) {
      if (!multiSelect) {
        setSelection([item]);
      } else if (multiSelect) {
        setSelection([...selection, item]);
      }
    } else {
      let selectionAfterRemoval = selection;
      selectionAfterRemoval = selectionAfterRemoval.filter(
        current => current.id !== item.id
      );
      setSelection([...selectionAfterRemoval]);
    }
  }

  function isItemInSelection(item) {
    if (selection.some(current => current.id === item.id)) {
      return true;
    }
    return false;
  }

  return (
    <StaticPage
    title="FAQs"
    schema={{
      '@context': 'http://schema.org',
      '@type': 'FAQs',
      description: 'Frequently asked questions',
      name: 'Frequently asked questions',
    }}
  >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>

        <LayoutWrapperMain className="staticPageWrapper">
         <div className="dd-wrapper">
        <div
        tabIndex={0}
        className="dd-header"
        role="button"
        onKeyPress={() => toggle(!open)}
        onClick={() => toggle(!open)}
           >
        <div className="dd-header__title">
          <p className="dd-header__title--bold">What is Hotdesk?</p>
        </div>
        <div className="dd-header__action">
          <p>{open ? 'Close' : 'Open'}</p>
        </div>
      </div>
      {open && (
        <p className="text">
          Studiotime is the largest and most trusted online community to book music studios. We have music studios in 35+ countries on our site. We’re a bootstrap marketplace and have successfully generated thousands of bookings in the past two years since we first started. <br />
Our mission is to help artists further their careers by making home studios to top-line studios all around the world accessible. We are also dedicated to helping studios share the incredible stories of music that originate in them, generate more bookings, and take their studio business to the world’s most creative and talented artists that search for studios on Studiotime.
        </p>
      )}
    </div>
    </LayoutWrapperMain>

<LayoutWrapperFooter>
  <Footer />
</LayoutWrapperFooter>
</LayoutSingleColumn>

</StaticPage>
  );
}

const clickOutsideConfig = {
  handleClickOutside: () => FrequentlyAskedQuestions.handleClickOutside,
};

export default onClickOutside(FrequentlyAskedQuestions, clickOutsideConfig);