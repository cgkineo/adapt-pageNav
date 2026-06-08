import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getComponents, testSuccessWhere, testStopWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Page Nav - v2.4.0 to v3.0.0', async () => {
  const REMAINING_BUTTONS = ['_previous', '_root', '_up', '_next', '_close'];
  const DEFAULT_ICON_CLASSES = {
    _previous: 'icon-controls-left',
    _root: 'icon-home',
    _up: 'icon-controls-up',
    _next: 'icon-controls-right',
    _close: 'icon-cross'
  };
  const DEFAULT_TOOLTIP_TEXT = { _close: 'Close window' };
  let pageNavs;

  whereFromPlugin('Page Nav - from <v3.0.0', { name: 'adapt-pageNav', version: '<3.0.0' });

  whereContent('Page Nav - where pageNavs', async () => {
    pageNavs = getComponents('pageNav');
    return pageNavs.length;
  });

  mutateContent('Page Nav - remove _buttons._returnToPreviousLocation', async () => {
    pageNavs.forEach(pageNav => _.unset(pageNav, '_buttons._returnToPreviousLocation'));
    return true;
  });

  mutateContent('Page Nav - remove _buttons._sibling', async () => {
    pageNavs.forEach(pageNav => _.unset(pageNav, '_buttons._sibling'));
    return true;
  });

  mutateContent('Page Nav - convert _alignIconRight to _iconAlignment', async () => {
    pageNavs.forEach(pageNav => {
      REMAINING_BUTTONS.forEach(key => {
        const button = _.get(pageNav, `_buttons.${key}`);
        if (!button) return;
        button._iconAlignment = button._alignIconRight === true ? 'right' : 'auto';
        _.unset(button, '_alignIconRight');
      });
    });
    return true;
  });

  mutateContent('Page Nav - convert _showTooltip/tooltip to _tooltip', async () => {
    pageNavs.forEach(pageNav => {
      REMAINING_BUTTONS.forEach(key => {
        const button = _.get(pageNav, `_buttons.${key}`);
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

  mutateContent('Page Nav - set _iconClass defaults where empty', async () => {
    pageNavs.forEach(pageNav => {
      REMAINING_BUTTONS.forEach(key => {
        const button = _.get(pageNav, `_buttons.${key}`);
        if (!button || button._iconClass !== '') return;
        button._iconClass = DEFAULT_ICON_CLASSES[key];
      });
    });
    return true;
  });

  checkContent('Page Nav - check _returnToPreviousLocation removed', async () => {
    const isValid = pageNavs.every(pageNav => !_.has(pageNav, '_buttons._returnToPreviousLocation'));
    if (!isValid) throw new Error('Page Nav - _buttons._returnToPreviousLocation not removed');
    return true;
  });

  checkContent('Page Nav - check _sibling removed', async () => {
    const isValid = pageNavs.every(pageNav => !_.has(pageNav, '_buttons._sibling'));
    if (!isValid) throw new Error('Page Nav - _buttons._sibling not removed');
    return true;
  });

  checkContent('Page Nav - check _iconAlignment added and _alignIconRight removed', async () => {
    const isValid = pageNavs.every(pageNav => REMAINING_BUTTONS.every(key => {
      const button = _.get(pageNav, `_buttons.${key}`);
      if (!button) return true;
      return _.has(button, '_iconAlignment') && !_.has(button, '_alignIconRight');
    }));
    if (!isValid) throw new Error('Page Nav - _iconAlignment not set or _alignIconRight not removed');
    return true;
  });

  checkContent('Page Nav - check _tooltip added and _showTooltip/tooltip removed', async () => {
    const isValid = pageNavs.every(pageNav => REMAINING_BUTTONS.every(key => {
      const button = _.get(pageNav, `_buttons.${key}`);
      if (!button) return true;
      return _.has(button, '_tooltip') && !_.has(button, '_showTooltip') && !_.has(button, 'tooltip');
    }));
    if (!isValid) throw new Error('Page Nav - _tooltip not added or old tooltip fields not removed');
    return true;
  });

  updatePlugin('Page Nav - update to v3.0.0', { name: 'adapt-pageNav', version: '3.0.0', framework: '>=5.30.2' });

  testSuccessWhere('v2.4.0 pageNav with deprecated fields and all buttons', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.4.0' }],
    content: [
      {
        _id: 'c-100',
        _component: 'pageNav',
        _buttons: {
          _returnToPreviousLocation: { _isEnabled: false, _iconClass: '', _alignIconRight: false, _showTooltip: false, tooltip: '{{displayTitle}}' },
          _previous: { _isEnabled: true, _iconClass: '', _alignIconRight: false, _showTooltip: true, tooltip: 'Previous page' },
          _root: { _isEnabled: true, _iconClass: '', _alignIconRight: false, _showTooltip: false, tooltip: '{{displayTitle}}' },
          _up: { _isEnabled: false, _iconClass: '', _alignIconRight: false, _showTooltip: false, tooltip: '{{displayTitle}}' },
          _next: { _isEnabled: true, _iconClass: '', _alignIconRight: true, _showTooltip: true, tooltip: 'Next page' },
          _sibling: { _isEnabled: false, _iconClass: '', _alignIconRight: false, _showTooltip: false, tooltip: '{{displayTitle}}' },
          _close: { _isEnabled: false, _iconClass: '', _alignIconRight: false, _showTooltip: false, tooltip: 'Close window' }
        }
      }
    ]
  });

  testSuccessWhere('v2.4.0 minimal pageNav with only _previous and _next', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.4.0' }],
    content: [
      {
        _id: 'c-100',
        _component: 'pageNav',
        _buttons: {
          _previous: { _isEnabled: true, _iconClass: '', _alignIconRight: false, _showTooltip: false, tooltip: '{{displayTitle}}' },
          _next: { _isEnabled: true, _iconClass: '', _alignIconRight: true, _showTooltip: false, tooltip: '{{displayTitle}}' }
        }
      }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '3.0.0' }]
  });

  testStopWhere('no pageNav components', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.4.0' }],
    content: [{ _id: 'c-100', _component: 'text' }]
  });
});

