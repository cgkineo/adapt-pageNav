import { describe, whereFromPlugin, whereContent, mutateContent, checkContent, updatePlugin, getComponents, testSuccessWhere, testStopWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Page Nav - v2.4.0 to v3.0.0', async () => {
  whereFromPlugin('Page Nav - from v2.4.0', { name: 'adapt-pageNav', version: '<3.0.0' });
  const BUTTON_KEYS = ['_previous', '_root', '_up', '_next', '_close', '_returnToPreviousLocation'];
  const BUTTONS_WITH_CUSTOM_ROUTE_ID = ['_previous', '_root', '_up', '_next'];
  const BUTTONS_WITHOUT_CUSTOM_ROUTE_ID = ['_close', '_returnToPreviousLocation'];
  let pageNavs;

  whereContent('Page Nav - where pageNavs', async (content) => {
    pageNavs = getComponents('pageNav').concat(getComponents('bottomnavigation'));
    return pageNavs.length;
  });

  mutateContent('Page Nav - rename component from bottomnavigation to pageNav', async () => {
    pageNavs.forEach(pageNav => {
      if (pageNav._component === 'bottomnavigation') {
        pageNav._component = 'pageNav';
      }
    });
    return true;
  });

  mutateContent('Page Nav - add _shouldSkipOptionalPages', async () => {
    pageNavs.forEach(pageNav => {
      if (!_.has(pageNav, '_shouldSkipOptionalPages')) {
        pageNav._shouldSkipOptionalPages = false;
      }
    });
    return true;
  });

  mutateContent('Page Nav - remove _sibling button', async () => {
    pageNavs.forEach(pageNav => {
      if (_.has(pageNav, '_buttons._sibling')) {
        _.unset(pageNav._buttons, '_sibling');
      }
    });
    return true;
  });

  mutateContent('Page Nav - transform _alignIconRight to _iconAlignment', async () => {
    pageNavs.forEach(pageNav => {
      BUTTON_KEYS.forEach(key => {
        const button = _.get(pageNav._buttons, key);
        if (!button) return;
        if (_.has(button, '_alignIconRight')) {
          const alignRight = button._alignIconRight;
          button._iconAlignment = alignRight ? 'right' : 'left';
          _.unset(button, '_alignIconRight');
        }
      });
    });
    return true;
  });

  mutateContent('Page Nav - transform _showTooltip and tooltip to _tooltip object', async () => {
    pageNavs.forEach(pageNav => {
      BUTTON_KEYS.forEach(key => {
        const button = _.get(pageNav._buttons, key);
        if (!button) return;
        if (_.has(button, '_showTooltip') || _.has(button, 'tooltip')) {
          const isEnabled = _.get(button, '_showTooltip', false);
          const text = _.get(button, 'tooltip', '');
          button._tooltip = {
            _isEnabled: isEnabled,
            text
          };
          _.unset(button, '_showTooltip');
          _.unset(button, 'tooltip');
        }
      });
    });
    return true;
  });

  mutateContent('Page Nav - manage _customRouteId distribution on buttons', async () => {
    pageNavs.forEach(pageNav => {
      BUTTONS_WITH_CUSTOM_ROUTE_ID.forEach(key => {
        const button = _.get(pageNav._buttons, key);
        if (button && !_.has(button, '_customRouteId')) {
          button._customRouteId = '';
        }
      });
      BUTTONS_WITHOUT_CUSTOM_ROUTE_ID.forEach(key => {
        if (_.has(pageNav, `_buttons.${key}`)) {
          _.unset(pageNav._buttons[key], '_customRouteId');
        }
      });
    });
    return true;
  });

  checkContent('Page Nav - check component renamed to pageNav', async () => {
    const isValid = pageNavs.every(pageNav => pageNav._component === 'pageNav');
    if (!isValid) throw new Error('Page Nav - component not renamed to pageNav');
    return true;
  });

  checkContent('Page Nav - check _shouldSkipOptionalPages added', async () => {
    const isValid = pageNavs.every(pageNav => _.has(pageNav, '_shouldSkipOptionalPages'));
    if (!isValid) throw new Error('Page Nav - _shouldSkipOptionalPages not added');
    return true;
  });

  checkContent('Page Nav - check _sibling removed', async () => {
    const isValid = pageNavs.every(pageNav => !_.has(pageNav, '_buttons._sibling'));
    if (!isValid) throw new Error('Page Nav - _sibling not removed');
    return true;
  });

  checkContent('Page Nav - check _customRouteId distribution on buttons', async () => {
    const isValid = pageNavs.every(pageNav => {
      const hasCorrect = BUTTONS_WITH_CUSTOM_ROUTE_ID.every(key => {
        const button = _.get(pageNav._buttons, key);
        return !button || _.has(button, '_customRouteId');
      });
      const lacksIncorrect = BUTTONS_WITHOUT_CUSTOM_ROUTE_ID.every(key =>
        !_.has(pageNav, `_buttons.${key}._customRouteId`)
      );
      return hasCorrect && lacksIncorrect;
    });
    if (!isValid) throw new Error('Page Nav - _customRouteId incorrect distribution');
    return true;
  });

  checkContent('Page Nav - check _alignIconRight transformed to _iconAlignment', async () => {
    const isValid = pageNavs.every(pageNav =>
      BUTTON_KEYS.every(key => {
        const button = _.get(pageNav._buttons, key);
        return !button || !_.has(button, '_alignIconRight');
      })
    );
    if (!isValid) throw new Error('Page Nav - _alignIconRight not transformed');
    return true;
  });

  checkContent('Page Nav - check _showTooltip and tooltip transformed to _tooltip', async () => {
    const isValid = pageNavs.every(pageNav =>
      BUTTON_KEYS.every(key => {
        const button = _.get(pageNav._buttons, key);
        return !button || (!_.has(button, '_showTooltip') && !_.has(button, 'tooltip'));
      })
    );
    if (!isValid) throw new Error('Page Nav - _showTooltip or tooltip not transformed');
    return true;
  });

  updatePlugin('Page Nav - update to v3.0.0', { name: 'adapt-pageNav', version: '3.0.0', framework: '>=5.30.2' });

  testSuccessWhere('adapt-pageNav with bottomnavigation component name', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.0.0' }],
    content: [
      {
        _id: 'c-99',
        _component: 'bottomnavigation',
        _buttons: {
          _previous: {
            _isEnabled: true,
            _alignIconRight: false,
            _showTooltip: true,
            tooltip: 'Previous'
          },
          _next: {
            _isEnabled: true,
            _alignIconRight: true,
            _showTooltip: false,
            tooltip: 'Next'
          }
        }
      }
    ]
  });

  testSuccessWhere('adapt-pageNav with _sibling button', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.4.0' }],
    content: [
      {
        _id: 'c-100',
        _component: 'pageNav',
        _buttons: {
          _returnToPreviousLocation: {
            _isEnabled: true,
            _alignIconRight: false,
            _showTooltip: false,
            tooltip: 'Return',
            _customRouteId: 'foo'
          },
          _previous: { _isEnabled: true },
          _root: { _isEnabled: true },
          _up: { _isEnabled: true },
          _next: { _isEnabled: true },
          _sibling: {
            _isEnabled: true,
            _alignIconRight: false,
            _showTooltip: true,
            tooltip: 'Page {{index}}'
          },
          _close: {
            _isEnabled: true,
            _customRouteId: 'bar'
          }
        }
      }
    ]
  });

  testSuccessWhere('adapt-pageNav with minimal buttons', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.4.0' }],
    content: [
      {
        _id: 'c-105',
        _component: 'pageNav',
        _buttons: {
          _previous: { _isEnabled: true },
          _next: { _isEnabled: true }
        }
      }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '3.0.0' }]
  });

  testStopWhere('no pageNav components', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.4.0' }],
    content: [{ _component: 'text' }]
  });
});
