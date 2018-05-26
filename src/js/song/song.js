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
            let lyric = data.lyric
            lyric = lyric.split('\n')
            // console.log('转换后---')
            // console.log(lyric)
            let regex = /\[([\d:.]+)\](.+)/
            if (regex.test(lyric)) {
                let matchLyric = lyric.map(item => {
                    // console.log(item)
                    item = regex.exec(item)
                    // console.log('匹配--')
                    // console.log(item)
                    return item
                })
                // console.log('正则匹配后--')
                // console.log(matchLyric)
                let pList = matchLyric.map((item) => $('<p></p>').text(item[2]).attr('data-time', item[1]).addClass('line'))
                // console.log(pList)
                pList.map((p) => {
                    $('div.lines').append(p)
                })
            } else {
                // 没有上传lyric格式的歌词
                console.log('无歌词')
                let p = $('<p></p>').text(lyric).addClass('line')
                $('div.lines').append(p)
            }

            // audio.ontimeupdate  audio.currentTime
        },
        getTimestamp() {
            // 获取歌词时间戳
            let timestamp = []
            let allP = $('p.line')
            if (allP.length > 1) {
                for (let i = 0; i < allP.length; i++) {
                    // console.log(allP[i].getAttribute('data-time'))
                    let time = allP[i].getAttribute('data-time').split(':')
                    let minute = time[0]
                    let second = time[1]
                    time = parseFloat(minute, 10) * 60 + parseFloat(second, 10)
                    timestamp.push(time)
                }
                // console.log('获取歌词时间戳')
                // console.log($('p.line').eq(1).offset().top)
                // console.log(timestamp)
            }
            return timestamp
        },
        play() {
            let audio = $(this.el).find('audio')[0]
            audio.play()
        },
        pause() {
            let audio = $(this.el).find('audio')[0]
            audio.pause()
        },
        showLyric(currentTime, timestamp) {
            // console.log('显示时间戳')
            if (timestamp.length > 0) {
                let targetIndex // 正在播放的歌词
                for (let i = 0; i < timestamp.length - 1; i++) {
                    if (currentTime >= timestamp[timestamp.length-1]) {
                        targetIndex = timestamp.length - 1
                    } else if (currentTime >= timestamp[i] && currentTime < timestamp[i + 1]) {
                        targetIndex = i
                        break
                    }
                }
                console.log('第'+targetIndex+'歌词')
                targetTop = $('p.line').eq(1).offset().top
                currentTop = $('p.line').eq(targetIndex).offset().top
               
                $('div.lines').css({
                    'transform': `translateY(${targetTop - currentTop}px)`
                })
                $('p.line').eq(targetIndex).addClass('active')
                $('p.line').eq(targetIndex).siblings().removeClass('active')
            } else {
                $('p.line').addClass('active')
            }
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
                let newData = Object.assign({id:song.id},song.attributes)
                console.log('心数据--')
                console.log(newData)
                Object.assign(this.data,newData)
                console.log('合成后的数据--')
                console.log(this.data)
                // Object.assign(this.data, {
                //     id: song.id,
                //     ...song.attributes
                // })
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
            this.view.$el.find('svg#back').on('click', (e) => {
                window.location.href = '/src/index.html'
            })
            this.view.$el.find('svg#play').on('click', (e) => {
                // 点击播放时
                console.log(e.currentTarget)
                console.log($(e.currentTarget))
                $(e.currentTarget).removeClass('active')
                $(e.currentTarget).siblings().addClass('active')
                this.view.$el.find('img#pointer').addClass('active')
                this.view.$el.find('div#cover').css('animation-play-state', 'running')
                this.view.play()
            })
            this.view.$el.find('svg#pause').on('click', (e) => {
                // 点击暂停时
                console.log(e.currentTarget)
                console.log($(e.currentTarget))
                $(e.currentTarget).removeClass('active')
                $(e.currentTarget).siblings().addClass('active')
                this.view.$el.find('img#pointer').removeClass('active')
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
            this.view.$el.find('audio#songSource').on('timeupdate', (e) => {
                // 当前歌曲播放时间
                console.log(e.currentTarget.currentTime)
                let currentTime = e.currentTarget.currentTime
                let timestamp = this.view.getTimestamp()
                this.view.showLyric(currentTime, timestamp)
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