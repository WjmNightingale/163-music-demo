{
    // 本地歌曲上传七牛云生成外链
    let view = {
        el: '#uploadArea',
        find: function (selector) {
            return $(this.el).find(selector)[0]
        },
        active() {
            $(this.el).addClass('active')
        },
        clearActive() {
            $(this.el).removeClass('active')
        },
        introductionClearActive() {
            $('.feature > main > .introduction').removeClass('active')
        }
    }
    let model = {}
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.initQiniu()
            this.bindEventHub()
        },
        initQiniu() {
            let uploader = Qiniu.uploader({
                runtimes: 'html5',
                browse_button: this.view.find('#uploadButton'),
                uptoken_url: 'http://localhost:8888/uptoken',
                domain: 'p7fonu2ax.bkt.clouddn.com',
                get_new_uptoken: false,
                container: this.view.find('#uploadContainer'),
                max_file_size: '40mb',
                max_retries: 3,
                dragdrop: true,
                drop_element: this.view.find('#uploadContainer'),
                chunk_size: '4mb',
                auto_start: true,
                init: {
                    'FilesAdded': function (up, files) {
                        plupload.each(files, function (file) {
                            // 文件添加进队列后,处理相关的事情
                        });
                    },
                    'BeforeUpload':  (up, file) => {
                        // 每个文件上传前,处理相关的事情
                      uploadStatus.classList.add('active')
                      $('.fade').addClass('active')
                     
                    },
                    'UploadProgress': function (up, file) {
                        // 每个文件上传时,处理相关的事情
                    },
                    'FileUploaded': function (up, file, info) {
                        let domain = up.getOption('domain')
                        let filename = JSON.parse(info.response).key
                        let key = encodeURIComponent(filename)
                        // 获取上传成功后的文件的Url
                        //  'http://' + domain + '/' + key
                        let sourceLink = `http://${domain}/${key}`
                        window.eventHub.emit('create', {
                            name: filename,
                            singer: '自定义',
                            url: sourceLink
                        })
                        uploadStatus.classList.remove('active')
                        $('.fade').removeClass('active')
                    },
                    'Error': function (up, err, errTip) {
                        //上传出错时,处理相关的事情
                    },
                    'UploadComplete': function () {
                        //队列文件处理完毕后,处理相关的事情
                    }
                }
            })
        },
        bindEventHub() {
            window.eventHub.on('showUploadArea', () => {
                console.log('检测到新增歌曲被选择了')
                this.view.active()
                this.view.introductionClearActive()
            })
            window.eventHub.on('showForm',() => {
                console.log('检测到编辑歌曲被选择了')
                this.view.clearActive()
            })
            window.eventHub.on('create',() => {
                console.log('七牛云上传成功')
                this.view.clearActive()
            })
        }
    }
    controller.init(view, model)
}