describe('Page Nav - v3.0.0 to v3.0.1', async () => {
  let pageNavs;

  whereFromPlugin('Page Nav - from >=3.0.0 <3.0.1', { name: 'adapt-pageNav', version: '>=3.0.0 <3.0.1' });

  whereContent('Page Nav - where pageNavs', async () => {
    pageNavs = getComponents('pageNav');
    return pageNavs.length;
  });

  mutateContent('Page Nav - restore _buttons._returnToPreviousLocation', async () => {
    pageNavs.forEach(pageNav => {
      if (_.has(pageNav, '_buttons._returnToPreviousLocation')) return;
      pageNav._buttons._returnToPreviousLocation = {
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
    });
    return true;
  });

  checkContent('Page Nav - check _returnToPreviousLocation restored with _tooltip', async () => {
    const isValid = pageNavs.every(pageNav => {
      const button = _.get(pageNav, '_buttons._returnToPreviousLocation');
      return button && _.has(button, '_tooltip');
    });
    if (!isValid) throw new Error('Page Nav - _returnToPreviousLocation not restored or missing _tooltip');
    return true;
  });

  updatePlugin('Page Nav - update to v3.0.1', { name: 'adapt-pageNav', version: '3.0.1', framework: '>=5.30.2' });

  testSuccessWhere('v3.0.0 pageNav without _returnToPreviousLocation', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '3.0.0' }],
    content: [
      {
        _id: 'c-100',
        _component: 'pageNav',
        _buttons: {
          _previous: { _isEnabled: true, _iconClass: 'icon-controls-left', _iconAlignment: 'auto', _tooltip: { _isEnabled: false, text: '{{displayTitle}}' } },
          _next: { _isEnabled: true, _iconClass: 'icon-controls-right', _iconAlignment: 'right', _tooltip: { _isEnabled: false, text: '{{displayTitle}}' } }
        }
      }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '3.0.1' }]
  });
});

describe('Page Nav - v3.0.1 to v3.1.10', async () => {
  const TOOLTIP_TEXT_FIXES = {
    _previous: { from: 'Home', to: 'Previous' },
    _root: { from: 'Home', to: 'Menu' },
    _up: { from: 'Home', to: 'Back to menu' },
    _returnToPreviousLocation: { from: 'Return to previous location', to: 'Return' },
    _next: { from: 'Home', to: 'Next' },
    _close: { from: 'Home', to: 'Close' }
  };
  const TOOLTIP_KEYS = ['_tooltip', '_navTooltip'];
  let pageNavs;

  whereFromPlugin('Page Nav - from >=3.0.1 <3.1.10', { name: 'adapt-pageNav', version: '>=3.0.1 <3.1.10' });

  whereContent('Page Nav - where pageNavs', async () => {
    pageNavs = getComponents('pageNav');
    return pageNavs.length;
  });

  mutateContent('Page Nav - correct stale tooltip text defaults', async () => {
    pageNavs.forEach(pageNav => {
      Object.keys(TOOLTIP_TEXT_FIXES).forEach(buttonKey => {
        const button = _.get(pageNav, `_buttons.${buttonKey}`);
        if (!button) return;
        const fix = TOOLTIP_TEXT_FIXES[buttonKey];
        TOOLTIP_KEYS.forEach(tooltipKey => {
          const tooltip = button[tooltipKey];
          if (!tooltip || tooltip.text !== fix.from) return;
          tooltip.text = fix.to;
        });
      });
    });
    return true;
  });

  checkContent('Page Nav - check no stale tooltip text defaults remain', async () => {
    const isValid = pageNavs.every(pageNav => Object.keys(TOOLTIP_TEXT_FIXES).every(buttonKey => {
      const button = _.get(pageNav, `_buttons.${buttonKey}`);
      if (!button) return true;
      const fix = TOOLTIP_TEXT_FIXES[buttonKey];
      return TOOLTIP_KEYS.every(tooltipKey => {
        const tooltip = button[tooltipKey];
        return !tooltip || tooltip.text !== fix.from;
      });
    }));
    if (!isValid) throw new Error('Page Nav - stale tooltip text default remains');
    return true;
  });

  updatePlugin('Page Nav - update to v3.1.10', { name: 'adapt-pageNav', version: '3.1.10', framework: '>=5.30.2' });

  testSuccessWhere('v3.0.1 pageNav with stale Home tooltip defaults', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '3.0.1' }],
    content: [
      {
        _id: 'c-100',
        _component: 'pageNav',
        _buttons: {
          _previous: { _isEnabled: true, _tooltip: { _isEnabled: true, text: 'Home' } },
          _root: { _isEnabled: true, _navTooltip: { _isEnabled: true, text: 'Home' } },
          _returnToPreviousLocation: { _isEnabled: false, _tooltip: { _isEnabled: true, text: 'Return to previous location' } }
        }
      }
    ]
  });

  testSuccessWhere('v3.0.1 pageNav with custom tooltip text untouched', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '3.0.1' }],
    content: [
      {
        _id: 'c-101',
        _component: 'pageNav',
        _buttons: {
          _previous: { _isEnabled: true, _tooltip: { _isEnabled: true, text: 'Go back' } }
        }
      }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '3.1.10' }]
  });

  testStopWhere('no pageNav components', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '3.0.1' }],
    content: [{ _id: 'c-100', _component: 'text' }]
  });
});
