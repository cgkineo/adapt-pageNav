import Adapt from 'core/js/adapt';
import React from 'react';
import { templates } from 'core/js/reactHelpers';

export default function PageNav(props) {
  const globals = Adapt.course.get('_globals');

  const {
    _items,
    onButtonClick
  } = props;

  return (
    <div className="component__inner pagenav__inner">

      <templates.header {...props} />

      <div className="component__widget pagenav__widget">

        <div className="pagenav__tooltip-container" />

        <nav className="pagenav__btn-container" aria-label={globals._components._pageNav.ariaRegion}>
          {_items.map(({ ...props }, index) => {

            return (
              <templates.pageNavItem {...props}
                key={index}
                onButtonClick={onButtonClick}
              />
            );

          })}
        </nav>

      </div>

    </div>
  );
}
