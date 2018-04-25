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
            console.log('1111')
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
        },
        bindEventHub() {
            window.eventHub.on('upload', (data) => {
                console.log('new-song模块得到了数据')
                console.log(data)
            })
            window.eventHub.on('select',(data) => {
                console.log('new-song模块得到了id--',data.id)
                this.view.cancelActive()
            })
        }
    }
    controller.init(view, model)
}