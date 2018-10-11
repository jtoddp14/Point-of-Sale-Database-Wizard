var POSUserFormView = Backbone.View.extend({
    events: {

    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
    },

    render: function () {
        var that = this;
        this.$el.html(this.template({
            posUser: this.model.toJSON(),
        }));

        return this;
    }
});
