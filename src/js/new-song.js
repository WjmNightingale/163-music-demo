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
    let model = {
        data: {
            editAndSave: true,
            origin: 'newSong'
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEventHub()
            $(this.view.el).on('click',(e) => {
                // 新增歌曲按钮被选中时发布一个showUploadArea事件
                isEmit = this.model.data.editAndSave
                if (isEmit) {
                    window.eventHub.emit('showUploadArea',null)
                } else {
                    window.eventHub.emit('showRemind',this.model.data)
                }
            })
        },
        bindEventHub() {
            window.eventHub.on('showUploadArea', () => {
                this.view.active()
            })
            window.eventHub.on('showForm',() => {
                this.view.cancelActive()
            })
            window.eventHub.on('songIsEdit',(data) => {
                console.log('歌曲信息修改')
                let newData = JSON.parse(JSON.stringify(data))
                console.log(newData)
                this.model.data = newData.editAndSave
            })
        }
    }
    controller.init(view, model)
}