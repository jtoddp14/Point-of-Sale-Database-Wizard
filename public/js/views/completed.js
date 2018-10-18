var CompletedView = Backbone.View.extend({
    events: {
        'click .save-button': 'saveChanges',
        'click .previous-button': 'openPreviousPage'
    },

    data: {},
    breadcrumb: {},
    updatedModel: {},
    adminUsers: 0,
    managerUsers: 0,
    serverUsers: 0,
    cashierUsers: 0,
    totalUsers: 0,
    productLines: 0,
    items: 0,

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
        this.getWizardData();
    },

    render: function () {    
        this.progressBars();

        App.setBreadcrumbs(this.breadcrumb);

        var that = this;
        this.$el.html(this.template({
            completed: this.model.toJSON(),
        }));

        $(document).ready(function () {
            that.$el.find('select').formSelect();
            $('.modal').modal();
        });

        $(document).on('keydown', 'input, select', function(e) {
            var self = $(this)
              , form = self.parents('form:eq(0)')
              , focusable
              , next
              ;
            if (e.keyCode == 13) {
                focusable = form.find('input,a,select,button,select').filter(':visible');
                next = focusable.eq(focusable.index(this)+1);
                if (next.length) {
                    next.focus();
                } else {
                    form.submit();
                }
                return false;
            }
        });
        return this;
    },
    
    getWizardData: function () {
        this.getCompanyInfo();
    },

    getCompanyInfo: function () {
        var that = this;
        var sessionToken = this.getCookie();
        
        $.ajax({
            url: '/data/get-company-info',
            data: {
                serialNumber: App.serialNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.companyInfo = data.companyDetails;
                var obj = JSON.parse(data.companyDetails);
                that.model.attributes.companyName = obj.companyName;
                that.model.attributes.address1 = obj.address1;
                that.model.attributes.city = obj.city;
                that.model.attributes.state = obj.state;
                that.model.attributes.zip = obj.zip;
                that.getRetailSettings();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                   
                }
            }
        });
    },

    getRetailSettings: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-retail-data',
            data: {
                serialNumber: App.serialNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.retail = data;
                var obj = JSON.parse(data.retailData);
                that.model.attributes.priceDecimalNumber = obj.priceDecimalNumber;
                that.model.attributes.quantityDecimalNumber = obj.quantityDecimalNumber;
                that.model.attributes.totalDecimalNumber = obj.totalDecimalNumber;
                that.getUsers();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem retrieving data from the server{/Literal}.' });
                }
            }
        });
    },

    getUsers: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-users',
            data: {
                serialNumber: App.serialNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                for (var i = 0; i < data.userData.length; i++) {
                    if (data.userData[i].userGroup.toUpperCase() == "ADMIN") {
                        that.adminUsers++;
                    }
                    else if (data.userData[i].userGroup.toUpperCase() == "MANAGER") {
                        that.managerUsers++;
                    }
                    else if (data.userData[i].userGroup.toUpperCase() == "CASHIER") {
                        that.cashierUsers++;
                    }
                    else if (data.userData[i].userGroup.toUpperCase() == "SERVER") {
                        that.serverUsers++;
                    }
                    that.totalUsers++;
                }
                that.model.attributes.admin = that.adminUsers;
                that.model.attributes.manager = that.managerUsers;
                that.model.attributes.cashier = that.cashierUsers;
                that.model.attributes.server = that.serverUsers;
                that.model.attributes.total = that.totalUsers;
                that.getReceiptSettingsData();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({
                        html: '{Literal}There was a problem fetching POS Users from the server{/Literal}'
                    });
                }
            }
        });
    },

    getReceiptSettingsData: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-receipt-details',
            data: {
                serialNumber: App.serialNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.receiptSettings = data;
                var obj = JSON.parse(data.receiptDetails);
                that.model.attributes.printLogo = obj.printLogo;
                that.model.attributes.printCustomerDetails = obj.printCustomerDetails;
                that.model.attributes.receiptMessage = obj.receiptMessage;
                that.model.attributes.savingsMessage = obj.savingsMessage;
                that.getProductLines();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem retrieving data from the server{/Literal}.' });
                }
            }
        });
    },

    getProductLines: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-productlines',
            data: {
                serialNumber: App.serialNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                for (var i = 0; i < data.productLines.length; i++) {
                    that.productLines++;
                }
                that.model.attributes.productLines = that.productLines; 

                that.getItems();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem fetching product lines from the server{/Literal}' });
                }
            }
        });
    },

    getItems: function () {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-items',
            data: {
                serialNumber: App.serialNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                for (var i = 0; i < data.items.length; i++) {
                    that.items++;
                }

                that.model.attributes.items = data.items.length; 
                that.render();
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({
                        html: '{Literal}There was a problem fetching data from the server{/Literal}'
                    });
                }
            }
        });
    },

    progressBars: function() {
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/get-navigation-data',
            data: {
                serialNumber: App.serialNumber,
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',
            success: function (data) {
                that.setNavigationClasses(data);
            },
            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                   
                }
            }
        });
    },

    setNavigationClasses: function (navBarInfo) {
        $('#password-gray').hide();
        $('#password-blue').hide();
        $('#password-green').show();
        $('#navBarPassword').css('color','#00a651')

        $('#complete-gray').hide();
        $('#complete-blue').hide();
        $('#complete-green').show();
        $('#navBarCompleted').css('color','#00a651')

        $('#retail-gray').hide();
        $('#retail-blue').hide();
        $('#retail-green').show();
        $('#navBarRetail').css('color','#00a651')
        
        $('#info-gray').hide();
        $('#info-blue').hide();
        $('#info-green').show();
        $('#navBarInfo').css('color','#00a651')

        $('#users-gray').hide();
        $('#users-blue').hide();
        $('#users-green').show();
        $('#navBarUsers').css('color','#00a651')

        $('#receipts-gray').hide();
        $('#receipts-blue').hide();
        $('#receipts-green').show();
        $('#navBarReceipts').css('color','#00a651')

        $('#items-gray').hide();
        $('#items-blue').hide();
        $('#items-green').show();
        $('#navBarProducts').css('color','#00a651')
    },

    getCookie: function() {
        var nameEQ = "sessionCookie" + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
    },

    openPreviousPage: function() {
        window.location.href = "#/items";
    }
});