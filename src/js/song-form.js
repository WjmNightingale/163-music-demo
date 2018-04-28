{
    // 歌曲信息保存至 leanCloud
    let view = {
        el: '.feature > main > .editArea',
        init() {
            this.$el = $(this.el)
        },
        render(data = {}) {
            let placeholders = 'name singer url'.split(' ')
            placeholders.map((string) => {
                $(this.el).find(`input[value=${string}]`).val(data[string] || '')
            })
            if (data.id) {
                $(this.el).find('.heading > span').text('编辑歌曲')
            } else {
                $(this.el).find('.heading > span').text('新建歌曲')
            }
        },
        reset() {
            this.render({})
        },
        active() {
            $(this.el).addClass('active')
        },
        clearActive() {
            $(this.el).removeClass('active')
        },
        introductionClearActive() {
            $('.feature > main > .introduction').removeClass('active')
        },
        remindActive() {
            $('.feature > main > .editArea > .remind').addClass('active')
            $('.fade').addClass('active')
        },
        remindClearActive() {
            $('.feature > main > .editArea > .remind').removeClass('active')
            $('.fade').removeClass('active')
        }
    }
    let model = {
        data: {
            name: '',
            singer: '',
            url: '',
            editAndSave: true,
            origin: ''
        },
        create(data) {
            // 存数据方法
            let Song = AV.Object.extend('Song')
            let song = new Song()
            for (let key in data) {
                song.set(key, data[key])
            }
            return song.save()
        },
        update(id, data) {
            var Song = AV.Object.createWithoutData('Song', id);
            // 修改属性
            for (let key in data) {
                Song.set(key, data[key])
            }
            // 保存到云端
            return Song.save()
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.init()
            this.view.render(this.model.data)
            this.bindInputChange()
            this.bindRemindConfirm()
            this.bindRemindCancel()
            this.bindSubmit()
            this.bindEventHub()
        },
        bindInputChange() {
            this.view.$el.on('change', 'input[type="text"]', (e) => {
                // 歌曲信息发生改变了
                console.log('歌曲信息发生改变了')
                this.model.data.editAndSave = false
                window.eventHub.emit('songIsEdit', this.model.data)
            })
        },
        bindRemindConfirm() {
            console.log('.action > .confirm')
            $('.action > .confirm').on('click', (e) => {
                console.log('点击确认')
                // this.model.data.editAndSave = true
                if (this.model.data.origin === 'newSong') {
                    // 修改信息未保存点击新建歌曲，弹出提示框后点击确定显示上传功能区
                    window.eventHub.emit('showUploadArea', null)
                    this.view.remindClearActive()
                } else if (this.model.data.origin === 'songList') {
                    // 修改信息未保存编辑其他歌曲，弹出提示框后点击确定显示另外一个要编辑的歌曲信息
                    console.log('修改信息未保存编辑其他歌曲')
                    this.model.data.editAndSave = true
                    window.eventHub.emit('songIsEdit', this.model.data)
                    window.eventHub.emit('showForm')
                    this.view.remindClearActive()
                }
            })
        },
        bindRemindCancel() {
            $('.action > .cancel').on('click', (e) => {
                this.view.remindClearActive()
            })
        },
        bindSubmit() {
            this.view.$el.on('submit', 'form', (e) => {
                e.preventDefault()
                console.log('这里是保存按钮')
                this.model.data.editAndSave = true
                let need = 'name singer url'.split(' ')
                let data = {}
                need.map((string) => {
                    let value = this.view.$el.find(`[name=${string}]`).val()
                    if (value.trim().length > 0) {
                        data[string] = value
                    } else {
                        alert('不允许提交空值')
                        return
                    }

                })
                console.log('表单提交')
                console.log(data)

                if (this.model.data.id) {
                    // 编辑歌曲
                    console.log('编辑歌曲')
                    console.log(this.model.data)
                    this.model.update(this.model.data.id, data).then((updatedSong) => {
                        console.log('更新数据')
                        console.log(updatedSong)
                        let {
                            id,
                            attributes
                        } = updatedSong
                        Object.assign(this.model.data, {
                            id,
                            ...attributes
                        })
                        window.eventHub.emit('update', this.model.data)
                    })
                } else {
                    // 新增歌曲
                    console.log('新增歌曲')
                    this.model.create(data).then((newSong) => {
                        console.log('存储成功！！！返回的数据为--')
                        console.log(newSong)
                        let {
                            id,
                            attributes
                        } = newSong
                        console.log('1')
                        Object.assign(this.model.data, {
                            id,
                            ...attributes
                        })
                        console.log('2')
                        // 清空from表单
                        this.view.reset()
                        // 发布一个save事件
                        console.log()
                        window.eventHub.emit('save', this.model.data)
                    }, (err) => {
                        console.log(err)
                    })
                }
                window.eventHub.emit('songIsEdit', this.model.data)
                console.log('结束')
            })
        },
        bindEventHub() {
            window.eventHub.on('showForm', (data) => {
                this.view.introductionClearActive()
                this.view.active()
                console.log('从歌曲列表模块传递过来的信息')
                console.log(data)
                this.model.data = data
                this.view.render(this.model.data)
                // songId = data.id
            })
            window.eventHub.on('create', (data) => {
                console.log('新增歌曲上传完毕，七牛云返回的信息')
                console.log(data)
                this.view.active()
                // 将歌曲信息渲染到from表单
                let newData = JSON.parse(JSON.stringify(data))
                this.model.data = newData
                this.view.render(this.model.data)
            })
            window.eventHub.on('songIsEdit', (data) => {
                console.log('监听到歌曲信息发生改变')
                if (this.model.data.editAndSave) {
                    console.log('点了保存')
                } else {
                    console.log('没点保存')
                }

            })
            window.eventHub.on('showUploadArea', () => {
                this.view.clearActive()
            })
            window.eventHub.on('showRemind', (data) => {
                let newData = JSON.parse(JSON.stringify(data))
                this.model.data.origin = newData.origin
                this.view.remindActive()
            })
        },
    }
    controller.init(view, model)
}