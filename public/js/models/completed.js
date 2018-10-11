var Completed = Backbone.Model.extend({
    defaults: {
        companyName: '',
        address1: '',
        city: '',
        state: '',
        zip: '',

        priceDecimalNumber: '',
        quantityDecimalNumber: '',
        totalDecimalNumber: '',

        admin: '',
        manager: '',
        supervisor: '',
        cashier: '',
        total: '',
        
        printLogo: false,
        printCustomerDetails: false,
        receiptMessage: '',
        savingsMessage: '',

        productLines: '',
        items: ''
    }
});