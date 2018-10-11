var CompanyInfoView = Backbone.View.extend({
    events: {
        'click .company-info-button': 'companyInfo',
        'click .company-info-arrow-button': 'companyInfo',
        'click .save-button': 'saveChanges'
    },

    data: {},
    breadcrumb: {},
    updatedModel: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.model = options.model;
        this.hasAccounting = options.hasAccounting;
        this.taxCodes = [];
        this.getData();
    },

    render: function () {  
        this.$el.html(this.template({
            companyInfo: this.model.toJSON(),
        }));

        App.setBreadcrumbs(this.breadcrumb);

        var that = this;
        $(document).ready(function () {
            that.$el.find(".company-info-button").trigger("click");
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

    getData: function() {
        this.getNavigationData();
        this.getCompanyInfoData();
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

    getNavigationData: function () {
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

        $('#info-gray').hide();
        $('#info-blue').show();
        $('#info-green').hide();
        $('#navBarInfo').css('color','#3970b7')

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

        if (navBarInfo.navigationData.itemsCompleted == true && navBarInfo.navigationData.receiptsCompleted == true && navBarInfo.navigationData.usersCompleted == true) {
            if (navBarInfo.navigationData.retailCompleted == true && navBarInfo.navigationData.companyDataCompleted == true) {
                $('#complete-gray').hide();
                $('#complete-blue').hide();
                $('#complete-green').show();
                $('#navBarCompleted').css('color','#00a651')
            }
        }
    },

    getCompanyInfoData: function () {
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
                var obj = (data.companyDetails);
                that.model.set(obj);
                that.render();
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

    renderModel: function () {
        this.$el.html(this.template({
            companyInfo: this.model.toJSON(),
        }));
    },

    companyInfo: function () {
        $('.company-info-button').hide();
        $('#company_info').show();  
        this.$el.find('#company-info-form').show();
    },

    validateForm: function () {
        var valid = true;

        var validateCompanyName = this.$el.find("#companyName").val();
        if (validateCompanyName.trim().length < 1) {
            this.$el.find("#companyName").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateCompanyName.length; i++) {
                if (iChars.indexOf(validateCompanyName.charAt(i)) != -1) {
                    this.$el.find("#companyName").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        var validateAddress1 = this.$el.find("#address1").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>/?*\\\'\"";
        for (var i = 0; i < validateAddress1.length; i++) {
            if (iChars.indexOf(validateAddress1.charAt(i)) != -1) {
                this.$el.find("#address1").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateCity= this.$el.find("#city").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateCity.length; i++) {
            if (iChars.indexOf(validateCity.charAt(i)) != -1) {
                this.$el.find("#city").addClass("invalid");
                valid = false;
                break;
            }
        }

        var validateState = this.$el.find("#state").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
        for (var i = 0; i < validateState.length; i++) {
            if (iChars.indexOf(validateState.charAt(i)) != -1) {
                this.$el.find("#state").addClass("invalid");
                valid = false;
                break;
            }
        }

        return valid;
    },

    getFormValues: function () {
        var that = this;
        var companyName =  that.$el.find('#companyName').val();
        var country = null;
        var language = null;
        var taxType =  null;
        var address1 = that.$el.find('#address1').val();
        var address2 = null;
        var city = that.$el.find('#city').val();
        var state = that.$el.find('#state').val();
        var zip = that.$el.find('#zip').val();
        var id = that.$el.find('#id').val();
        var salesType = that.$el.find('#business-type-dropdown option:selected').text();

        var updatedModel = {
            companyName: companyName,
            country: country,
            language: language,
            taxType: taxType,
            address1: address1,
            address2: address2,
            city: city,
            state: state,
            zip: zip,
            salesType: salesType,
            id: id
        }

        that.updatedModel = updatedModel;
    },

    saveChanges: function () {
        var companyInfo;
        var that = this;
        var validation = this.validateForm();
        if (validation) {
            this.getFormValues();
            var sessionToken = this.getCookie();
            var companyDetails = JSON.stringify(that.updatedModel);
            
            $.ajax({
                url: '/data/save-company-info',
                data: {
                    token: sessionToken,
                    serialNumber: App.serialNumber, 
                    companyDetails: companyDetails
                },
                dataType: 'json',
                type: 'POST',
                
                success: function (data) {
                    App.newCompany = false;
                    $('#info-blue').hide();
                    $('#info-green').show();
                    window.location.href = "#/retail";
                },

                error: function (e) {
                    M.toast({ html: '{Literal}There was a problem saving company information settings{/Literal}.' });
                }
            });
        } else {
            M.toast({html: '{Literal}Some of the required fields are missing or invalid{/Literal}'});
        }
    }
});
