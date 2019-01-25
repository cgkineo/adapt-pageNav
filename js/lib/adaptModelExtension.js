define([
    'core/js/adapt',
    'core/js/models/adaptModel'
], function(Adapt, AdaptModel) {

    _.extend(AdaptModel.prototype, {
        
        /*
        * Fetchs the sub structure of an id as a flattened array
        *
        *   Such that the tree:
        *       { a1: { b1: [ c1, c2 ], b2: [ c3, c4 ] }, a2: { b3: [ c5, c6 ] } }
        *
        *   will become the array (parent first = false):
        *       [ c1, c2, b1, c3, c4, b2, a1, c5, c6, b3, a2 ]
        *
        *   or (parent first = true):
        *       [ a1, b1, c1, c2, b2, c3, c4, a2, b3, c5, c6 ]
        *
        * This is useful when sequential operations are performed on the page/article/block/component hierarchy.
        */
        getAllDescendantsQuickNav: function(parentFirst) {

            var descendants = [];

            if (this.get("_type") === "component") {
                descendants.push(this);
                return descendants;
            }

            var children = this.getChildren();

            for (var i = 0, l = children.models.length; i < l; i++) {

                var child = children.models[i];
                if (child.get("_type") === "component") {

                    descendants.push(child);
                    continue;

                }

                var subDescendants = child.getAllDescendantsQuickNav(parentFirst);
                if (parentFirst === true) {
                    descendants.push(child);
                }

                descendants = descendants.concat(subDescendants);
                
                if (parentFirst !== true) {
                    descendants.push(child);
                }

            }

            return descendants;

        }

    });

});
