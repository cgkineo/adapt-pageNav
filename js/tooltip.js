define([
  'core/js/adapt'
], function(Adapt) {

  var Tooltip = Backbone.View.extend({

    className: 'pagenav__tooltip',

    initialize: function(options) {

      this.removeOtherTooltips();
      this.setupEventListeners();
      this.setupData(options);

      this.render();

    },

    removeOtherTooltips: function() {

      Adapt.trigger('tooltip:remove');
      Adapt.tooltip = this;

    },

    setupEventListeners: function() {

      _.bindAll(this, 'remove', 'postRender', 'show');
      this.show = _.debounce(this.show, 17);

      $(document).on('mouseover', this.remove);

      this.listenTo(Adapt, {
        'device:resize': this.checkPosition,
        'tooltip:remove': this.remove,
        remove: this.remove
      });

    },

    setupData: function(options) {

      this.$target = options.$target;
      this.id = this.$target.attr('data-id');
      this.type = this.$target.attr('data-type');
      this.index = this.$target.attr('data-index');

      this.model.set('tooltip', this.$target.attr('tooltip'));

    },

    render: function() {

      var template = Handlebars.templates['pageNav-tooltip'];

      this.$el.html(template(this.model.toJSON()));
      _.defer(this.postRender);

    },

    postRender: function() {

      if (this.isRemoved) return;

      this.checkPosition();
      this.show();

    },

    checkPosition: function() {

      if (this.isRemoved) return;

      var buttonPosition = this.$target.position();
      var buttonWidth = this.$target.outerWidth(true);
      var buttonHalfWidth = (buttonWidth / 2);
      var buttonCenterLeft = (buttonPosition.left+buttonHalfWidth);

      var tooltipWidth = this.$el.outerWidth(true);
      var tooltipHalfWidth = tooltipWidth / 2;

      var tooltipCenter = {
        top: buttonPosition.top,
        left: buttonCenterLeft
      };

      var $offsetParent = this.$el.offsetParent();
      var parentWidth = $offsetParent.innerWidth();

      var overflowRight = parentWidth - (tooltipCenter.left + tooltipHalfWidth);
      var overflowLeft = tooltipCenter.left - tooltipHalfWidth;

      var isOverflowingRight = (overflowRight < 0);
      var isOverflowingLeft = (overflowLeft < 0);

      var leftOffset = isOverflowingRight ? overflowRight : isOverflowingLeft ? -overflowLeft : 0;

      this.$el.css({
        top: tooltipCenter.top,
        left: tooltipCenter.left + leftOffset
      });

      this.$el.find('.pagenav__triangle').css({
        left: tooltipHalfWidth - leftOffset
      });

    },

    show: function() {

      if (this.isRemoved) return;

      this.$el.addClass('show');

    },

    remove: function() {

      this.isRemoved = true;

      delete this.$target;
      delete Adapt.tooltip;

      $(document).off('mouseover', this.onBodyMouseOver);
      Backbone.View.prototype.remove.call(this);

    }

  });

  return Tooltip;

});
