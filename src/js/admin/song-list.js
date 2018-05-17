{
    // 已上传歌曲列表 --- 查找功能
    let view = {
        el: '#songList-container',
        render(data) {
            console.log('songList模块初始化')
            console.log(data)
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
            songs: [],
        },
        find() {
            let query = new AV.Query('Song')
            query.addDescending('createdAt')
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
                let result = this.model.data.songs.map(item => item.editAndSave)
                console.log('是否有修改过未保存的')
                console.log(result.indexOf(false) > -1)
                result =  result.indexOf(false) > -1
                console.log('这是songList模块的点击事件--歌曲被选中')
                let songId = e.currentTarget.getAttribute('data-song-id')
                let data = null
                let songs = JSON.parse(JSON.stringify(this.model.data.songs))
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === songId) {
                        data = songs[i]
                        break
                    }
                }
                console.log('被选中的数据--')
                console.log(data)
                
                this.view.activeItem(e.currentTarget)
                
                if (!result) {
                    console.log('选中的歌曲信息未曾被编辑或编辑后已被保存')
                    window.eventHub.emit('showForm', data)
                } else {
                    // 歌曲信息编辑后未保存又点击其他歌曲编辑
                    console.log('选中歌曲信息编辑后未保存又点击其他歌曲编辑')
                    window.eventHub.emit('showRemind', data)
                }


            })
        },
        bindEventHub() {
            window.eventHub.on('save', (data) => {
                // 深拷贝
                console.log('监听 form表单 的 save 事件,准备显示新的歌曲信息')
                let newData = JSON.parse(JSON.stringify(data))
                console.log(newData)
                this.model.data.songs.unshift(newData)
                this.view.render(this.model.data)
            })
            window.eventHub.on('update', (data) => {
                // 深拷贝
                console.log('监听 form表单 的 update 事件,准备显示新的歌曲信息')
                let updatedData = JSON.parse(JSON.stringify(data))
                console.log(updatedData)
                for (let i = 0; i < this.model.data.songs.length; i++) {
                    if (this.model.data.songs[i].id === updatedData.id) {
                        Object.assign(this.model.data.songs[i], updatedData)
                    }
                }
                // this.model.data.songs.push(updatedData)
                this.view.render(this.model.data)
            })
            window.eventHub.on('showUploadArea', () => {
                console.log('监听到了showUploadArea事件')
                this.view.clearActive()
            })
            window.eventHub.on('songIsEdit', (data) => {
                console.log('歌曲信息修改')
                let newData = JSON.parse(JSON.stringify(data))
                console.log('修改数据')
                console.log(newData)
                let songs = this.model.data.songs
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === newData.id) {
                        songs[i] = newData
                        break
                    }
                }
                
                console.log('修改后的model')
                console.log(this.model.data)
            })
            window.eventHub.on('editAndSave',() => {
                console.log('警告的确认按钮触发的事件')
                this.model.data.songs.map(item => item.editAndSave = true)
            })
            window.eventHub.on('cancel',(data) => {
                console.log('取消按钮事件')
                let newData = JSON.parse(JSON.stringify(data))
                console.log(newData)
                let activeLi =$(`li[data-song-id="${newData.data.id}"]`)[0]
                activeLi.classList.add('active')
                let clearActiveLi = $(`li[data-song-id="${newData.tmpData.id}"]`)[0]
                clearActiveLi.classList.remove('active')
                
            })
        }
    }
    controller.init(view, model)
}