{
    // 获取当前用户
    let currentUser = AV.User.current()
    console.log(currentUser)
    if (currentUser) {
        $('div.app').addClass('active')
    } else {
        window.location.href = '/src/login.html'
        window.alert('请先登陆')
    }
    // 歌曲信息保存至 leanCloud
    let view = {
        el: '.feature > main > .editArea',
        init() {
            this.$el = $(this.el)
        },
        render(data = {}) {
            console.log('歌曲信息详情页开始渲染--')
            console.log(data)
            let placeholders = 'name singer url cover lyric'.split(' ')
            placeholders.map((string) => {
                if (string === 'cover') {
                    console.log('歌曲信息详情页面--歌曲封面信息--')
                    console.log(data[string])
                    let imgUrl
                    if (data[string] === null) {
                        imgUrl = '/src/img/tmp-image.png'
                    } else {
                        imgUrl = data[string].url
                    }
                    $(this.el).find('img#coverImg').attr('src', imgUrl)
                } else if (string === 'lyric') {
                    $(this.el).find(`textarea[name=${string}]`).val(data[string] || '暂无歌词')
                } else {
                    $(this.el).find(`input[value=${string}]`).val(data[string] || '')
                }
            })
            if (data.id) {
                $(this.el).find('.heading > span').text('编辑歌曲')
                $(this.el).find('img#coverImg').addClass('active')
                $(this.el).find('label.upload').text('更改歌曲封面')
            } else {
                $(this.el).find('.heading > span').text('新建歌曲')
                // $(this.el).find('img#coverImg').removeClass('active')
                $(this.el).find('label.upload').text('上传歌曲封面')
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
            lyric: '',
            origin: 'songList',
            editAndSave: true,
            cover: null
        },
        tmpData: {
            id: '',
            name: '',
            singer: '',
            url: '',
            lyric: '',
            origin: 'songList',
            editAndSave: true,
            cover: null
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
            song.set('owner', currentUser)
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
            this.bindLogout()
            this.bindContentChange()
            this.bindRemindConfirm()
            this.bindRemindCancel()
            this.bindSubmit()
            this.bindEventHub()
            console.log(this.model.data.origin)
            console.log('页面数据')
            console.log(this.model.data)
            console.log('页面临时数据')
            console.log(this.model.tmpData)
        },
        bindLogout() {
            $('#logout').on('click', (e) => {
                AV.User.logOut()
                $('div.app').removeClass('active')
                window.location.href = '/src/login.html'
                window.alert('即将退出登录状态')
            })
        },
        bindContentChange() {
            // 监听input内容变化
            this.view.$el.on('change', 'input', (e) => {
                // 歌曲信息发生改变了
                console.log('歌曲信息发生改变了')
                if (e.currentTarget.getAttribute('name') === 'cover') {
                    console.log('图片变化了--预览显示图片')
                    console.log( e.currentTarget.files[0])
                    $('img#coverImg').attr('src',window.URL.createObjectURL( e.currentTarget.files[0]))
                    $('img#coverImg').on('load',(e) => {
                        window.URL.revokeObjectURL($('img#coverImg').attr('src'))
                    })
                }
                this.model.data.editAndSave = false
                window.eventHub.emit('songIsEdit', this.model.data)
            })
            // 监听textarea内容变化
            this.view.$el.on('change','textarea',(e) => {
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
                    Object.assign(this.model.data, this.model.tmpData)
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
                window.eventHub.emit('cancel', {
                    data: this.model.data,
                    tmpData: this.model.tmpData
                })
                this.view.remindClearActive()
            })
        },
        bindSubmit() {
            this.view.$el.on('submit', 'form', (e) => {
                e.preventDefault()
                if (this.model.data.editAndSave) {
                    window.alert('您未做任何修改')
                    return
                }
                console.log('这里是保存按钮')
                this.model.data.editAndSave = true
                let need = 'name singer url cover lyric'.split(' ')
                let data = {}
                need.map((string) => {
                    if (string === 'cover') {
                        // file
                        let file = this.view.$el.find(`[name=${string}]`)[0].files[0]
                        console.log(file)
                        if (file) {
                            // 更新图片
                            console.log('更新图片')
                            let fileName = file.name
                            let avFile = new AV.File(fileName, file)
                            data[string] = avFile
                        } else {
                            // 不更新图片
                            console.log('不更新图片')
                            delete data[string]
                        }
                    } else {
                        // string
                        let value = this.view.$el.find(`[name=${string}]`).val()
                        if (value.trim().length > 0) {
                            data[string] = value
                        } else {
                            alert('不允许提交空值')
                            return
                        }
                    }
                })
                console.log('来源--', this.model.data['origin'])
                data['origin'] = this.model.data['origin']
                data['editAndSave'] = this.model.data['editAndSave']
                console.log('表单提交此时的数据--')
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
                        console.log('修改页面后的数据')
                        console.log(this.model.data)
                        if (typeof this.model.data.cover.url === 'function') {
                            console.log('说明修改了图片')
                            this.view.$el.find('img#coverImg').attr('src', this.model.data.cover.url())
                        }
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
                        // 隐藏from表单
                        // 发布一个showUploadArea事件
                        console.log('发布一个save事件携带的数据---')
                        console.log(this.model.data)
                        window.eventHub.emit('save', this.model.data)
                        console.log('发布一个showUploadArea事件---')
                        window.eventHub.emit('showUploadArea')
                        this.view.clearActive()
                    }, (err) => {
                        console.log(err)
                    })
                }
                console.log('cover元素--')
                console.log(this.view.$el.find(`[name=cover]`)[0])
                this.view.$el.find(`[name=cover]`)[0].value = ''
                console.log('修改页面后的数据')
                console.log(this.model.data)
                window.eventHub.emit('songIsEdit', this.model.data)
                console.log('结束')
                $('.feature > main > .editArea > .successMessage').addClass('active')
                setTimeout(() => {
                    $('.feature > main > .editArea > .successMessage').removeClass('active')
                }, 1000)
            })
        },
        bindEventHub() {
            window.eventHub.on('showForm', (data) => {
                this.view.introductionClearActive()
                this.view.active()
                console.log('从歌曲列表模块传递过来的歌曲信息---')
                console.log(data)
                this.model.data = data
                this.view.render(this.model.data)
                // songId = data.id
            })
            window.eventHub.on('create', (data) => {

                console.log('新增歌曲上传完毕，七牛云返回的信息')
                console.log(data)
                console.log('此时歌曲详情页的数据--')
                console.log(this.model.data)
                console.log('此时歌曲详情页的临时数据--')
                console.log(this.model.tmpData)
                this.view.active()
                // 将歌曲信息渲染到from表单
                let newData = {
                    id: '',
                    name: '',
                    singer: '',
                    url: '',
                    origin: 'songList',
                    editAndSave: false,
                    cover: null
                }
                Object.assign(newData, data)
                Object.assign(this.model.data, newData)
                console.log('接受到七牛云返回的数据的页面数据---')
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