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
            this.bindEventHub()
            $(this.view.el).on('click',(e) => {
                // 新增歌曲按钮被选中时发布一个showUploadArea事件
                window.eventHub.emit('showUploadArea',{})
            })
        },
        bindEventHub() {
            window.eventHub.on('showUploadArea', () => {
                this.view.active()
            })
            window.eventHub.on('showForm',() => {
                this.view.cancelActive()
            })
        }
    }
    controller.init(view, model)
}