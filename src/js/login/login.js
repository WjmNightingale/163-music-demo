{
    let view = {
        el: '#login',
        init() {
            this.$el = $(this.el)
            console.log(this.$el)
        }
    }
    let model = {
        login(username,password) {
            return AV.User.logIn(username,password)
        }
    }
    let controller = {
        init(view,model) {
            this.view = view
            this.model = model
            this.view.init()
            this.bindLogin()
        },
        bindLogin() {
            this.view.$el.on('submit',(e) => {
                console.log('111')
                e.preventDefault()
                let needs = 'username password'.split(' ')
                console.log(needs)
                let newUser = {}
                needs.map((key) => {
                    newUser[key] = this.view.$el.find(`input[name=${key}]`).val()
                })
                console.log(newUser)
                this.model.login(newUser.username,newUser.password).then((loginedUser) => {
                    window.location.href = "/src/admin.html"
                },(error) => {
                    alert(JSON.stringify(error))
                })
            })
        }
    }
    controller.init(view,model)
}