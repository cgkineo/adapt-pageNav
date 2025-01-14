import Adapt from 'core/js/adapt';
import router from 'core/js/router';
import ComponentView from 'core/js/views/componentView';
import tooltips from 'core/js/tooltips';
import logging from 'core/js/logging';

class PageNavView extends ComponentView {
  initialize() {
    _.bindAll(this, 'postRender', 'onButtonClick');

    super.initialize();
  }

  preRender() {
    this.model.setupItemsModel();
    this.listenTo(Adapt, 'remove', this.remove);
    this.listenTo(Adapt.contentObjects, {
      'change:_isComplete change:_isLocked': this.onContentObjectComplete
    });
  };

  postRender() {
    this.setReadyStatus();
    this.setupInviewCompletion();
    this.setupTooltips();
  };

  onInview(event, visible, visiblePartX, visiblePartY) {
    if (!visible) return;
    if (visiblePartY === 'top') this.hasSeenTop = true;
    if (!this.hasSeenTop) return;

    this.inviewCallback();

    if (!this.model.get('_isComplete')) return;
    this.removeInviewListener();
  }

  onContentObjectComplete() {
    // Update model so that _lockUntilPageComplete works properly
    this.model.setupItemsModel();
  };

  onButtonClick(event) {
    const $target = $(event.currentTarget);
    const index = $target.data('item-index');
    const item = this.model.get('_items')[index];
    const type = item.type;

    // Close button
    if (type === '_close') {
      this.closeWindow();
      return;
    }

    if (item._isLocked) return;

    this.navigateTo(item._id);
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

  setupTooltips() {
    const items = this.model.get('_items');
    items.forEach(item => {
      if (!item._tooltip) return;

      tooltips.register({
        _id: item._tooltipId,
        _isEnabled: item._tooltip._isEnabled,
        text: Handlebars.compile(item._tooltip.text)(item)
      });
    });
  };

  navigateTo(id) {
    router.navigateToElement(id);
  };

  static get template() {
    return 'pageNav.jsx';
  }
}

export default PageNavView;
