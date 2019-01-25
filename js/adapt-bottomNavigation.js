define([
    'core/js/adapt',
    './model',
    './view',
    'handlebars'
], function(Adapt, Model, View, Handlebars) {

    if (!Handlebars.helpers.any) {
        // Polyfill for older frameworks.
        /**
         * Equivalent to:
         *  if (conditionA || conditionB)
         * @example
         * {{#any displayTitle body instruction}}
         * <div class="component__header {{_component}}__header"></div>
         * {{/any}}
         */
        Handlebars.registerHelper('any', function() {
            var args = Array.prototype.slice.call(arguments, 0, -1);
            var block = Array.prototype.slice.call(arguments, -1)[0];

            return _.any(args) ? block.fn(this) : block.inverse(this);
        });
    }

    return Adapt.register("bottomNavigation", {
        model: Model,
        view: View
    });

});