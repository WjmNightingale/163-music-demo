{
    // 歌曲信息保存至 leanCloud
    let view = {
        el: '.page > main',
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
            let Song = AV.Object.extend('Song')
            let song = new Song()
            for (let key in data) {
                song.set(key, data[key])
            }
            return song.save().then((newSong) => {
                let {
                    id,
                    attributes
                } = newSong
                // Object.assign(thi.data,{
                //     id: id,
                //     name: attributes.name,
                //     singer: attributes.singer,
                //     url: attributes.url
                // })
                Object.assign(this.data, {
                    id,
                    ...attributes
                })
            }, (err) => {
                console.log(err)
            })
        },
        update(id) {
            var todo = AV.Object.createWithoutData('Todo', '5745557f71cfe40068c6abe0');
            // 修改属性
            todo.set('content', '每周工程师会议，本周改为周三下午3点半。');
            // 保存到云端
            todo.save();
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.init()
            this.view.render(this.model.data)
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
                if (this.model.data.id) {

                } else {
                    this.model.create(data).then(() => {
                        this.view.reset()
                        window.eventHub.emit('create', this.model.data)
                    })
                }
            })
        },
        bindEventHub() {
            window.eventHub.on('upload', (data) => {
                this.view.render(data)
            })
            window.eventHub.on('select', (data) => {
                this.model.data = data
                this.view.render(this.model.data)
                songId = data.id
            })
            window.eventHub.on('new', () => {
                this.model.data = {}
                this.view.render(this.model.data)
            })
        },
    }
    controller.init(view, model)
}