var ProductLine = Backbone.Model.extend({
    defaults: {
        id: 0,
        description: '',
        itemType : '',
        allowDiscount: true,
        isStock: false,
        isScalable: false,
        isSerialized: false,
        noPartialQuantity: false,
        isTaxable: false,
        menuPageName: '',
        HasChoices: false,
        cardStyleClass: 'ap-blue',
        isChanged: false
    }
});