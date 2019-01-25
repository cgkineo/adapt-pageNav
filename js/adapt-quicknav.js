define([
    'core/js/adapt',
    './model',
    './view',
    './lib/adaptModelExtension'
], function(Adapt, Model, View) {
    
    return Adapt.register("quicknav", {
        model: Model,
        view: View
    });

});