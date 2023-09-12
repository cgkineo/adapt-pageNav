import Adapt from 'core/js/adapt';
import React from 'react';
import { compile, classes } from 'core/js/reactHelpers';

export default function PageNavItem(props) {
  const globals = Adapt.course.get('_globals');

  const {
    _classes,
    _iconAlignment,
    _iconClass,
    _id,
    _index,
    _isEnabled,
    _isHidden,
    _tooltipId,
    ariaLabel,
    locked,
    onButtonClick,
    text,
    type
  } = props;

  return (
    <>
      {_isEnabled &&

      <button
        className={classes([
          'pagenav__btn',
          _iconClass && 'btn-icon has-icon',
          _iconAlignment && `has-icon-${_iconAlignment}`,
          text && 'btn-text has-text',
          _isHidden && 'is-hidden',
          locked && 'is-locked',
          (_isHidden || locked) && 'is-disabled',
          _classes
        ])}
        role="link"
        data-type={type}
        data-id={_id}
        data-item-index={_index}
        data-tooltip-id={_tooltipId}
        disabled={_isHidden || locked}
        aria-label={`${locked ? globals._accessibility._ariaLabels.locked + '. ' : ''}${compile(ariaLabel, props)}`}
        onClick={onButtonClick}
      >

        <span className="pagenav__btn-inner">

          {_iconClass &&
          <span className="pagenav__btn-icon" aria-hidden="true">
            <span className={classes([
              'icon',
              _iconClass
            ])} />
          </span>
          }

          {text &&
          <span className="pagenav__btn-text">
            <span className="pagenav__btn-text-inner" dangerouslySetInnerHTML={{ __html: compile(text, props) }} />
          </span>
          }

        </span>

      </button>
      }

    </>
  );
}
