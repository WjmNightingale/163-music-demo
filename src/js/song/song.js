{
    let view = {
        el: '#',
        init() {},
        render(data) {
            console.log('渲染函数--')
            console.log(data)
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
            let id = this.getSongId()
            console.log('id---', id)
            this.model.getSongById(id).then((data) => {
                console.log('获取数据')
                console.log(this.model.data)
                this.view.render(this.model.data)
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