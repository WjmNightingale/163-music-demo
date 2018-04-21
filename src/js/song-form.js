{
    // 歌曲信息保存至 leanCloud
    let view = {
        el: '.page > main',
        init() {
            this.$el = $(this.el)
        },
        template: `
        <form action="">
                <h2>新建歌曲</h2>
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
            console.log(data)
            let placeholders = 'name singer url'.split(' ')
            console.log(placeholders)
            let html = this.template
            placeholders.map((string) => {
                html = html.replace(`__${string}__`,data[string] || '')
            })
            console.log(html)
            $(this.el).html(html)
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
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.init()
            this.view.render(this.model.data)
            this.bindEvents()
            window.eventHub.on('upload', (data) => {
                this.view.render(data)
            })
        },
        bindEvents() {
            this.view.$el.on('submit', 'form', (e) => {
                e.preventDefault()
                let need = 'name singer url'.split(' ')
                let data = {}
                need.map((string) => {
                    data[string] = this.view.$el.find(`[name=${string}]`).val()
                })
                this.model.create(data).then(() => {
                    console.log(this.model.data)
                    this.view.reset()
                    window.eventHub.emit('create',this.model.data)
                })
            })
        }
    }
    controller.init(view, model)
}