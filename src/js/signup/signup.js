{
    let view = {
        el: '#signUp',
        init() {
            this.$el = $(this.el)
        }
    }
    let model = {
        createUser(username, password, email) {
            let user = new AV.User()
            user.setUsername(username)
            user.setPassword(password)
            user.setEmail(email)
            return user.signUp()
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.init()
            console.log(this.view.$el)
            this.bindSubmit()
        },
        bindSubmit() {
            this.view.$el.on('submit', (e) => {
                e.preventDefault()
                let needs = 'username password email'.split(' ')
                console.log(needs)
                let newUser = {}
                needs.map((key) => {
                    newUser[key] = this.view.$el.find(`input[name=${key}]`).val()
                })
                console.log(newUser)
                this.model.createUser(newUser.username,newUser.password,newUser.email).then((loginedUser) => {
                    window.location.href = "/src/admin.html"
                },(error) => {
                    alert(JSON.stringify(error))
                })
            })
        }
    }
    controller.init(view, model)
}