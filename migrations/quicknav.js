import { describe, whereContent, whereFromPlugin, whereToPlugin, mutateContent, checkContent, removePlugin, addPlugin, getComponents, testSuccessWhere, testStopWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Quick Nav to Page Nav - quicknav <=v4.0.0 to pageNav v3.1.10', async () => {
  const BUTTON_KEYS = ['_returnToPreviousLocation', '_previous', '_root', '_up', '_next', '_close'];
  const CUSTOM_ROUTE_BUTTONS = ['_previous', '_root', '_up', '_next'];
  const DEFAULT_ICON_CLASSES = {
    _returnToPreviousLocation: 'icon-controls-left',
    _previous: 'icon-controls-left',
    _root: 'icon-home',
    _up: 'icon-controls-up',
    _next: 'icon-controls-right',
    _close: 'icon-cross'
  };
  const DEFAULT_TOOLTIP_TEXT = { _close: 'Close window' };
  const RETURN_TO_PREVIOUS_LOCATION = {
    _isEnabled: false,
    _lockUntilPageComplete: false,
    _order: 1,
    _classes: '',
    _iconClass: 'icon-controls-left',
    _iconAlignment: 'auto',
    text: 'Return',
    ariaLabel: 'Return to previous location',
    _tooltip: { _isEnabled: true, text: '{{displayTitle}}' }
  };
  let quickNavs;

  whereFromPlugin('Quick Nav - from adapt-quicknav <=v4.0.0', { name: 'adapt-quicknav', version: '<=4.0.0' });

  whereToPlugin('Page Nav - to adapt-pageNav', { name: 'adapt-pageNav' });

  whereContent('Quick Nav - where quicknav components', async () => {
    quickNavs = getComponents('quicknav');
    return quickNavs.length;
  });

  mutateContent('Quick Nav - rename _component to pageNav', async () => {
    quickNavs.forEach(quickNav => { quickNav._component = 'pageNav'; });
    return true;
  });

  mutateContent('Quick Nav - add _shouldSkipOptionalPages', async () => {
    quickNavs.forEach(quickNav => {
      if (_.has(quickNav, '_shouldSkipOptionalPages')) return;
      quickNav._shouldSkipOptionalPages = false;
    });
    return true;
  });

  mutateContent('Quick Nav - remove _buttons._sibling', async () => {
    quickNavs.forEach(quickNav => _.unset(quickNav, '_buttons._sibling'));
    return true;
  });

  mutateContent('Quick Nav - add _lockUntilPageComplete to buttons', async () => {
    quickNavs.forEach(quickNav => {
      BUTTON_KEYS.forEach(key => {
        const button = _.get(quickNav, `_buttons.${key}`);
        if (!button || _.has(button, '_lockUntilPageComplete')) return;
        button._lockUntilPageComplete = false;
      });
    });
    return true;
  });

  mutateContent('Quick Nav - convert _alignIconRight to _iconAlignment', async () => {
    quickNavs.forEach(quickNav => {
      BUTTON_KEYS.forEach(key => {
        const button = _.get(quickNav, `_buttons.${key}`);
        if (!button) return;
        button._iconAlignment = button._alignIconRight === true ? 'right' : 'auto';
        _.unset(button, '_alignIconRight');
      });
    });
    return true;
  });

  mutateContent('Quick Nav - convert _showTooltip/tooltip to _tooltip', async () => {
    quickNavs.forEach(quickNav => {
      BUTTON_KEYS.forEach(key => {
        const button = _.get(quickNav, `_buttons.${key}`);
        if (!button) return;
        const _isEnabled = button._showTooltip === true;
        const text = button.tooltip || DEFAULT_TOOLTIP_TEXT[key] || '{{displayTitle}}';
        button._tooltip = { _isEnabled, text };
        _.unset(button, '_showTooltip');
        _.unset(button, 'tooltip');
      });
    });
    return true;
  });

  mutateContent('Quick Nav - set _iconClass defaults where empty', async () => {
    quickNavs.forEach(quickNav => {
      BUTTON_KEYS.forEach(key => {
        const button = _.get(quickNav, `_buttons.${key}`);
        if (!button || button._iconClass !== '') return;
        button._iconClass = DEFAULT_ICON_CLASSES[key];
      });
    });
    return true;
  });

  mutateContent('Quick Nav - remove _customRouteId from _close', async () => {
    quickNavs.forEach(quickNav => _.unset(quickNav, '_buttons._close._customRouteId'));
    return true;
  });

  mutateContent('Quick Nav - add _buttons._returnToPreviousLocation where missing', async () => {
    quickNavs.forEach(quickNav => {
      if (_.has(quickNav, '_buttons._returnToPreviousLocation')) return;
      quickNav._buttons._returnToPreviousLocation = _.cloneDeep(RETURN_TO_PREVIOUS_LOCATION);
    });
    return true;
  });

  checkContent('Quick Nav - check _component renamed to pageNav', async () => {
    const isValid = quickNavs.every(quickNav => quickNav._component === 'pageNav');
    if (!isValid) throw new Error('Quick Nav - _component not renamed to pageNav');
    return true;
  });

  checkContent('Quick Nav - check _sibling removed', async () => {
    const isValid = quickNavs.every(quickNav => !_.has(quickNav, '_buttons._sibling'));
    if (!isValid) throw new Error('Quick Nav - _buttons._sibling not removed');
    return true;
  });

  checkContent('Quick Nav - check buttons converted to pageNav structure', async () => {
    const isValid = quickNavs.every(quickNav => BUTTON_KEYS.every(key => {
      const button = _.get(quickNav, `_buttons.${key}`);
      if (!button) return true;
      return _.has(button, '_lockUntilPageComplete') && _.has(button, '_iconAlignment') && _.has(button, '_tooltip') && !_.has(button, '_alignIconRight') && !_.has(button, '_showTooltip') && !_.has(button, 'tooltip');
    }));
    if (!isValid) throw new Error('Quick Nav - buttons not fully converted to pageNav structure');
    return true;
  });

  checkContent('Quick Nav - check _returnToPreviousLocation present', async () => {
    const isValid = quickNavs.every(quickNav => _.has(quickNav, '_buttons._returnToPreviousLocation._tooltip'));
    if (!isValid) throw new Error('Quick Nav - _buttons._returnToPreviousLocation missing');
    return true;
  });

  removePlugin('Quick Nav - remove adapt-quicknav', { name: 'adapt-quicknav' });

  addPlugin('Page Nav - add adapt-pageNav', { name: 'adapt-pageNav', version: '3.1.10' });

  testSuccessWhere('adapt-quicknav v3.0.3 structure', {
    fromPlugins: [{ name: 'adapt-quicknav', version: '3.0.3' }],
    toPlugins: [{ name: 'adapt-pageNav', version: '3.1.10' }],
    content: [
      {
        _id: 'c-100',
        _component: 'quicknav',
        _loopStyle: 'none',
        _buttons: {
          _previous: { _isEnabled: true, _order: 1, _classes: '', _iconClass: '', _alignIconRight: false, text: '< Previous', ariaLabel: 'Previous Page', _showTooltip: true, tooltip: '{{displayTitle}}', _customRouteId: '' },
          _root: { _isEnabled: true, _order: 1, _classes: '', _iconClass: '', _alignIconRight: false, text: 'Go to main menu', ariaLabel: 'Got to Main menu', _showTooltip: true, tooltip: '{{displayTitle}}', _customRouteId: '' },
          _up: { _isEnabled: true, _order: 1, _classes: '', _iconClass: '', _alignIconRight: false, text: 'Back to menu', ariaLabel: 'Back to menu', _showTooltip: true, tooltip: '{{displayTitle}}', _customRouteId: 'co-10' },
          _next: { _isEnabled: true, _order: 1, _classes: '', _iconClass: '', _alignIconRight: true, text: 'Next >', ariaLabel: 'Next Page', _showTooltip: true, tooltip: '{{displayTitle}}', _customRouteId: '' },
          _sibling: { _isEnabled: true, _order: 1, _classes: '', _iconClass: '', _alignIconRight: false, text: '{{inc index}}', ariaLabel: 'Page {{inc index}}', _showTooltip: true, tooltip: '{{displayTitle}}', _customRouteId: '' },
          _close: { _isEnabled: true, _order: 1, _classes: '', _iconClass: '', _alignIconRight: false, text: 'Close', ariaLabel: 'Close window', _showTooltip: false, tooltip: 'Close window', _customRouteId: '' }
        }
      }
    ]
  });

  testSuccessWhere('adapt-quicknav v4.0.0 structure with _returnToPreviousLocation', {
    fromPlugins: [{ name: 'adapt-quicknav', version: '4.0.0' }],
    toPlugins: [{ name: 'adapt-pageNav', version: '3.1.10' }],
    content: [
      {
        _id: 'c-100',
        _component: 'quicknav',
        _loopStyle: 'none',
        _buttons: {
          _returnToPreviousLocation: { _isEnabled: false, _lockUntilPageComplete: false, _order: 1, _classes: '', _iconClass: '', _alignIconRight: false, text: 'Return', ariaLabel: 'Return to previous location', _showTooltip: false, tooltip: '{{displayTitle}}' },
          _previous: { _isEnabled: false, _lockUntilPageComplete: false, _order: 1, _classes: '', _iconClass: '', _alignIconRight: false, text: 'Previous', ariaLabel: 'Previous Page', _showTooltip: false, tooltip: '{{displayTitle}}', _customRouteId: '' },
          _next: { _isEnabled: false, _lockUntilPageComplete: false, _order: 1, _classes: '', _iconClass: '', _alignIconRight: true, text: 'Next', ariaLabel: 'Next Page', _showTooltip: false, tooltip: '{{displayTitle}}', _customRouteId: '' },
          _close: { _isEnabled: false, _lockUntilPageComplete: false, _order: 1, _classes: '', _iconClass: '', _alignIconRight: false, text: 'Close', ariaLabel: 'Close window', _showTooltip: false, tooltip: 'Close window' }
        }
      }
    ]
  });

  testStopWhere('incorrect plugin', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '3.1.10' }]
  });

  testStopWhere('no quicknav components', {
    fromPlugins: [{ name: 'adapt-quicknav', version: '3.0.3' }],
    toPlugins: [{ name: 'adapt-pageNav', version: '3.1.10' }],
    content: [{ _id: 'c-100', _component: 'text' }]
  });
});
