{
    // 歌曲信息保存至 leanCloud
    let view = {
        el: '.page > main > .formContainer',
        init() {
            this.$el = $(this.el)
        },
        template: `
        <form action="">
                <div class="row">
                    <label for="">歌名
                    </label>
                    <input name="name" type="text" value="__name__">
                </div>
                <div class="row">
                    <label for="">歌手
                    </label>
                    <input name="singer" type="text" value="__singer__">
                </div>
                <div class="row">
                    <label for="">外链
                    </label>
                    <input name="url" type="text" value="__url__">
                </div>
                <div class="row action">
                    <input type="submit" value="保存">
                </div>
            </form>
        `,
        render(data = {}) {
            let placeholders = 'name singer url'.split(' ')
            let html = this.template
            placeholders.map((string) => {
                html = html.replace(`__${string}__`, data[string] || '')
            })
            $(this.el).html(html)
            if (data.id) {
                $(this.el).prepend(' <h2>编辑歌曲</h2>')
            } else {
                $(this.el).prepend(' <h2>新建歌曲</h2>')
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
        }
    }
    let model = {
        data: {
            name: '',
            singer: '',
            url: '',
            createId: ''
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
            console.log()
            this.bindEvents()
            this.bindEventHub()
        },
        bindEvents() {
            this.view.$el.on('submit', 'form', (e) => {
                e.preventDefault()
                let need = 'name singer url'.split(' ')
                let data = {}
                need.map((string) => {
                    data[string] = this.view.$el.find(`[name=${string}]`).val()
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
                console.log('结束')
            })
        },
        bindEventHub() {
            window.eventHub.on('showForm', (data) => {
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
        },
    }
    controller.init(view, model)
}