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
    // _.defer(this.checkButtonStates);
  };

  onButtonClick(event) {
    const $target = $(event.currentTarget);
    const isLocked = $target.hasClass('is-locked');
    const isSelected = $target.hasClass('is-selected');

    if (isLocked || isSelected) return;

    const id = $target.data('id');
    this.navigateTo(id);
  };

  setupTooltips() {
    const items = this.model.get('_items');
    items.forEach(item => {
      if (!item._tooltip) { return; }

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
}

PageNavView.template = 'pageNav.jsx';

export default PageNavView;
