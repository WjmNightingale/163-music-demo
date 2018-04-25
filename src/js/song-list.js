{
    // 已上传歌曲列表 --- 查找功能
    let view = {
        el: '#songList-container',
        render(data) {
            let {
                songs
            } = data
            let liList = songs.map((song) => $('<li></li>').text(song.name))
            let $ul = $(this.el).find('ul')
            $ul.empty()
            liList.map((li) => {
                $ul.append(li)
            })
        },
        clearActive() {
            $(this.el).find('.active').removeClass('active')
        }
    }
    let model = {
        data: {
            songs: []
        },
        find() {
            let query = new AV.Query('Song')
            return query.find().then((songs) => {
                console.log(songs)
                this.data.songs = songs.map((song) => {
                    return {
                        id: song.id,
                        ...song.attributes
                    }
                })
                console.log(this.data.songs)
                return songs
            }, (error) => {
                console.log(error)
            })
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            window.eventHub.on('upload', () => {
                this.view.clearActive()
            })
            window.eventHub.on('create', (data) => {
                // 深拷贝
                let newData = JSON.parse(JSON.stringify(data))
                this.model.data.songs.push(newData)
                this.view.render(this.model.data)
            })
            this.model.find().then(() => {
                this.view.render(this.model.data)
            })
        }
    }
    controller.init(view, model)
}