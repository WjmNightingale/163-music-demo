{
    let view = {
        el: '.page > main',
        template: `
        <form action="">
                <h2>新建歌曲</h2>
                <div class="row">
                    <label for="">歌名
                    </label>
                    <input name="name" type="text" value="__key__">
                </div>
                <div class="row">
                    <label for="">歌手
                    </label>
                    <input name="singer" type="text">
                </div>
                <div class="row">
                    <label for="">外链
                    </label>
                    <input name="url" type="text">
                </div>
                <div class="row action">
                    <input type="submit" value="保存">
                </div>
            </form>
        `,
        render(data) {
            $(this.el).html(this.template)
        }
    }
    let model = {}
    let controller = {
        init(view,model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            window.eventHub.on('upload',(data) => {
                console.log('song-form模块得到了数据')
                console.log(data)
            })
        }
    }
    controller.init(view,model)
}