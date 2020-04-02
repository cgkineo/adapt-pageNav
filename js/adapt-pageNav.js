define([
  'core/js/adapt',
  './model',
  './view'
], function(Adapt, Model, View) {

  return Adapt.register('pageNav', {
    model: Model,
    view: View
  });

});
