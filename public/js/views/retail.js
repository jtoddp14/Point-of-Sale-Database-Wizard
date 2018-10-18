var RetailView = Backbone.View.extend({
    events: {
        'click .save-button': 'saveChanges',
        'click .previous-button': 'openPreviousPage'
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
        this.getRetailSettings();
    },

    render: function () {    
        this.progressBars();

        App.setBreadcrumbs(this.breadcrumb);

        var that = this;
        this.$el.html(this.template({
            retail: this.model.toJSON(),
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
                that.model.set(obj);
                that.render();
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

        $('#retail-gray').hide();
        $('#retail-blue').show();
        $('#retail-green').hide();
        $('#navBarRetail').css('color','#3970b7')
        
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

        if (navBarInfo.navigationData.receiptsCompleted == true) {
            $('#receipts-gray').hide();
            $('#receipts-blue').hide();
            $('#receipts-green').show();
            $('#navBarReceipts').css('color','#00a651')
        }
        else {
            $('#receipts-gray').show();
            $('#receipts-blue').hide();
            $('#receipts-green').hide();
            $('#navBarReceipts').css('color','gray')
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

    getData: function() {
        this.getRetailData();
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

    getRetailData: function () {
        var that = this;
        var sessionToken = this.getCookie();
    },

    validateForm: function () {
        var valid = true;

        var validatePriceDecimal = this.$el.find("#priceDecimal").val();
        if (validatePriceDecimal == '') {
            M.toast({ html: '{Literal}Please choose a valid price decimal{/Literal}.' });
            valid = false;
        }

        var validateQtyDecimal = this.$el.find("#qtyDecimal").val();
        if (validateQtyDecimal == '') {
            M.toast({ html: '{Literal}Please choose a valid quantity decimal{/Literal}.' });
            valid = false;
        }

        var validateTotalDecimal = this.$el.find("#totalDecimal").val();
        if (validateTotalDecimal == '') {
            M.toast({ html: '{Literal}Please choose a valid total decimal{/Literal}.' });
            valid = false;
        }

        return valid;
    },

    getFormValues: function () {
        var that = this;

        var salesReps = that.$el.find('#salesReps:checked').length > 0;
        var priceDecimal = that.$el.find('#priceDecimal option:selected').text();
        var quantityDecimal = that.$el.find('#qtyDecimal option:selected').text();
        var totalDecimal = that.$el.find('#totalDecimal option:selected').text();

        var updatedModel = {
            showItemId: '',
            priceDecimalNumber: priceDecimal,
            quantityDecimalNumber: quantityDecimal,
            totalDecimalNumber: totalDecimal,
            showOriginalPrice: '',
            hasSalesReps: salesReps,
            completed: true
        }

        that.updatedModel = updatedModel;
    },

    openPreviousPage: function() {
        window.location.href = "#/company-info";
    },

    saveChanges: function () {
        var retail;
        var that = this;
        var validation = this.validateForm();
        if (validation) {
            this.getFormValues();
            var sessionToken = this.getCookie();
            var retailData = JSON.stringify(that.updatedModel);
            $.ajax({
                url: '/data/save-retail-data',
                data: {
                    token: sessionToken,
                    serialNumber: App.serialNumber,
                    retailData: retailData
                },
                dataType: 'json',
                type: 'POST',
                
                success: function (data) {
                    $('#retail-blue').hide();
                    $('#retail-green').show();
                    window.location.href = "#/pos-users";
                },

                error: function (e) {
                    M.toast({ html: '{Literal}There was a problem saving retail settings{/Literal}.' });
                }
            });
        } else {
            M.toast({html: '{Literal}Some of the required fields are missing or invalid{Literal}'});
        }
    }
});