var ReceiptSettingsView = Backbone.View.extend({
    events: {
        'click .receipt-settings-button': 'receiptSettings',
        'click .proceed-button': 'saveChanges',
        'click .previous-button': 'returnToPreviousPage',
        'click #sku': 'showSkuNumber',
        'click #printLogo': 'showCompanyLogo',
        'click #printCompanyDetails': 'showCompanyDetails',
        'change #currencyDecimal' : 'changeCurrencyDecimal', 
        'change #qtyDecimal' : 'changeQtyDecimal',
        'change #dateTimeFormat' : 'changeDateTimeFormat',
        'keyup #customMessage' : 'changeReceiptMessage',
        'keyup #savingsMessage' : 'changeSavingsMessage',
    },

    data: {},
    breadcrumb: {},
    updatedModel: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
        this.taxCodes = [];
        this.getReceiptSettingsData();
    },

    render: function () {    
        this.progressBars();

        this.$el.html(this.template({
            receiptSettings: this.model.toJSON(),
        }));
        
        App.setBreadcrumbs(this.breadcrumb);

        var that = this;
        $(document).ready(function () {
            that.$el.find(".receipt-settings-button").trigger("click");
            that.$el.find('select').formSelect();
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

        $('#receipts-gray').hide();
        $('#receipts-blue').show();
        $('#receipts-green').hide();
        $('#navBarReceipts').css('color','#3970b7')

        if (navBarInfo.navigationData.companyDataCompleted == true) {
            $('#info-gray').hide();
            $('#info-blue').hide();
            $('#info-green').show();
            $('#navBarInfo').css('color','#00a651')
        }
        else {
            $('#info-gray').show();
            $('#info-blue').hide();
            $('#info-green').hide();
            $('#navBarInfo').css('color','gray')
        }

        if (navBarInfo.navigationData.retailCompleted == true) {
            $('#retail-gray').hide();
            $('#retail-blue').hide();
            $('#retail-green').show();
            $('#navBarRetail').css('color','#00a651')
        }
        else {
            $('#retail-gray').show();
            $('#retail-blue').hide();
            $('#retail-green').hide();
            $('#navBarRetail').css('color','gray')
        }

        if (navBarInfo.navigationData.usersCompleted == true) {
            $('#users-gray').hide();
            $('#users-blue').hide();
            $('#users-green').show();
            $('#navBarUsers').css('color','#00a651')
        }
        else {
            $('#users-gray').show();
            $('#users-blue').hide();
            $('#users-green').hide();
            $('#navBarUsers').css('color','gray')
        }

        if (navBarInfo.navigationData.itemsCompleted == true) {
            $('#items-gray').hide();
            $('#items-blue').hide();
            $('#items-green').show();
            $('#navBarProducts').css('color','#00a651')
        }
        else {
            $('#items-gray').show();
            $('#items-blue').hide();
            $('#items-green').hide();
            $('#navBarProducts').css('color','gray')  
        }
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
                that.model.set(obj);
                that.render();
                that.getRetailSettings();
                
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
                var obj = JSON.parse(data.retailData);
                that.model.attributes.quantityDecimalNumber = obj.quantityDecimalNumber;
                that.model.attributes.currencyDecimalNumber = obj.priceDecimalNumber;
                that.changeModelSettings();
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

    changeModelSettings: function () {
        if (this.model.attributes.printItemSku) {
            document.getElementById("showSku").style.display="inline-block"
            document.getElementById("hideSku").style.display="none"
        }

        if (this.model.attributes.printLogo) {
            document.getElementById("previewLogo").style.display="block"
        }

        if (this.model.attributes.printCustomerDetails) {
            document.getElementById("companyInfo").style.display="inline-block"
        }

        if (this.model.attributes.dateTimeFormat == "MM/dd/yy HH:mm") {
            document.getElementById("dateTime1").style.display="none";
            document.getElementById("dateTime2").style.display="inline-block";
        }

        if (this.model.attributes.receiptMessage.length > 0) {
            var messageInput = document.getElementById("customMessage").value;
            document.getElementById('divReceiptMessage').innerHTML = messageInput;
        }

        if (this.model.attributes.savingsMessage.length > 0) {
            var messageInput = document.getElementById("savingsMessage").value;
            document.getElementById('divSavingsMessage').innerHTML = messageInput;
        }

        if (this.model.attributes.currencyDecimalNumber == "3") {
            document.getElementById("divPrice1").style.display="none";
            document.getElementById("qtyPrice1").style.display="none";
            document.getElementById("subTotal1").style.display="none";
            document.getElementById("tax1").style.display="none";

            document.getElementById("divPrice2").style.display="inline-block";
            document.getElementById("qtyPrice2").style.display="inline-block";
            document.getElementById("subTotal2").style.display="inline-block";
            document.getElementById("tax2").style.display="inline-block";
            document.getElementById("total2").style.display="inline-block";
        }
        else if (this.model.attributes.currencyDecimalNumber == "4") {
            document.getElementById("divPrice1").style.display="none";
            document.getElementById("qtyPrice1").style.display="none";
            document.getElementById("subTotal1").style.display="none";
            document.getElementById("tax1").style.display="none";
            
            document.getElementById("divPrice3").style.display="inline-block";
            document.getElementById("qtyPrice3").style.display="inline-block";
            document.getElementById("subTotal3").style.display="inline-block";
            document.getElementById("tax3").style.display="inline-block";
            document.getElementById("total3").style.display="inline-block";
        }

        if (this.model.attributes.quantityDecimalNumber == "2") {
            document.getElementById("qty1").style.display="none";
            document.getElementById("qty2").style.display="inline-block";
        }
        else if (this.model.attributes.quantityDecimalNumber == "3") {
            document.getElementById("qty1").style.display="none";
            document.getElementById("qty3").style.display="inline-block";
        }
        else if (this.model.attributes.quantityDecimalNumber == "4") {
            document.getElementById("qty1").style.display="none";
            document.getElementById("qty4").style.display="inline-block";
        }
    },

    receiptSettings: function () {
        $('.receipt-settings-button').hide();
        $('#receipt_settings').show();  
        this.$el.find('#receipt-settings-form').show();
    },
    
    showSkuNumber: function () {
        if (this.$el.find('#sku:checked').length > 0) {
            document.getElementById("showSku").style.display="inline-block"
            document.getElementById("hideSku").style.display="none"
        }
        else {
            document.getElementById("showSku").style.display="none"
            document.getElementById("hideSku").style.display="inline-block"
        }
    },

    showCompanyLogo: function (){
        if (this.$el.find('#printLogo:checked').length > 0) {
            document.getElementById("previewLogo").style.display="block"
        }
        else {
            document.getElementById("previewLogo").style.display="none"
        }
    },

    showCompanyDetails: function (){
        if (this.$el.find('#printCompanyDetails:checked').length > 0) {
            document.getElementById("companyInfo").style.display="inline-block"
        }
        else {
            document.getElementById("companyInfo").style.display="none"
        }
    },

    changeDateTimeFormat: function () {
        var dateTimeFormat = this.$el.find('#dateTimeFormat option:selected').val();
        if (dateTimeFormat == "MM-dd-yy HH:mm") {
            document.getElementById("dateTime2").style.display="none";
            document.getElementById("dateTime1").style.display="inline-block";
        }
        else {
            document.getElementById("dateTime1").style.display="none";
            document.getElementById("dateTime2").style.display="inline-block";
        }
    },

    changeReceiptMessage: function (e) {
        var messageInput = document.getElementById("customMessage").value;
        document.getElementById('divReceiptMessage').innerHTML = messageInput;
    },

    changeSavingsMessage: function (){
        var messageInput = document.getElementById("savingsMessage").value;
        document.getElementById('divSavingsMessage').innerHTML = messageInput;
    },


    getFormValues: function () {
        var that = this;
        var printSku = this.$el.find('#sku:checked').length > 0;
        var printLogo = this.$el.find('#printLogo:checked').length > 0;
        var printCustomerDetails = this.$el.find('#printCompanyDetails:checked').length > 0;
        var dateTimeFormat = this.$el.find('#dateTimeFormat option:selected').val();
        var receiptMessage = document.getElementById("customMessage").value;
        var savingsMessage = document.getElementById("savingsMessage").value;

        var updatedModel = {
            printSku: printSku,
            printLogo: printLogo,
            printCustomerDetails: printCustomerDetails,
            currencyDecimalNumber: this.model.attributes.currencyDecimalNumber,
            quantityDecimalNumber: this.model.attributes.quantityDecimalNumber,
            dateTimeFormat: dateTimeFormat,
            receiptMessage: receiptMessage,
            savingsMessage: savingsMessage,
        }

        that.updatedModel = updatedModel;
    },

    returnToPreviousPage: function () {
        window.location.href = "#/pos-users";
    },

    saveChanges: function () {
        var companyInfo;
        var that = this;
        this.getFormValues();
        var validation = true;
        if (validation) {
            var sessionToken = this.getCookie();
            var receiptDetails = JSON.stringify(that.updatedModel);
            $.ajax({
                url: '/data/save-receipt-details',
                data: {
                    token: sessionToken,
                    serialNumber: App.serialNumber, 
                    receiptDetails: receiptDetails
                },
                dataType: 'json',
                type: 'POST',
                
                success: function (data) {
                    App.newReceipt = false;
                    $('#navBar5').css('color','#00a651')
                    window.location.href = "#/product-lines";
                },

                error: function (e) {
                    M.toast({ html: '{Literal}There was a problem saving receipt settings{/Literal}.' });
                }
            });
        } else {
            M.toast({html: '{Literal}Some of the required fields are missing or invalid{/Literal}'});
        }
    }
});
