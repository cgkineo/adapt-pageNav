define([
    'core/js/adapt',
    './model',
    './view',
    './lib/adaptModelExtension'
], function(Adapt, Model, View) {

    return Adapt.register("bottomnavigation", {
        model: Model,
        view: View
    });

});