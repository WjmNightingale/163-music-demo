let http = require('http')
let fs = require('fs')
let url = require('url')
let port = process.argv[2]
let qiniu = require('qiniu')

if (!port) {
    console.log('请输入端口号\n 比如 node server.js 8080')
    process.exit(1)
}

let server = http.createServer((request, response) => {

    // 解析后的路径
    let parseUrl = url.parse(request.url, true)
    // 请求路径
    let path = parseUrl.pathname
    console.log('请求路径--', path)
    // 路径参数
    let query = parseUrl.query
    console.log('路径参数--', query)
    // 请求方法
    let method = request.method
    console.log('请求方法--', method)


    if (path === '/uptoken') {
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/json;charset=utf-8')
        response.setHeader('Access-Control-Allow-Origin', '*')
        response.removeHeader('Date')
        var config = fs.readFileSync('./qiniu-config.json')
        config = JSON.parse(config)

        let {
            accessKey,
            secretKey
        } = config;
        var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        var options = {
            scope: '163-music-demo',
        };
        var putPolicy = new qiniu.rs.PutPolicy(options);
        var uploadToken = putPolicy.uploadToken(mac);
        response.write(`
     {
     "uptoken": "${uploadToken}"
     }
     `)
        response.end()
    }

})
server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)