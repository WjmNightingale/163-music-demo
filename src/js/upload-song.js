{
    // 本地歌曲上传七牛云生成外链
    let view = {
        el: '.uploadArea',
        find: function (selector) {
            return $(this.el).find(selector)[0]
        }
    }
    let model = {}
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.initQiniu()
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
                    'BeforeUpload': function (up, file) {
                        // 每个文件上传前,处理相关的事情
                    },
                    'UploadProgress': function (up, file) {
                        // 每个文件上传时,处理相关的事情
                        uploadStatus.textContent = '上传中'
                    },
                    'FileUploaded': function (up, file, info) {
                        let domain = up.getOption('domain')
                        let filename = JSON.parse(info.response).key
                        let key = encodeURIComponent(filename)
                        // 获取上传成功后的文件的Url
                        //  'http://' + domain + '/' + key
                        let sourceLink = `http://${domain}/${key}`
                        uploadStatus.textContent = '上传完毕'
                        window.eventHub.emit('upload', {
                            name: filename,
                            singer: 'test',
                            url: sourceLink,
                        })
                        console.log({
                            name: name,
                            singer: 'test',
                            url: sourceLink,
                        })
                    },
                    'Error': function (up, err, errTip) {
                        //上传出错时,处理相关的事情
                    },
                    'UploadComplete': function () {
                        //队列文件处理完毕后,处理相关的事情
                    }
                }
            })
        }
    }
    controller.init(view, model)
}