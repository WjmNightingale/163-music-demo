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
            $('audio#songSource').attr('url',data.url)
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
            console.log($('svg#play').on())
            console.log(this.view.$el.find('svg#play').on())
            this.view.$el.find('svg#play').on('click',(e) => {
                console.log( e.currentTarget)
               console.log($( e.currentTarget))
               $(e.currentTarget).removeClass('active')
               $(e.currentTarget).siblings().addClass('active')
               this.view.$el.find('img#pointer').css('animation-play-state','running')
               this.view.$el.find('div#cover').css('animation-play-state','running')
               this.view.play()
            })
            this.view.$el.find('svg#pause').on('click',(e) => {
                console.log( e.currentTarget)
               console.log($( e.currentTarget))
               $(e.currentTarget).removeClass('active')
               $(e.currentTarget).siblings().addClass('active')
               this.view.$el.find('img#pointer').css('animation-play-state','paused')
               this.view.$el.find('div#cover').css('animation-play-state','paused')
               this.view.pause()
            })
            this.view.$el.find('audio#songSource').on('ended',(e) => {
                console.log('播放完毕')
                this.view.$el.find('svg#play').addClass('active')
                this.view.$el.find('svg#pause').removeClass('active')
                this.view.$el.find('div#pointer').css('animation-play-state','paused')
                this.view.$el.find('div#cover').css('animation-play-state','paused')
            })
        },
        getSongId() {
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