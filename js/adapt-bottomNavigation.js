define([
  'core/js/adapt',
  './model',
  './view'
], function(Adapt, Model, View) {

  return Adapt.register('bottomNavigation', {
    model: Model,
    view: View
  });

});
