import { describe, whereContent, whereFromPlugin, mutateContent, checkContent, updatePlugin, getCourse, getComponents, testSuccessWhere, testStopWhere } from 'adapt-migrations';
import _ from 'lodash';

describe('Page Nav - v2.0.5 to v2.1.1', async () => {
  let pageNavs;

  whereFromPlugin('Page Nav - from <v2.1.1', { name: 'adapt-pageNav', version: '<2.1.1' });

  whereContent('Page Nav - where pageNavs', async () => {
    pageNavs = getComponents('pageNav');
    return pageNavs.length;
  });

  mutateContent('Page Nav - add _shouldSkipOptionalPages', async () => {
    pageNavs.forEach(pageNav => {
      if (_.has(pageNav, '_shouldSkipOptionalPages')) return;
      pageNav._shouldSkipOptionalPages = false;
    });
    return true;
  });

  checkContent('Page Nav - check _shouldSkipOptionalPages added', async () => {
    const isValid = pageNavs.every(pageNav => _.has(pageNav, '_shouldSkipOptionalPages'));
    if (!isValid) throw new Error('Page Nav - _shouldSkipOptionalPages not added');
    return true;
  });

  updatePlugin('Page Nav - update to v2.1.1', { name: 'adapt-pageNav', version: '2.1.1', framework: '>=5.2' });

  testSuccessWhere('v2.0.5 pageNav missing _shouldSkipOptionalPages', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.0.5' }],
    content: [
      {
        _id: 'c-100',
        _component: 'pageNav',
        _buttons: {
          _previous: { _isEnabled: true },
          _next: { _isEnabled: true }
        }
      }
    ]
  });

  testSuccessWhere('v2.0.5 pageNav already has _shouldSkipOptionalPages', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.0.5' }],
    content: [
      {
        _id: 'c-100',
        _component: 'pageNav',
        _shouldSkipOptionalPages: false,
        _buttons: {
          _previous: { _isEnabled: true },
          _next: { _isEnabled: true }
        }
      }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.1.1' }]
  });

  testStopWhere('no pageNav components', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.0.5' }],
    content: [{ _id: 'c-100', _component: 'text' }]
  });
});

describe('Page Nav - v2.1.2 to v2.2.0', async () => {
  let course;
  const ariaRegionPath = '_globals._pageNav.ariaRegion';

  whereFromPlugin('Page Nav - from <v2.2.0', { name: 'adapt-pageNav', version: '<2.2.0' });

  whereContent('Page Nav - where missing _globals ariaRegion', async () => {
    course = getCourse();
    return !_.has(course, ariaRegionPath);
  });

  mutateContent('Page Nav - add _globals._pageNav.ariaRegion', async () => {
    _.set(course, ariaRegionPath, 'Course navigation.');
    return true;
  });

  checkContent('Page Nav - check _globals._pageNav.ariaRegion added', async () => {
    const isValid = _.has(course, ariaRegionPath);
    if (!isValid) throw new Error('Page Nav - _globals._pageNav.ariaRegion not added');
    return true;
  });

  updatePlugin('Page Nav - update to v2.2.0', { name: 'adapt-pageNav', version: '2.2.0', framework: '>=5.2' });

  testSuccessWhere('correct version with empty course', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.1.2' }],
    content: [{ _type: 'course' }]
  });

  testSuccessWhere('correct version with course globals present', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.1.2' }],
    content: [
      {
        _type: 'course',
        _globals: { _pageNav: {} }
      }
    ]
  });

  testStopWhere('incorrect version', {
    fromPlugins: [{ name: 'adapt-pageNav', version: '2.2.0' }]
  });
});
