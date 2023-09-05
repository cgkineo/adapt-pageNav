import Adapt from 'core/js/adapt';
import router from 'core/js/router';
import ComponentView from 'core/js/views/componentView';
import tooltips from 'core/js/tooltips';

class PageNavView extends ComponentView {
  initialize() {
    _.bindAll(this, 'postRender', 'onButtonClick');

    // this.setupTooltips();

    super.initialize();
  }

  preRender() {
    this.listenTo(Adapt, 'remove', this.remove);
    this.listenTo(Adapt.contentObjects, {
      'change:_isComplete change:_isLocked': this.onContentObjectComplete
    });

    this.$el.addClass(`pagenav ${this.model.get('_id')}`);
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

    const id = $target.attr('data-id');
    // const index = $target.attr('data-item-index');
    let items;

    switch (id) {
      case '':
        items = this.model.getNavigationData();
        // try {
        //   const execute = new Function(items[index]._onClick||'');
        //   execute();
        // } catch (err) {
        //   Adapt.log.error(err);
        // }
        break;
      default:
        this.navigateTo(id);
    }
  };

  setupTooltips() {
    const items = this.model.get('_items');
    items.forEach(item => {
      if (!item._tooltip) { return; }

      tooltips.register({
        _id: 'pagenav_btn' + item.type,
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
