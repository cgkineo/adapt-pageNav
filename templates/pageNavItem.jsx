import Adapt from 'core/js/adapt';
import React from 'react';
import { compile, classes } from 'core/js/reactHelpers';

export default function PageNavItem(props) {
  const globals = Adapt.course.get('_globals');

  const {
    _isEnabled,
    _isHidden,
    _isCurrent,
    _classes,
    _iconClass,
    locked,
    type,
    _id,
    _index,
    text,
    ariaLabel,
    onButtonClick
  } = props;

  return (
    <>
      {_isEnabled &&

      <button
        className={classes([
          'pagenav__btn',
          _iconClass && 'btn-icon has-icon',
          text && 'btn-text has-text',
          _isHidden && 'is-hidden',
          locked && 'is-locked',
          (_isHidden || locked) && 'is-disabled',
          _classes
          // {{#if _alignIconRight}} icon-is-right{{else}} icon-is-left{{/if}}
        ])}
        role="link"
        data-type={type}
        data-id={_id}
        data-item-index={_index}
        disabled={(_isHidden || locked) && 'disabled'}
        aria-label={`${locked ? globals._accessibility._ariaLabels.locked + '. ' : ''}${compile(ariaLabel)}`}
        // data-tooltip="{{#if _showTooltip}}{{{compile tooltip this}}}{{/if}}"
        aria-current={_isCurrent ? 'page' : false}
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
