import { describe, whereFromPlugin, whereContent, mutateContent, checkContent, updatePlugin, getComponents, testSuccessWhere, testStopWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Page Nav - v1.0.7 to v1.1.0', async () => {
  whereFromPlugin('Page Nav - from v1.0.7', { name: 'adapt-pageNav', version: '<=1.0.7' });
  const ALL_BUTTON_KEYS = ['_returnToPreviousLocation', '_previous', '_root', '_up', '_next', '_close', '_sibling'];
  let pageNavs;

  whereContent('Page Nav - where pageNavs', async (content) => {
    pageNavs = getComponents('pageNav');
    return pageNavs.length;
  });

  mutateContent('Page Nav - add _lockUntilPageComplete to all buttons', async () => {
    pageNavs.forEach(pageNav => {
      ALL_BUTTON_KEYS.forEach(key => {
        if (_.has(pageNav._buttons, key)) {
          _.set(pageNav._buttons[key], '_lockUntilPageComplete', false);
        }
      });
    });
    return true;
  });

  checkContent('Page Nav - check _lockUntilPageComplete on all buttons', async () => {
    const isValid = pageNavs.every(pageNav =>
      ALL_BUTTON_KEYS.every(key => {
        return !_.has(pageNav._buttons, key) || _.has(pageNav._buttons[key], '_lockUntilPageComplete');
      })
    );
    if (!isValid) throw new Error('Page Nav - missing _lockUntilPageComplete on one or more buttons');
    return true;
  });

  updatePlugin('Page Nav - update to v1.1.0', { name: 'adapt-pageNav', version: '1.1.0', framework: '>=2.3.0' });

  testSuccessWhere('adapt-pageNav v1.0.0 structure', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '1.0.0' }],
    content: [
      {
        _id: 'c-100',
        _component: 'bottomnavigation',
        _buttons: {
          _previous: {
            _alignIconRight: false,
            _showTooltip: true,
            tooltip: 'Previous',
            _customRouteId: ''
          },
          _next: {
            _alignIconRight: true,
            _showTooltip: true,
            tooltip: 'Next',
            _customRouteId: ''
          },
          _close: {
            _alignIconRight: false,
            _showTooltip: false,
            tooltip: 'Close'
          },
          _sibling: {
            _alignIconRight: false,
            _showTooltip: true,
            tooltip: 'Page',
            _customRouteId: ''
          }
        }
      }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '1.1.0' }]
  });
});
