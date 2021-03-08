define([
  'core/js/adapt',
  'core/js/models/componentModel'
], function(Adapt, ComponentModel) {

  var Model = ComponentModel.extend({

    defaults: function() {

      return $.extend({}, _.result(ComponentModel.prototype, 'defaults'), {
        _isOptional: true,
        _isComplete: true,
        _isInteractionComplete: true,
        _pageLevelProgress: {
          _isEnabled: false
        }
      });

    },

    getNavigationData: function() {

      /*
      * Combine the config, model, order, index and type for each _buttons
      * Add each combined item to an array
      */

      var buttonTypeModels = {
        _returnToPreviousLocation: this.getReturnToPreviousLocation(),
        _page: this.getCurrentPage(),
        _up: this.getCurrentMenu(),
        _root: Adapt.course,
        _next: this.getNextPage(),
        _previous: this.getPrevPage(),
        _sibling: this.getSiblingPages(),
        _close: new Backbone.Model({
          _id: '',
          _onClick: 'top.window.close();'
        })
      };

      var data = [];
      var buttons = this.get('_buttons');

      if (!buttons) {
        return data;
      }

      var order = 0;
      var item;
      var currentPageComplete = buttonTypeModels._page.get('_isComplete');

      for (var attrName in buttons) {

        var buttonConfig = buttons[attrName];
        var buttonModel = buttonTypeModels[attrName];

        if (attrName === '_sibling') {

          // Skip if only one sibling
          if (buttonModel.length <= 1) continue;

          // Generate sibling entries
          _.each(buttonModel, function(model, index) {

            item = model.toJSON();
            _.extend(item, buttonConfig, {
              type: attrName,
              index: index,
              order: order++,
              locked: item._isLocked || (buttonConfig._lockUntilPageComplete && !currentPageComplete)
            });
            data.push(item);

          });

          continue;

        }

        // Find buttonModel from config._customRouteId if not found in defined type
        if (buttonConfig._customRouteId) buttonModel = Adapt.findById(buttonConfig._customRouteId);

        // Convert found buttonModel to json if exists or create an 'undefined' json
        item = buttonModel ? buttonModel.toJSON() : { '_isHidden': true };

        _.extend(item, buttonConfig, {
          type: attrName,
          index: 0,
          order: order++,
          locked: item._isLocked || (buttonConfig._lockUntilPageComplete && !currentPageComplete)
        });
        data.push(item);

      }

      // requires a stable sorting algorithm - native sorting in Chrome is unstable (should be stable from Chrome 70)
      var orderedData = _.sortBy(data, '_order');

      orderedData.forEach(function(item, index) {
        item._index = index;
      });

      return orderedData;

    },

    getReturnToPreviousLocation: function() {

      return Adapt.location._previousId ? Adapt.findById(Adapt.location._previousId) : null;

    },

    getCurrentPage: function() {

      var parents = this.getAncestorModels ? this.getAncestorModels() : this.getParents().models;
      for (var i = 0, l = parents.length; i < l; i++) {

        var model = parents[i];
        switch (model.get('_type')) {
          case 'page':
            return model;
        }

      }

    },

    getCurrentMenu: function() {

      var parents = this.getAncestorModels ? this.getAncestorModels() : this.getParents().models;
      for (var i = 0, l = parents.length; i < l; i++) {

        var model = parents[i];
        switch (model.get('_type')) {
          case 'menu':
          case 'course':
            return model;
        }

      }

    },

    getSiblingPages: function() {

      var currentMenu = this.getCurrentMenu();
      var siblingModels = currentMenu.getAllDescendantModels(true);

      siblingModels = _.filter(siblingModels, function(model) {
        return (model.get('_type') === 'page' && model.get('_isAvailable'));
      });

      return siblingModels;

    },

    getPrevPage: function() {

      var currentPage = this.getCurrentPage();
      var currentPageId = currentPage.get('_id');

      var pages = this.getPages();

      var hasFoundCurrentPage = false;
      for (var i = pages.length-1; i > -1; i--) {

        var page = pages[i];
        var isNotAvailable = !page.get('_isAvailable');
        if (isNotAvailable) continue;

        if (!hasFoundCurrentPage && page.get('_id') === currentPageId) {
          hasFoundCurrentPage = true;
          continue;
        }

        if (hasFoundCurrentPage) {
          return page;
        }

      }

      return;

    },

    getNextPage: function() {

      var currentPage = this.getCurrentPage();
      var currentPageId = currentPage.get('_id');

      var pages = this.getPages();

      var hasFoundCurrentPage = false;
      for (var i = 0, l = pages.length; i < l; i++) {

        var page = pages[i];
        var isNotAvailable = !page.get('_isAvailable');
        if (isNotAvailable) continue;

        if (!hasFoundCurrentPage && page.get('_id') === currentPageId) {
          hasFoundCurrentPage = true;
          continue;
        }

        if (hasFoundCurrentPage) {
          return page;
        }

      }

      return;

    },

    getPages: function() {

      var loopStyle = this.get('_loopStyle');

      if (!loopStyle) return [];

      var loop = false;
      var descendants;
      switch (loopStyle) {
        case 'allPages':
          loop = true;
          descendants = Adapt.course.getAllDescendantModels(true);
          break;
        case 'siblings':
          loop = true;
          /* falls through */
        default:
          var currentMenu = this.getCurrentMenu();
          descendants = currentMenu.getAllDescendantModels(true);
      }

      if (loop) {
        // Create a double copy to allow loop searching
        descendants = descendants.concat(descendants);
      }

      return _.filter(descendants, function(model) {
        return model.get('_type') === 'page';
      });

    }

  });

  return Model;

});
