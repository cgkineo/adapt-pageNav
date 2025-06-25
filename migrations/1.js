import { describe, whereFromPlugin, whereContent, mutateContent, checkContent, updatePlugin, getComponents, testSuccessWhere, testStopWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Page Nav - v1.0.7 to v1.1.0', async () => {
  whereFromPlugin('Page Nav - from v1.0.7', { name: 'adapt-pageNav', version: '<=1.0.7' });
  const buttonKeys = ['_returnToPreviousLocation', '_root', '_up', '_close'];
  let pageNavs;

  whereContent('Page Nav - where pageNavs', async (content) => {
    pageNavs = getComponents('pageNav');
    return pageNavs.length;
  });

  mutateContent('Page Nav - add _lockUntilPageComplete to buttons', async () => {
    pageNavs.forEach(pageNav => {
      buttonKeys.forEach(key => {
        if (_.has(pageNav._buttons, key)) {
          _.set(pageNav._buttons[key], '_lockUntilPageComplete', false);
        }
      });
    });
    return true;
  });

  mutateContent('Page Nav - remove _customRouteId from _close', async () => {
    pageNavs.forEach(pageNav => {
      if (_.has(pageNav, '_buttons._close')) {
        _.unset(pageNav._buttons._close, '_customRouteId');
      }
    });
    return true;
  });

  checkContent('Page Nav - check _lockUntilPageComplete on buttons', async () => {
    const isValid = pageNavs.every(pageNav =>
      buttonKeys.every(key => {
        return !_.has(pageNav._buttons, key) || _.has(pageNav._buttons[key], '_lockUntilPageComplete');
      })
    );
    if (!isValid) throw new Error('Page Nav - missing _lockUntilPageComplete on one or more buttons');
    return true;
  });

  checkContent('Page Nav - check _customRouteId removed from _close', async () => {
    const isValid = pageNavs.every(pageNav => !_.has(pageNav, '_buttons._close._customRouteId'));
    if (!isValid) throw new Error('Page Nav - _customRouteId not removed from _close');
    return true;
  });

  updatePlugin('Page Nav - update to v1.1.0', { name: 'adapt-pageNav', version: '1.1.0', framework: '>=2.3.0' });

  testSuccessWhere('adapt-pageNav with all buttons', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '1.0.7' }],
    content: [
      { _id: 'c-100', _component: 'pageNav', _buttons: { _returnToPreviousLocation: {}, _root: {}, _up: {}, _close: { _customRouteId: 'foo' } } }
    ]
  });

  testSuccessWhere('adapt-pageNav with some buttons', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '1.0.7' }],
    content: [
      { _id: 'c-105', _component: 'pageNav', _buttons: { _root: {}, _close: {} } }
    ]
  });

  testSuccessWhere('adapt-pageNav with no _close', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '1.0.7' }],
    content: [
      { _id: 'c-110', _component: 'pageNav', _buttons: { _returnToPreviousLocation: {} } }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '1.1.0' }]
  });
});
