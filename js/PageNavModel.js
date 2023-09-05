import Adapt from 'core/js/adapt';
import location from 'core/js/location';
import data from 'core/js/data';
import logging from 'core/js/logging';
import ComponentModel from 'core/js/models/componentModel';

class PageNavModel extends ComponentModel {
  init() {
    this.listenTo(Adapt, 'router:location', this.setupItemsModel);

    super.init();
  };

  setupItemsModel() {
    this.set('_items', this.getNavigationData());
  }

  getNavigationData() {
    const buttons = this.get('_buttons');
    if (!buttons) { return []; }

    /*
      Combine the config, model, order, index and type for each _buttons
      Add each combined item to an array
    */
    const buttonTypeModels = {
      _returnToPreviousLocation: this.getReturnToPreviousLocation(),
      _page: this.getCurrentPage(),
      _up: this.getCurrentMenu(),
      _root: Adapt.course,
      _next: this.getNextPage(),
      _previous: this.getPrevPage(),
      _sibling: this.getSiblingPages(),
      _close: this.getClose()
    };

    const currentPageComplete = buttonTypeModels._page.get('_isComplete');

    const unsortedItems = [];
    let order = 0;
    let item;

    for (const attrName in buttons) {
      const buttonConfig = buttons[attrName];
      let buttonModel = buttonTypeModels[attrName];

      if (attrName === '_sibling') {
        // Skip if only one sibling
        if (buttonModel.length <= 1) continue;

        // Generate sibling entries
        buttonModel.forEach((model, index) => {
          item = model.toJSON();
          _.extend(item, buttonConfig, {
            type: attrName,
            index,
            _isCurrent: item._id === location._currentId,
            order: order++,
            locked: item._isLocked || (buttonConfig._lockUntilPageComplete && !currentPageComplete)
          });
          unsortedItems.push(item);
        });

        continue;
      }

      // Find buttonModel from config._customRouteId if not found in defined type
      if (buttonConfig._customRouteId) {
        buttonModel = data.findById(buttonConfig._customRouteId);
      }

      // Convert found buttonModel to json if exists or create an 'undefined' json
      item = buttonModel ? buttonModel.toJSON() : { _isHidden: true };

      _.extend(item, buttonConfig, {
        type: attrName,
        index: 0,
        order: order++,
        locked: item._isLocked || (buttonConfig._lockUntilPageComplete && !currentPageComplete)
      });
      unsortedItems.push(item);
    }

    // requires a stable sorting algorithm - native sorting in Chrome is unstable (should be stable from Chrome 70)
    const sortedItems = _.sortBy(unsortedItems, '_order');

    sortedItems.forEach(function(item, index) {
      item._index = index;
    });

    return sortedItems;
  };

  getReturnToPreviousLocation() {
    if (!location._previousId) { return; }

    return data.findById(location._previousId);
  };

  getCurrentPage() {
    const currentModel = location._currentModel;
    if (!currentModel.get('_type') === 'page') return;

    return currentModel;
  };

  getCurrentMenu() {
    const parents = this.getAncestorModels ? this.getAncestorModels() : this.getParents().models;

    for (let i = 0, l = parents.length; i < l; i++) {
      const model = parents[i];
      switch (model.get('_type')) {
        case 'menu':
        case 'course':
          return model;
      }
    }
  };

  getSiblingPages() {
    const currentMenu = this.getCurrentMenu();
    const siblingModels = currentMenu.getAllDescendantModels(true);

    return siblingModels.filter(model => {
      const isAvailablePage = model.get('_type') === 'page' && model.get('_isAvailable');
      const notOptionalOrNotSkipped = !this.get('_shouldSkipOptionalPages') || !model.get('_isOptional');

      return isAvailablePage && notOptionalOrNotSkipped;
    });
  };

  getPrevPage() {
    const currentPage = this.getCurrentPage();
    const currentPageId = currentPage.get('_id');
    const pages = this.getPages();
    let hasFoundCurrentPage = false;

    for (let i = pages.length - 1; i > -1; i--) {
      const page = pages[i];
      const isNotAvailable = !page.get('_isAvailable');
      if (isNotAvailable) continue;

      if (!hasFoundCurrentPage) {
        hasFoundCurrentPage = page.get('_id') === currentPageId;
        continue;
      }

      if (!this.get('_shouldSkipOptionalPages') || !page.get('_isOptional')) {
        return page;
      }
    }
  };

  getNextPage() {
    const currentPage = this.getCurrentPage();
    const currentPageId = currentPage.get('_id');
    const pages = this.getPages();

    let hasFoundCurrentPage = false;
    for (let i = 0, l = pages.length; i < l; i++) {
      const page = pages[i];
      const isNotAvailable = !page.get('_isAvailable');
      if (isNotAvailable) continue;

      if (!hasFoundCurrentPage) {
        hasFoundCurrentPage = page.get('_id') === currentPageId;
        continue;
      }

      if (!this.get('_shouldSkipOptionalPages') || !page.get('_isOptional')) {
        return page;
      }
    }
  };

  getPages() {
    const loopStyle = this.get('_loopStyle');
    if (!loopStyle) return [];

    let loop = false;
    let descendants;
    let currentMenu;

    switch (loopStyle) {
      case 'allPages':
        loop = true;
        descendants = Adapt.course.getAllDescendantModels(true);
        break;
      case 'siblings':
        loop = true;
        // falls through
      default:
        currentMenu = this.getCurrentMenu();
        descendants = currentMenu.getAllDescendantModels(true);
    }

    if (loop) {
      // Create a double copy to allow loop searching
      descendants = descendants.concat(descendants);
    }

    return descendants.filter(model => {
      return model.get('_type') === 'page';
    });
  };

  getClose() {
    return new Backbone.Model({
      _id: '',
      _onClick: this.closeWindow()
    });
  };

  closeWindow() {
    try {
      const scormWrapper = require('extensions/adapt-contrib-spoor/js/scorm/wrapper');
      if (scormWrapper) {
        const scormWrapperInstance = scormWrapper.getInstance();
        if (scormWrapperInstance.lmsConnected && !scormWrapperInstance.finishCalled) {
          scormWrapperInstance.finish();
        }
      }
    } catch (err) {
      logging.warn(`Could not close window. Error: ${err}`);
    }
    top.window.close();
  };

}

export default PageNavModel;
