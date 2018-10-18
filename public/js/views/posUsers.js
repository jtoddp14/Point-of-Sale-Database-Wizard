var POSUsersView = Backbone.View.extend({
    fullCollection: {},
    userGroups: {},
    tills: {},
    formModal: null,
    adminUsers: 0,
    managerUsers: 0,
    serverUsers: 0,
    cashierUsers: 0,
    isEdited: false,

    events: {
        'click .card-panel-entity': 'highlightCard',
        'click .edit-pos-user-trigger': 'editPosUser',
        'click #add-user-button': 'addPosUser',
        'click .save-button': 'savePosUser',
        'click .delete-button': 'deletionModal',
        'click #delete-pos-user-confirm': 'deletePosUser',
        'click .previous-button': 'openPreviousPage',
        'click .edit-manager-trigger': 'openManagerModal',
        'click .add-manager-button' : 'addPosUser',
        'click .cancel-manager-button' : 'closeManagerModal',
        'click .edit-admin-trigger': 'openAdminModal',
        'click .add-admin-button' : 'addPosUser',
        'click .cancel-admin-button' : 'closeAdminModal',
        'click .edit-server-trigger': 'openServerModal',
        'click .add-server-button' : 'addPosUser',
        'click .cancel-server-button' : 'closeServerModal',
        'click .edit-cashier-trigger': 'openCashierModal',
        'click .add-cashier-button' : 'addPosUser',
        'click .cancel-cashier-button' : 'closeCashierModal',
        'click .proceed-button' : 'proceedToNextPage'
    },

    breadcrumb: {},

    styles: [
        'ap-teal-light',
        'ap-blue',
        'ap-light-purple'
    ],

    userGroupStyleMapping: {},

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.posUserFormTemplate = options.posUserFormTemplate;
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.initCollection();
    },

    render: function () {
        var that = this;
        this.progressBars();

        this.$el.html(this.template({
            posUsers: that.collection.toJSON(),
            adminUsers: that.adminUsers,
            managerUsers: that.managerUsers,
            serverUsers: that.serverUsers,
            cashierUsers: that.cashierUsers
        })); 

        App.setBreadcrumbs(this.breadcrumb);

        $(document).ready(function () {
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

        $('.tooltipped').tooltip();

        this.formModal = this.$el.find('#pos-user-form-modal').modal();

        return this;
    },

    initCollection: function () {
        this.getUsers();
    },

    openManagerModal: function () {
        $('#manager-modal').show();
    },

    closeManagerModal: function () {
        $('#manager-modal').hide();
    },

    openAdminModal: function () {
        $('#admin-modal').show();
    },

    closeAdminModal: function () {
        $('#admin-modal').hide();
    },

    openServerModal: function () {
        $('#server-modal').show();
    },

    closeServerModal: function () {
        $('#server-modal').hide();
    },

    openCashierModal: function () {
        $('#cashier-modal').show();
    },

    closeCashierModal: function () {
        $('#cashier-modal').hide();
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

        $('#users-gray').hide();
        $('#users-blue').show();
        $('#users-green').hide();
        $('#navBarUsers').css('color','#3970b7')

        
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

    openPreviousPage: function () {
        window.location.href = "#/retail";
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
                }
                that.renderPOSUsers(data.userData);
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

    renderPOSUsers: function (data) {
        var that = this;
    
        data.sort(function (a, b) {
            if (a.name != null && a.name != 'undefined') {
                return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0);
            }
            else {
                return '';
            }
        });

        var collection = new POSUserCollection();
        for (var i = 0; i < data.length; i++) {
            var currentPOSUser = data[i];
            currentPOSUser.cardStyleClass = that.userGroupStyleMapping[data[i].group];
            collection.add(new POSUser(currentPOSUser));
        }
        
        that.collection.reset(collection.models);
        that.fullCollection = collection;

    },

    editPosUser: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var userId = $(element).attr('data-id');
        for (var i = 0; i < this.collection.models.length; i++) {
            if (this.collection.models[i].attributes.id == userId) {
                var user = this.collection.models[i];
            }
        }
        user.attributes.isChanged = true;
        this.posUserFormView = new POSUserFormView({
            template: this.posUserFormTemplate,
            model: user
        });
        
        this.isEdited = true;

        this.$el.find('#pos-user-form-modal').html(this.posUserFormView.render().el);
        this.$el.find('select').formSelect();
        this.formModal = this.$el.find('#pos-user-form-modal').modal();
        this.formModal.modal('open');
    },

    addPosUser: function (e) {
        var user = new POSUser();
        user.attributes.userGroup = e.target.dataset.id;
        this.posUserFormView = new POSUserFormView({
            template: this.posUserFormTemplate,
            model: user
        });

        this.$el.find('#pos-user-form-modal').html(this.posUserFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  

        this.isEdited = false;

        this.formModal = this.$el.find('#pos-user-form-modal').modal();
        this.formModal.modal('open');
    },

    highlightCard: function (e) {
        this.$el.find('.edit').hide();
        this.$el.find('.card-panel-entity').removeClass('active');
        var element = $(e.currentTarget);
        var selected = $(element).attr('data-selected') === '1';
        
        if (selected) {
            $(element).removeAttr('data-selected');
            $(element).removeClass('active');
            $(element).find('.edit').hide();
        } else {
            $(element).removeAttr('data-selected');
            $(element).attr('data-selected', '1');
            $(element).find('.edit').show();
            $(element).addClass('active');
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

    validateForm: function () {
        var valid = true;

        var validateUsername = this.$el.find("#username").val();
        if (validateUsername.trim().length < 1) {
            this.$el.find("#username").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < validateUsername.length; i++) {
                if (iChars.indexOf(validateUsername.charAt(i)) != -1) {
                    this.$el.find("#username").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }

        var validatePassword = this.$el.find("#password-reset").val();
        var iChars = "`~!@#$%^&*()_+=[]{}:,<>./*\\\'\"";
        if (validatePassword.trim().length < 1) {
            this.$el.find("#password-reset").addClass("invalid");
            valid = false;
        }
        else if (valid) {
            for (var i = 0; i < validatePassword.length; i++) {
                if (iChars.indexOf(validatePassword.charAt(i)) != -1) {
                    this.$el.find("#password-reset").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }
        else {
            var passwordKeys = [];
            for (var i=0; i < this.collection.models.length; i++)
            {
                passwordKeys.push(this.collection.models[i].attributes.passcode);
            };
        
            for (var i = 0; i < passwordKeys.length; i++) {
                if (validatePassword == passwordKeys[i])
                {
                    valid = false;
                    M.toast({ html: '{Literal}Two users cannot have the same password{/Literal}' });
                    break;
                }
            };
        }

        return valid;
    },

    getFormValues: function () {
        var that = this;
        var username = this.$el.find('#username').val();
        var id = this.$el.find('#id').val();
        var logOutTime = this.$el.find('#idle-timeout-form-dropdown option:selected').val();
        var autoTill = this.$el.find('#auto-till-form-dropdown option:selected').text();
        var passcode = this.$el.find('#password-reset').val();
        var server = this.$el.find('#server:checked').length > 0
        var driver = this.$el.find('#driver:checked').length > 0
        if (passcode.startsWith(";") && passcode.endsWith("?")) {
            passcode = passcode.substring(1, passcode.length()-1);
        }
        var userGroup = this.$el.find('#userGroup').val();

        var updatedModel = {
            id: id,
            name: username,
            idleTimeout: logOutTime,
            till: autoTill,
            passcode: passcode,
            isServer: server,
            isDriver: driver,
            userGroup: userGroup,
            isChanged: true
        }

        this.editedCollecton = new POSUserCollection();
        this.posUserFormView.model.set(updatedModel);
        this.editedCollecton.add(this.posUserFormView.model); 
    },


    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var posUserId = $(element).attr('data-id');
        $("#data-pos-user-id").val(posUserId);
        $('#delete-pos-user-modal').modal().modal('open');
    },

    deletePosUser: function(e) {
        var element = $(e.currentTarget);
        var posUserId = (this.posUserFormView.model.attributes.id);
        var posUserGroup = (this.posUserFormView.model.attributes.userGroup);
        this.posUserFormView.model.attributes.isRemoved = true;
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/save-users',
            data: {
                serialNumber: App.serialNumber,
                userData: JSON.stringify(that.collection.toJSON()),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {

            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
            }
        });

        if (posUserGroup.toUpperCase() == "ADMIN") {
            that.adminUsers--;
        }
        else if (posUserGroup.toUpperCase() == "MANAGER") {
            that.managerUsers--;
        }
        else if (posUserGroup.toUpperCase() == "CASHIER") {
            that.cashierUsers--;
        }
        else if (posUserGroup.toUpperCase() == "SERVER") {
            that.serverUsers--;
        }

        that.collection.remove(posUserId);
        M.toast({ html: '{Literal}POS User Deleted successfully{/Literal}!' });
        this.render();
    },

    savePosUser: function (){
        var posUser;
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;
        var sessionToken = this.getCookie();
        if(validation) {
            this.getFormValues();

            newModel = (that.posUserFormView.model);

            if (!this.isEdited) {
                if (newModel.attributes.userGroup.toUpperCase() == "ADMIN") {
                    that.adminUsers++;
                }
                else if (newModel.attributes.userGroup.toUpperCase() == "MANAGER") {
                    that.managerUsers++;
                }
                else if (newModel.attributes.userGroup.toUpperCase() == "CASHIER") {
                    that.cashierUsers++;
                }
                else if (newModel.attributes.userGroup.toUpperCase() == "SERVER") {
                    that.serverUsers++;
                }
            }
            else {
                this.isEdited = false;
            }

            if (newModel.attributes.id == '') {
                newModel.attributes.id = Math.floor(Math.random() * 10000) + 1;
            }
            updateCollection.add(newModel);
            $.ajax({
                url: '/data/save-users',
                data: {
                    serialNumber: App.serialNumber,
                    userData: JSON.stringify(updateCollection.toJSON()),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    M.toast({ html: 'POS User updated successfully!' });
                },
    
                error: function (e) {
                    if (e.status == 523) {
                        window.location.href = "#/log-in";
                        location.reload();
                    }
                    else {
                        M.toast({ html: '{Literal}There was a problem saving POS Users please try again later{/Literal}.' });
                    }
                }
            });
           
            App.newUser = false;
            
            
            if (newModel.attributes.userGroup.toUpperCase() == "ADMIN") {
                console.log("Hello");
                $('#admin-modal').show();   
            }
            else if (newModel.attributes.userGroup.toUpperCase() == "MANAGER") {
                $('#manager-modal').show(); 
            }
            else if (newModel.attributes.userGroup.toUpperCase() == "CASHIER") {
                $('#cashier-modal').show(); 
            }
            else if (newModel.attributes.userGroup.toUpperCase() == "SERVER") {
                $('#server-modal').show(); 
            }
        }
    },

    proceedToNextPage: function (){
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/save-users',
            data: {
                serialNumber: App.serialNumber,
                userData: JSON.stringify(that.collection.toJSON()),
                token: sessionToken
            },
            dataType: 'json',
            type: 'POST',

            success: function (data) {
                if (data.status == "Success") {
                    $('#users-gray').hide();
                    $('#users-blue').hide();
                    $('#users-green').show();
                    window.location.href = "#/receipt-settings";
                }
            },

            error: function (e) {
                if (e.status == 523) {
                    window.location.href = "#/log-in";
                    location.reload();
                }
                else {
                    M.toast({ html: '{Literal}There was a problem saving POS Users please try again later{/Literal}.' });
                }
            }
        });
    }
});