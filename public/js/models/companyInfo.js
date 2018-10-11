var CompanyInfo = Backbone.Model.extend({
    defaults: {
        companyName: '',
        address1: '',
        address2: '',
        salesType: 'Retail',
        city: '',
        state: '',
        zip: '',
        country: '',
        language: '',
        taxType: ''
    }
});