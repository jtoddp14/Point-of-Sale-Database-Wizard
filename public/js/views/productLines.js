var ProductLinesView = Backbone.View.extend({
    itemTypes: [],
    menuPages: [],
    fullCollection: {},
    deletionModal: {},

    events: {
        'click .card-panel-entity': 'highlightCard',
        'change #item-type-filter': 'filterCards',
        'click .delete-button': 'deletionModal',
        'click #delete-product-line-confirm': 'deleteProductLine',
        'click .edit-product-line-trigger': 'populateEditFormValues',
        'click .save-button': 'saveProductLine',
        'click .add-product-line': 'addProductLine',
        'keyup #description' : 'validateForm',
        'click .save-item-type-button' : 'chooseNewItemType',
        'click .save-menu-page-button' : 'chooseNewMenuPage',
        'click .previous-button' : 'returnToPreviousPage',
        'click .proceed-button' : 'saveChanges'
    },

    breadcrumb: {},

    typeStyleMapping: {},

    styles: [
        'ap-blue'
    ],

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.breadcrumb = options.breadcrumb;
        this.collection = options.collection;
        this.israCardBuild = options.israCardBuild;
        this.productLineFormTemplate = options.productLineFormTemplate;
        this.listenTo(this.collection, 'reset', this.render);
        this.listenTo(this.collection, 'remove', this.render);
        this.listenTo(this.collection, 'add', this.render);
        this.initProductLines();
    },

    render: function () {
        var that = this;
        this.progressBars();
        this.$el.html(this.template({ 
            productLines: this.collection.toJSON(),
            menuPages: this.menuPages,
            itemTypes: this.itemTypes
        }));

        App.setBreadcrumbs(this.breadcrumb);
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
        this.renderItemTypesFilter();
        this.deletionModal = $(".modal").modal();
        this.formModal = this.$el.find('#product-line-form-modal').modal();
        $('select').formSelect();

        return this;
    },

    returnToPreviousPage: function () {
        window.location.href = "#/receipt-settings";
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

        $('#items-gray').hide();
        $('#items-blue').show();
        $('#items-green').hide();
        $('#navBarProducts').css('color','#3970b7')
        
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
    },

    getFormValues: function () {
        var description = this.$el.find('#description').val();
        var itemType = this.$el.find('#item-type option:selected').text();
        var menuPageName = this.$el.find('#menu-page option:selected').text();
        if (itemType == "Create New Item Type") {
            itemType = "None"
        }
        if (menuPageName == "Create New Menu Page") {
            menuPageName = "None"
        }
        var taxable = this.$el.find('#taxable:checked').length > 0;
        var allowDiscounts = this.$el.find('#allow-discounts:checked').length > 0;
        var scalable = this.$el.find('#scale:checked').length > 0;
        var stockable = this.$el.find('#isStock:checked').length > 0;
        var serializable = this.$el.find('#serialized:checked').length > 0;
        var partial = this.$el.find('#noPartialQuantity:checked').length > 0;
        var id = this.productLineFormView.model.attributes.id;
        var HasChoices = this.$el.find('#choices:checked').length > 0;

        var updatedModel = {
            description: description,
            itemType: itemType,
            menuPageName: menuPageName,
            allowDiscount: allowDiscounts,
            isScalable: scalable,
            isStock: stockable,
            isSerialized: serializable,
            noPartialQuantity: partial,
            isTaxable: taxable,
            HasChoices: HasChoices,
            id: id
        };


        this.productLineFormView.model.set(updatedModel);
        return updatedModel;
    },

    saveProductLine: function () {
        var that = this;
        var validation = this.validateForm();
        var updateCollection = that.collection;

        if (validation) {
            var formValues = this.getFormValues();
            newModel = (that.productLineFormView.model);
            if (newModel.attributes.id == '') {
                newModel.attributes.id = Math.floor(Math.random() * 10000) + 1;
            }
            newModel.attributes.isChanged = true;
            updateCollection.add(newModel);

            M.toast({ html: 'Product Line updated successfully!' });

            updateCollection.add(that.productLineFormView.model);
            
            that.render();
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

    renderItemTypesFilter: function () {
        this.itemTypes.sort();
        
        for (var i = 0; i < this.itemTypes.length; i++) {
            $("#item-type-filter").append(
                $('<option></option>').attr("value", this.itemTypes[i]).text(this.itemTypes[i])
            );
        }
        $("#item-type-filter").formSelect();
    },

    initProductLines: function () {
        this.getProductLines();
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
                for (var i=0; i < data.productLines.length; i++) {
                    that.menuPages.push(data.productLines[i].menuPageName);
                    that.itemTypes.push(data.productLines[i].itemType);
                }
                that.renderProductLines(data.productLines);
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

    renderProductLines: function (data) {
        this.generateTypeStyleMapping(data);
        var collection = new ProductLinesCollection();
        for (var i = 0; i < data.length; i++) {
            var currentProductLineData = data[i];
            currentProductLineData.cardStyleClass = this.typeStyleMapping[currentProductLineData.type];
            collection.add(new ProductLine(currentProductLineData));
        }
        this.collection.reset(collection.models);
        this.fullCollection = collection;
    },

    generateTypeStyleMapping: function (data) {
        var types = [];
        var totalStyles = this.styles.length;
        var currentStyle = 0;
        this.itemTypes = [];
        for (var i = 0; i < data.length; i++) {
            if (types.indexOf(data[i].itemType) < 0) {
                this.itemTypes.push(data[i].itemType);
                types.push(data[i].itemType);        
                this.typeStyleMapping[data[i].itemType] = this.styles[currentStyle];
                if (currentStyle < totalStyles - 1) {
                    currentStyle++;
                } else {
                    currentStyle = 0;
                }
            }
        }
    },

    validateForm: function () {
        var valid = true;
        var productLineDescription = this.$el.find('#description').val();
        if (productLineDescription.trim().length < 1) {
            this.$el.find("#description").addClass("invalid");
            valid = false;
        }
        else {
            var iChars = "`~!@#$%^&*()_+=[]{}:;,<>./?*\\\'\"";
            for (var i = 0; i < productLineDescription.length; i++) {
                if (iChars.indexOf(productLineDescription.charAt(i)) != -1) {
                    this.$el.find("#description").addClass("invalid");
                    valid = false;
                    break;
                }
            }
        }
        
        return valid;
    },

    populateEditFormValues: function (e) {

        var element = $(e.currentTarget);
        var id = $(element).attr('data-id');
        var productLines = this.collection.get(id);

        if (this.collection.get(id) !== null && this.collection.get(id) !== '') {
            this.productLineFormView = new ProductLineFormView({
                template: this.productLineFormTemplate,
                model: productLines,
                itemTypes: this.itemTypes,
                menuPages: this.menuPages,
            });

            this.$el.find('#product-line-form-modal').html(this.productLineFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal.modal('open');
        }
        
        else {
            M.toast({ html: '{Literal}There was a problem fetching data from the server{/Literal}' });
        }   
    },

    addProductLine: function (e) {
        var productLines = new ProductLine();
        this.productLineFormView = new ProductLineFormView({
            template: this.productLineFormTemplate,
            model: productLines,
            itemTypes: this.itemTypes,
            menuPages: this.menuPages,
        });

        this.$el.find('#product-line-form-modal').html(this.productLineFormView.render().el);
        this.$el.find('select').formSelect();
        this.$el.find("select[required]").css({
            display: "block", 
            position: 'absolute',
            visibility: 'hidden'
        });  
        this.formModal.modal('open');
    },

    filterCards: function (e) {
        var element = $(e.currentTarget);
        var selectedItemType = $(element).val();
        if (selectedItemType === '*') {
            this.collection.reset(this.fullCollection.models);
            $("#item-type-filter option").first().attr('selected', '');
        } else {
            var filtered = this.fullCollection.byItemType(selectedItemType);
            this.collection.reset(filtered.models);
            $("#item-type-filter option[value=" + selectedItemType + "]").attr('selected', '');
        }
        
        $("select").formSelect();
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

    deletionModal: function (e) {
        var that = this;
        var element = $(e.currentTarget);
        var productLineId = $(element).attr('data-id');
        $('#delete-product-line-modal').modal().modal('open');
    },

    deleteProductLine: function(e) {
        var element = $(e.currentTarget);
        var productLineId = (this.productLineFormView.model.attributes.id);
        this.productLineFormView.model.attributes.isRemoved = true;
        var that = this;
        var sessionToken = this.getCookie();
        $.ajax({
            url: '/data/save-productlines',
            data: {
                serialNumber: App.serialNumber,
                productlines: JSON.stringify(that.collection.toJSON()),
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

        that.collection.remove(productLineId);
        M.toast({ html: '{Literal}Product Line Deleted successfully{/Literal}!' });
        this.render();
    },

    chooseNewMenuPage: function () {
        var menuPageName = this.$el.find('#menuPageName').val();
        that = this;
        var isTaken = false;

        if (menuPageName != '' && menuPageName != undefined && menuPageName != null) {
            for (var i in that.menuPages) {
                if (that.menuPages[i] === menuPageName) {
                    isTaken = true;
                    break;
                }
            }

            if (isTaken) {
                M.toast({ html: '{Literal}This Menu Page is already defined{/Literal}' });
            }
            else {
                that.menuPages.push(menuPageName);  
                this.reopenModal();
            }
        }
        else {
            M.toast({ html: '{Literal}Please enter a valid Menu Page name{/Literal}' });
        }
    },

    chooseNewItemType: function () {
        var itemType = this.$el.find('#itemTypeName').val();
        that = this;
        var isTaken = false;
        if (itemType != '' && itemType != undefined && itemType != null) {
            for (var i in that.itemTypes) {
                if (that.itemTypes[i].name === itemType) {
                    isTaken = true;
                    break;
                }
            }

            if (isTaken) {
                M.toast({ html: '{Literal}This Item Type is already defined{/Literal}' });
            }
            else {
                that.itemTypes.push(itemType);  
                this.reopenModal();
            }
        }
        else {
            M.toast({ html: '{Literal}Please enter a valid Item Type name{/Literal}' });
        }
    },

    reopenModal: function () { 
        var id = this.productLineFormView.model.attributes.id;
        this.productLineFormView.model.attributes.HasChoices = this.$el.find('#choices:checked').length > 0;
        this.productLineFormView.model.attributes.allowDiscount = this.$el.find('#allow-discounts:checked').length > 0;
        this.productLineFormView.model.attributes.description = this.$el.find('#description').val();
        this.productLineFormView.model.attributes.isScalable = this.$el.find('#scale:checked').length > 0;
        this.productLineFormView.model.attributes.isSerialized = this.$el.find('#serialized:checked').length > 0;
        this.productLineFormView.model.attributes.isStock = this.$el.find('#isStock:checked').length > 0;
        this.productLineFormView.model.attributes.isTaxable = this.$el.find('#taxable:checked').length > 0;
        this.productLineFormView.model.attributes.noPartialQuantity = this.$el.find('#noPartialQuantity:checked').length > 0;
        
        if (this.$el.find('#item-type option:selected').text() == "Create New Item Type") {
            this.productLineFormView.model.attributes.itemType = this.$el.find('#itemTypeName').val();
        }
        else {
            this.productLineFormView.model.attributes.itemType = this.$el.find('#item-type option:selected').text();
        }

        if (this.$el.find('#menu-page option:selected').text() == "Create New Menu Page") {
            this.productLineFormView.model.attributes.menuPageName = this.$el.find('#menuPageName').val();
        }
        else {
            this.productLineFormView.model.attributes.menuPageName = this.$el.find('#menu-page option:selected').text();
        }

        if (this.collection.get(id) !== null && this.collection.get(id) !== '' && this.collection.get(id) != undefined) {
            this.productLineFormView = new ProductLineFormView({
                template: this.productLineFormTemplate,
                model:  this.productLineFormView.model,
                itemTypes: this.itemTypes,
                menuPages: this.menuPages
            });
            $('#product-line-form-modal').modal().modal('close');
            this.$el.find('#product-line-form-modal').html(this.productLineFormView.render().el);
            this.$el.find('select').formSelect();
            this.formModal.modal('open');
        }

        else {
            var productLines = new ProductLine();
            this.productLineFormView = new ProductLineFormView({
                template: this.productLineFormTemplate,
                model: this.productLineFormView.model,
                itemTypes: this.itemTypes,
                menuPages: this.menuPages
            });
            $('#product-line-form-modal').modal().modal('close');
            this.$el.find('#product-line-form-modal').html(this.productLineFormView.render().el);
            this.$el.find('select').formSelect();
            this.$el.find("select[required]").css({
                display: "block", 
                position: 'absolute',
                visibility: 'hidden'
            });  
            this.formModal.modal('open');
        }

    },

    saveChanges: function () {
        var that = this;
        var sessionToken = this.getCookie();
        if (that.collection.length < 1) {
            M.toast({ html: '{Literal}You need a least one product line to proceed{/Literal}' });  
        }
        else {
            $.ajax({
                url: '/data/save-productlines',
                data: {
                    serialNumber: App.serialNumber,
                    productLines: JSON.stringify(that.collection.toJSON()),
                    token: sessionToken
                },
                dataType: 'json',
                type: 'POST',
    
                success: function (data) {
                    if (data.status == "Success") {
                        window.location.href = "#/items";
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
    }
});