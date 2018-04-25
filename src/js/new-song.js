{
    let view = {
        el: '.newSong',
        template: `
        新建歌曲
        `,
        render(data) {
            $(this.el).html(this.template)
        },
        active() {
            $(this.el).addClass('active')
            //被选中时发布一个'new'事件
            window.eventHub.emit('new')
        },
        cancelActive() {
            $(this.el).removeClass('active')
        }
    }
    let model = {}
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.view.active()
            this.bindEventHub()
            $(this.view.el).on('click',(e) => {
                this.view.active()
            })
        },
        bindEventHub() {
            window.eventHub.on('upload', (data) => {
            })
            window.eventHub.on('select',(data) => {
                this.view.cancelActive()
            })
        }
    }
    controller.init(view, model)
}