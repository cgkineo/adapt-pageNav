import Adapt from 'core/js/adapt';
import router from 'core/js/router';
import ComponentView from 'core/js/views/componentView';

class PageNavView extends ComponentView {
  getAttributes($node) {
    const attrs = {};
    _.each($node[0].attributes, function (attribute) {
      attrs[attribute.name] = attribute.value;
    });
    return attrs;
  };

  // events: {
  //   'click .js-pagenav-btn': 'onButtonClick',
  //   'mouseover .js-pagenav-btn': 'onButtonTooltip'
  // },

  preRender() {
    this.$el.addClass('pagenav ' + this.model.get('_id'));

    _.bindAll(this, 'postRender', 'checkButtonStates');

    this.listenTo(Adapt, 'remove', this.remove);
    this.listenTo(Adapt.contentObjects, {
      'change:_isComplete change:_isLocked': this.onContentObjectComplete
    });
  };

  postRender() {
    this.checkButtonStates();
    this.setReadyStatus();
    this.setupInview();
  };

  setupInview() {
    const selector = this.getInviewElementSelector();

    if (!selector) return this.setCompletionStatus();

    this.setupInviewCompletion(selector);
  };

  /**
  * determines which element should be used for inview logic - body, instruction, title or widget - and returns the selector for that element
  */
  getInviewElementSelector() {
    if (this.model.get('body')) return '.component__body';
    if (this.model.get('instruction')) return '.component__instruction';
    if (this.model.get('displayTitle')) return '.component__title';
    if (this.model.get('_buttons')) return '.component__widget';

    return null;
  };

  onContentObjectComplete() {
    _.defer(this.checkButtonStates);
  };

  checkButtonStates() {
    this.$('button').each(function(index, item) {
      this.checkButtonState(item);
    }.bind(this));
  };

  checkButtonState(button) {
    const $button = $(button);
    const id = $button.attr('data-id');
    const index = $button.attr('data-item-index');

    if (!id) return;

    // get the button data
    // const items = this.model.getNavigationData();
    // const data = items[index];

    // rerender the button
    // const $buttonRendered = $(Handlebars.partials['pageNav-item'](data));
    // if ($buttonRendered.length === 0) {
    //   $button.remove();
    //   return;
    // }

    // get button attribute names from current and rerendered
    // const renderedAttrs = this.getAttributes($buttonRendered);
    // const attrs = this.getAttributes($button);
    // const renderedAttrNames = _.keys(renderedAttrs);
    // const attrNames = _.keys(attrs);

    // // remove redundant attributes
    // const removeAttrNames = _.difference(attrNames, renderedAttrNames);
    // removeAttrNames.forEach(function(name) {
    //   $button.removeAttr(name);
    // });

    // // update remaining attributes
    // $button.attr(renderedAttrs);

    // // update button text
    // $button.html($buttonRendered.html());
  };

  onButtonClick(event) {
    const $target = $(event.currentTarget);
    const isLocked = $target.hasClass('is-locked');
    const isSelected = $target.hasClass('is-selected');

    if (isLocked || isSelected) return;

    const id = $target.attr('data-id');
    const index = $target.attr('data-item-index');
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

  // onButtonTooltip(event) {
  //   const $target = $(event.currentTarget);

  //   const id = $target.attr('data-id') || this.model.getCurrentPage().get('_id');

  //   if (!id) {
  //     return;
  //   }

  //   // If tooltip isn't defined allow the event to propogate down to the document
  //   if (!$target.attr('data-tooltip')) {
  //     return;
  //   }

  //   // Don't allow event to propogate, to stop the document over events
  //   event.stopPropagation();

  //   // If this tooltip is already rendered then skip
  //   if (Adapt.tooltip) {

  //     const type = $target.attr('data-type');
  //     const index = $target.attr('data-index');
  //     const isCurrentTooltip = (Adapt.tooltip.type === type) && (Adapt.tooltip.index === index);

  //     if (isCurrentTooltip) {
  //       return;
  //     }

  //   }

  //   const tooltip = new Tooltip({
  //     $target,
  //     model: Adapt.findById(id)
  //   });

  //   this.$('.pagenav__tooltip-container').append(tooltip.$el);

  // };

  navigateTo(id) {
    // const isCourse = (id === Adapt.course.get('_id'));
    // const hash = '#' + (isCourse ? '/' : '/id/' + id);

    // Backbone.history.navigate(hash, { trigger: true, replace: false });
    router.navigateToElement(id);
  };
}

PageNavView.template = 'pageNav.jsx';

export default PageNavView;
