import Adapt from 'core/js/adapt';
import router from 'core/js/router';
import ComponentView from 'core/js/views/componentView';
import tooltips from 'core/js/tooltips';

class PageNavView extends ComponentView {
  initialize() {
    _.bindAll(this, 'postRender', 'onButtonClick');

    super.initialize();
  }

  preRender() {
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

  onContentObjectComplete() {
    this.model.setupItemsModel();
  };

  onButtonClick(event) {
    const $target = $(event.currentTarget);
    const index = $target.data('item-index');
    const item = this.model.get('_items')[index];

    const isLocked = item._isHidden || item._isLocked;
    const isSelected = item._isCurrent;
    if (isLocked || isSelected) return;

    this.navigateTo(item._id);
  };

  setupTooltips() {
    const items = this.model.get('_items');
    items.forEach(item => {
      if (!item._tooltip || item._isHidden) return;

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
