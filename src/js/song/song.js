{
    let view = {
        el: '#app',
        template: `
        
        `,
        init() {
            this.$el = $(this.el)
        },
        render(data) {
            console.log('渲染函数--')
            console.log(data)
            // $(this.el).html(this.template.replace('{{url}}',data.url))
            // 渲染播放背景
            $('.app .background-cover').css({
                background: `url(${data.cover.attributes.url}) center / cover no-repeat transparent`,
            })
            // 渲染封面图
            $('.app .disc-container .disc .cover').css({
                background: `url(${data.cover.attributes.url}) center / 44.5vw 44.5vw no-repeat transparent`,
            })
            // 获取歌曲信息
            $('audio#songSource').attr('src', data.url)
            // 获取歌曲名字以及歌手名字
            $('.app .top .song-description .song-name').text(data.name)
            $('.app .top .song-description .song-singer').text(data.singer)

            // 获取歌词  正则表达式来过滤时间轴/\[([\d:]+)\](.+)/

            let regex = /\[([\d:.]+)\](.+)/

            // audio.ontimeupdate  audio.currentTime
        },
        play() {
            let audio = $(this.el).find('audio')[0]
            audio.play()
        },
        pause() {
            let audio = $(this.el).find('audio')[0]
            audio.pause()
        }
    }
    let model = {
        data: {
            id: '',
            name: '',
            singer: '',
            url: ''
        },
        getSongById(id) {
            console.log('getSongById')
            let query = new AV.Query('Song')
            return query.get(id).then((song) => {
                Object.assign(this.data, {
                    id: song.id,
                    ...song.attributes
                })
                // return {
                //     id: song.id,
                //     ...song.attributes
                // }
            })
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.init()
            let id = this.getSongId()
            console.log('id---', id)
            this.model.getSongById(id).then((data) => {
                console.log('获取数据')
                console.log(this.model.data)
                this.view.render(this.model.data)
                // setTimeout(() => {
                //     this.view.play()
                // },3000)
                // setTimeout(() => {
                //     this.view.pause()
                // },10000)
                // even 偶数
                // odd 奇数
            })
            this.bindEvents()
        },
        bindEvents() {
            console.log('暂停播放函数')    
            this.view.$el.find('svg#back').on('click',(e) => {
                window.location.href = '/src/index.html'
            })
            this.view.$el.find('svg#play').on('click', (e) => {
                // 点击播放时
                console.log(e.currentTarget)
                console.log($(e.currentTarget))
                $(e.currentTarget).removeClass('active')
                $(e.currentTarget).siblings().addClass('active')
                this.view.$el.find('img#pointer').css('animation-play-state', 'running')
                this.view.$el.find('div#cover').css('animation-play-state', 'running')
                this.view.play()
            })
            this.view.$el.find('svg#pause').on('click', (e) => {
                // 点击暂停时
                console.log(e.currentTarget)
                console.log($(e.currentTarget))
                $(e.currentTarget).removeClass('active')
                $(e.currentTarget).siblings().addClass('active')
                this.view.$el.find('img#pointer').css('animation-play-state', 'paused')
                this.view.$el.find('div#cover').css('animation-play-state', 'paused')
                this.view.pause()
            })
            this.view.$el.find('audio#songSource').on('ended', (e) => {
                // 歌曲播放完毕时
                console.log('播放完毕')
                this.view.$el.find('svg#play').addClass('active')
                this.view.$el.find('svg#pause').removeClass('active')
                this.view.$el.find('img#pointer').css('animation-play-state', 'paused')
                this.view.$el.find('div#cover').css('animation-play-state', 'paused')
            })
        },
        getSongId() {
            // 获取 url 中 song 的 id 参数
            //console.log(window.location.search)
            let search = window.location.search
            if (search.indexOf('?') === 0) {
                search = search.substring(1)
            }
            let id = ''
            let arr = search.split('&').filter((value => value))
            //console.log(arr)
            for (let i = 0; i < arr.length; i++) {
                let part = arr[i].split('=')
                let key = part[0]
                let value = part[1]
                //console.log('key--', key)
                //console.log('value--', value)
                if (key === 'id') {
                    id = value
                    break
                }
            }
            console.log('id--', id)
            return id
        }
    }
    controller.init(view, model)
}