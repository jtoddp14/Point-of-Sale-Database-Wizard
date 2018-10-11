var POSUser = Backbone.Model.extend({
    defaults: {
        id: null,
        passcode: '',
        till: null,
        isServer: false,
        isDriver: false,
        idleTimeout: 0,
        password: '',
        isChanged: false,
        isRemoved: false,
        userGroup: ''
    }
});