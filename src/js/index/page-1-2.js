{
    let view = {
        el: '.page-1 > .songs',
        init() {
            this.$el = $(this.el)
            console.log('这里是最新音乐')
        },
        render(data) {
            let {songs} = data
            songs.map((song) => {
                let $li = $(`
                <li>
                    <h3>${song.name}</h3>
                    <p>
                        <svg class="icon icon-sq" aria-hidden="true">
                            <use xlink:href="#icon-geshou"></use>
                        </svg>
                    ${song.singer}
                    </p>
                    <a class="playButton" href="./song.html?id=${song.id}">
                        <svg class="icon-play" aria-hidden="true">
                            <use xlink:href="#icon-iconset0481"></use>
                        </svg>
                    </a>
                </li>
                `)
                this.$el.find('ol.list').append($li)
            })
        }
    }
    let model = {
        data: {
            songs: []
        },
        find() {
            let query = new AV.Query('Song')
            return query.find().then((songs) => {
                this.data.songs = songs.map((song) => {
                    return {
                        id: song.id,
                        ...song.attributes
                    }
                })
                return songs
            })

        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.init()
            this.model.find().then(() => {
                this.view.render(this.model.data)
            })
        }
    }
    controller.init(view,model)
}