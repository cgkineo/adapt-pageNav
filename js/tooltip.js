define([
    'core/js/adapt'
], function(Adapt) {

    var Tooltip = Backbone.View.extend({
        
        className: "tooltip",

        initialize: function(options) {

            this.removeOtherTooltips();
            this.setupEventListeners();
            this.setupData(options);
            
            this.render();

        },

        removeOtherTooltips: function() {

            Adapt.trigger("tooltip:remove");
            Adapt.tooltip = this;

        },

        setupEventListeners: function() {

            _.bindAll(this, "remove", "postRender", "show");
            this.show = _.debounce(this.show, 17);

            $(document).on("mouseover", this.remove);

            this.listenTo(Adapt, {
                "device:resize": this.checkPosition,
                "tooltip:remove": this.remove,
                "remove": this.remove
            });

        },

        setupData: function(options) {

            this.$target = options.$target;
            this.id = this.$target.attr("data-id");
            this.type = this.$target.attr("data-type");
            this.index = this.$target.attr("data-index");

            this.model.set("tooltip", this.$target.attr("tooltip"));

        },

        render: function() {

            var template = Handlebars.templates["quicknav-tooltip"];

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

            var triangleMarginLeft = parseInt(this.$(".triangle").css("margin-left"));
            var triangleHalfWidth = (this.$(".triangle").outerWidth() / 2);
            var triangleOverhang = (triangleMarginLeft+triangleHalfWidth);

            var buttonHalfWidth = (this.$target.outerWidth(true) / 2);
            var buttonCenterLeft = (buttonPosition.left+buttonHalfWidth);
            var buttonAdjustedLeft = (buttonCenterLeft-triangleOverhang);

            var position = {
                "top": buttonPosition.top,
                "left": buttonAdjustedLeft,
                "right": this.$el.outerWidth() + buttonAdjustedLeft
            };

            var $offsetParent = this.$el.offsetParent();

            var parentLeft = $offsetParent.offset().left;
            var parentRight = parentLeft + $offsetParent.innerWidth();

            var overflowRight = position.right - parentRight;
            var overflowLeft = position.left - parentLeft;

            var isOverflowingRight = (position.right > parentRight);
            var isOverflowingLeft = (position.left <= parentLeft);
            
            var leftOffset = isOverflowingRight ? overflowRight : isOverflowingLeft ? overflowLeft : 0;
            
            this.$el.css({
                top: position.top,
                left: position.left - leftOffset - 1
            });

            this.$el.find(".triangle").css({
                left: leftOffset
            });

        },

        show: function() {

            if (this.isRemoved) return;

            this.$el.addClass("show");

        },

        remove: function() {

            this.isRemoved = true;

            delete this.$target;
            delete Adapt.tooltip;

            $(document).off("mouseover", this.onBodyMouseOver);
            Backbone.View.prototype.remove.call(this);

        }

    });

    return Tooltip;

});
