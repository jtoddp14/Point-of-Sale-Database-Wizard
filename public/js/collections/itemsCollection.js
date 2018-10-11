var ItemsCollection = Backbone.Collection.extend({
    model: Items,
    
    byItemId: function (id) {
        filtered = this.filter(function (items) {
            return items.get("itemCode").toUpperCase() === id.toUpperCase();
        });
        return new ItemsCollection(filtered);
    },

    byItemDescription: function (description) {
        filtered = this.filter(function (items) {

            return items.get("description").toUpperCase() === description.toUpperCase();
        });

        return new ItemsCollection(filtered);
    },

    byProductLine: function (prouctLine) {
        filtered = this.filter(function (items) {
            return items.get("prouctLine").toUpperCase() === prouctLine.toUpperCase();
        });
        return new ItemsCollection(filtered);
    },
    
    byPrice: function (price) {
        filtered = this.filter(function (items) {
            return items.get("price").toString() == price;
        });
        return new ItemsCollection(filtered);
    }
});