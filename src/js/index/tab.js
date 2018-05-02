{
    let view = {
        el: '#tabs',
        init() {
            this.$el = $(this.el)
        }
    }
    let model = {}
    let controller = {
        init(view,model) {
            this.view = view
            this.model = model
            this.view.init()
            this.bindEvents()
        },
        bindEvents() {
            this.view.$el.on('click','.tabs-nav > li',(e) => {
                let $li = $(e.currentTarget)
                let tabName = $li.attr('data-tab-name')
                window.eventHub.emit('selectTab',tabName)
                $li.addClass('active').siblings().removeClass('active')
            })
        }
    }
    controller.init(view,model)
}