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
            id: '',
            name: '',
            singer: '',
            url: '',
            origin: 'songList',
            editAndSave: true,
        },
        tmpData: {
            id: '',
            name: '',
            singer: '',
            url: '',
            origin: 'songList',
            editAndSave: true,
        },
        create(data) {
            // 存数据方法
            console.log('这里是存储数据--')
            console.log(data)
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
            console.log(this.model.data.origin)
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
                // this.model.data.editAndSave = true
                if (this.model.data.origin === 'newSong') {
                    // 修改信息未保存点击新建歌曲，弹出提示框后点击确定显示上传功能区
                    console.log('新建歌曲事件')
                    window.eventHub.emit('editAndSave', null)
                    window.eventHub.emit('showUploadArea', null)
                    this.view.remindClearActive()
                } else if (this.model.data.origin === 'songList') {
                    // 修改信息未保存编辑其他歌曲，弹出提示框后点击确定显示另外一个要编辑的歌曲信息
                    // this.model.data.editAndSave = true
                    Object.assign(this.model.data,this.model.tmpData)
                    this.view.render(this.model.data)
                    this.view.remindClearActive()
                    window.eventHub.emit('editAndSave', null)
                    window.eventHub.emit('songIsEdit', this.model.data)
                }
                console.log('点击确认后的页面数据')
                console.log(this.model.data)
            })
        },
        bindRemindCancel() {
            $('.action > .cancel').on('click', (e) => {
                console.log('取消的时候页面数据')
                console.log(this.model.data)
                window.eventHub.emit('cancel',{data:this.model.data,tmpData:this.model.tmpData})
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
                console.log('来源--', this.model.data['origin'])
                data['origin'] = this.model.data['origin']
                data['editAndSave'] = this.model.data['editAndSave']
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
                $('.feature > main > .editArea > .successMessage').addClass('active')
                setTimeout(() => {
                    $('.feature > main > .editArea > .successMessage').removeClass('active')
                },600)
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
                Object.assign(this.model.data, newData)
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
                console.log('接受到的数据--')
                console.log(newData)
                Object.assign(this.model.tmpData, newData)
                this.view.remindActive()
            })
        },
    }
    controller.init(view, model)
}