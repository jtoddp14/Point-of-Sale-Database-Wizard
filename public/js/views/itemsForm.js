var ItemsFormView = Backbone.View.extend({
    events: {
        'change #itemsDescription': 'updateDescription'
    },

    initialize: function (options) {
        this.options = options;
        this.template = _.template(options.template);
        this.model = options.model;
        this.items = options.items;
        this.productLines = options.productLines;
    },

    render: function () {
        var that = this;
        this.$el.detach();

        this.$el.html(this.template({
            items: this.model.toJSON(),
            productLines: this.productLines,
        }));
        
        $(document).ready(function() {
            $('.tooltipped').tooltip();
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

    updateDescription: function (e) {
        var element = $(e.currentTarget);
        var description = $(element).val();
        this.model.set('description', description);
    }
});