import Adapt from 'core/js/adapt';
import location from 'core/js/location';
import data from 'core/js/data';
import ComponentModel from 'core/js/models/componentModel';

class PageNavModel extends ComponentModel {
  init() {
    this.listenTo(Adapt, 'router:location', this.setupItemsModel);

    super.init();
  };

  setupItemsModel() {
    this.set('_items', this.getNavigationData());
  }

  /**
   * Combines the config, model, order, index and type for each _buttons item
   *
   * @returns {array} An array of combined button items
   */
  getNavigationData() {
    const buttons = this.get('_buttons');
    if (!buttons) return [];

    const buttonTypeModels = this.getButtonTypeModels();
    const currentPageComplete = buttonTypeModels._page.get('_isComplete');
    const unsortedItems = [];
    let order = 0;
    let item;

    for (const type in buttons) {
      const buttonConfig = buttons[type];

      // Skip the button if not enabled
      if (!buttonConfig._isEnabled) continue;

      // Get models, skipping any undefined types (ex. deprecated button types)
      let buttonModel = buttonTypeModels[type];
      if (!buttonModel) continue;

      // Find buttonModel from config._customRouteId if not found in defined type
      if (buttonConfig._customRouteId) {
        buttonModel = data.findById(buttonConfig._customRouteId);
      }

      // Convert found buttonModel to json if exists or create an 'undefined' json
      item = buttonModel ? buttonModel.toJSON() : { _isHidden: true };

      Object.assign(item, buttonConfig, {
        type,
        index: 0,
        order: order++,
        _tooltipId: `pagenav_btn${type}`,
        locked: item._isLocked || (buttonConfig._lockUntilPageComplete && !currentPageComplete)
      });
      unsortedItems.push(item);
    }

    // requires a stable sorting algorithm - native sorting in Chrome is unstable (should be stable from Chrome 70)
    const sortedItems = _.sortBy(unsortedItems, '_order');

    sortedItems.forEach((item, index) => {
      item._index = index;
    });

    return sortedItems;
  };

  getButtonTypeModels() {
    return {
      _page: this.getCurrentPage(),
      _up: this.getCurrentMenu(),
      _returnToPreviousLocation: this.getReturnToPreviousLocation(),
      _root: Adapt.course,
      _next: this.getNextPage(),
      _previous: this.getPrevPage(),
      _close: this.getClose()
    };
  }

  getReturnToPreviousLocation() {
    if (!location._previousId) return;

    return data.findById(location._previousId);
  };

  getCurrentPage() {
    return location._currentModel;
  };

  getCurrentMenu() {
    return this.findAncestor('menu');
  };

  getPrevPage() {
    const currentPage = this.getCurrentPage();
    const currentPageId = currentPage.get('_id');
    const pages = this.getPages();
    let hasFoundCurrentPage = false;

    for (const page of pages.reverse()) {
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

    for (const page of pages) {
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
    return new Backbone.Model({ _id: '' });
  };
}

export default PageNavModel;
