{
    // 已上传歌曲列表 --- 查找功能
    let view = {
        el: '#songList-container',
        render(data) {
            let {
                songs
            } = data
            
            let liList = songs.map((song) => $('<li></li>').text(song.name).attr('data-song-id', song.id))
            let $ul = $(this.el).find('ul')
            $ul.empty()
            liList.map((li) => {
                $ul.append(li)
            })
        },
        activeItem(li) {
            $(li).addClass('active').siblings().removeClass('active')
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
                this.data.songs = songs.map((song) => {
                    return {
                        id: song.id,
                        ...song.attributes
                    }
                })
                return songs
            }, (error) => {
                console.log(error)
            })
        },
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEvents()
            this.bindEventHub()
            this.getAllSongs()
        },
        getAllSongs() {
            return this.model.find().then(() => {
                this.view.render(this.model.data)
            })
        },
        bindEvents() {
            $(this.view.el).on('click', 'li', (e) => {
                this.view.activeItem(e.currentTarget)
                let songId = e.currentTarget.getAttribute('data-song-id')
                let data = null
                let songs = JSON.parse(JSON.stringify(this.model.data.songs))
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === songId) {
                        data = songs[i]
                        break
                    }
                }
                window.eventHub.emit('showForm', data)
            })
        },
        bindEventHub() {
            window.eventHub.on('save', (data) => {
                // 深拷贝
                console.log('监听 form表单 的 save 事件,准备显示新的歌曲信息')
                let newData = JSON.parse(JSON.stringify(data))
                console.log(newData)
                this.model.data.songs.push(newData)
                this.view.render(this.model.data)
            })
            window.eventHub.on('update',(data) => {
                // 深拷贝
                console.log('监听 form表单 的 update 事件,准备显示新的歌曲信息')
                let updatedData = JSON.parse(JSON.stringify(data))
                console.log(updatedData)
                for (let i = 0; i < this.model.data.songs.length; i++) {
                    if (this.model.data.songs[i].id === updatedData.id) {
                        Object.assign(this.model.data.songs[i],updatedData)
                    }
                }
                // this.model.data.songs.push(updatedData)
                this.view.render(this.model.data)
            })
            window.eventHub.on('showUploadArea', () => {
                console.log('监听到了showUploadArea事件')
                this.view.clearActive()
            })
        }
    }
    controller.init(view, model)
}