var ReceiptSettings = Backbone.Model.extend({
    defaults: {
        printItemSku: false,
        printLogo: false,
        printCustomerDetails: false,
        currencyDecimalNumber: 2,
        quantityDecimalNumber: 1,
        dateTimeFormat: "MM-dd-yy HH:mm",
        receiptMessage: '',
        savingsMessage: ''
    }
});
