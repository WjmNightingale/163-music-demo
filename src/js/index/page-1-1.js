{
    let view = {
        el: '.page-1 > .playlists',
        init() {
            console.log('这里是推荐歌单')
        }
    }
    let model = {}
    let controller = {
        init(view,model) {
            this.view = view
            this.model = model
            this.view.init()
        }
    }
}