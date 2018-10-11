var ProductLinesCollection = Backbone.Collection.extend({
    model: ProductLine,

    byItemType: function (itemType) {
        filtered = this.filter(function (productLine) {
            return productLine.get("type") === itemType;
        });
        return new ProductLinesCollection(filtered);
    }
});