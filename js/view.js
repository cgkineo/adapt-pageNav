
define([
    'core/js/adapt',
    'core/js/views/componentView',
    './tooltip'
], function(Adapt, ComponentView, Tooltip) {

    function getAttributes($node){
        var attrs = {};
        _.each($node[0].attributes, function (attribute) {
            attrs[attribute.name] = attribute.value;
        });
        return attrs;
    }

    var View = ComponentView.extend({
       
        events: {
            "click button": "onButtonClick",
            "mouseover button": "onButtonTooltip"
        },

        preRender: function() {

            Adapt.trigger(this.constructor.type + 'View:preRender', this);

            this.$el.addClass("quicknav " + this.model.get('_id'));

            _.bindAll(this, "postRender", "checkButtonStates");

            this.setCompletionStatus();

            this.listenTo(Adapt, "remove", this.remove);
            this.listenTo(Adapt.contentObjects, {
                "change:_isComplete change:_isLocked": this.onContentObjectComplete
            });

        },

        render: function() {

            var template = Handlebars.templates["quicknav"];
            var data = this.model.getData();

            this.$el.html(template(data));

            Adapt.trigger(this.constructor.type + 'View:render', this);

            _.defer(this.postRender);

        },

        postRender: function() {

            Adapt.trigger(this.constructor.type + 'View:postRender', this);

            this.checkButtonStates();
            this.setReadyStatus();

        },

        onContentObjectComplete: function() {

            _.defer(this.checkButtonStates);

        },

        checkButtonStates: function() {

            this.$("button").each(_.bind(function(index, item) {
                this.checkButtonState(item);
            }, this));

        },

        checkButtonState: function(button) {

            var $button = $(button);
            var id = $button.attr("data-id");
            var index = $button.attr("data-item-index");

            if (!id) return;

            // get the button data
            var items = this.model.getNavigationData();
            var data = items[index];

            // rerender the button
            var $buttonRendered = $(Handlebars.partials['quicknav-item'](data));
            if ($buttonRendered.length === 0) {
                $button.remove();
                return;
            }

            // get button attribute names from current and rerendered
            var renderedAttrs = getAttributes($buttonRendered);
            var attrs = getAttributes($button);
            var renderedAttrNames = _.keys(renderedAttrs);
            var attrNames = _.keys(attrs);

            // remove redundant attributes
            var removeAttrNames = _.difference(attrNames, renderedAttrNames);
            removeAttrNames.forEach(function(name) {
                $button.removeAttr(name);
            });

            // update remaining attributes
            $button.attr(renderedAttrs);

            // update button text
            $button.html($buttonRendered.html());

        },

        onButtonClick: function(event) {

            var $target = $(event.currentTarget);
            var isLocked = $target.hasClass("locked");
            var isSelected = $target.hasClass("selected");

            if (isLocked || isSelected) return;

            var id = $target.attr("data-id");
            var index = $target.attr("data-item-index");

            switch (id) {
                case "":
                    var data = this.model.getData();
                    try {
                        var execute = new Function(data._items[index]._onClick||"");
                        execute();
                    } catch (err) {
                        Adapt.log.error(err);
                    }
                    break;
                default:
                    this.navigateTo(id);
                    break;
            }
        },

        onButtonTooltip: function(event) {

            var $target = $(event.currentTarget);
            var id = $target.attr("data-id");

            if (!id) {
                return;
            }

            // If tooltip isn't defined allow the event to propogate down to the document
            if (!$target.attr("tooltip")) {
                return;
            }

            // Don't allow event to propogate, to stop the document over events
            event.stopPropagation();

            // If this tooltip is already rendered then skip
            if (Adapt.tooltip) {

                var type = $target.attr("data-type");
                var index = $target.attr("data-index");
                var isCurrentTooltip = (Adapt.tooltip.type === type) && (Adapt.tooltip.index === index);

                if (isCurrentTooltip) {
                    return;
                }

            }

            var tooltip = new Tooltip({
                $target: $target,
                model: Adapt.findById(id)
            });

            this.$(".quicknav-inner").append(tooltip.$el);

        },

        navigateTo: function(id) {

            var isCourse = (id === Adapt.course.get("_id"));
            var hash = "#" + (isCourse ? "/" : "/id/" + id);

            Backbone.history.navigate(hash, { trigger:true, "replace": false });

        }

    });

    return View;

});
