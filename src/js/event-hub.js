// eventHub --- 事件订阅发布机制
window.eventHub = {
    events: {}, // 事件存储中心
    emit(eventName,data) { // 发布
        for (let key in this.events) {
            if (key === eventName) {
                let callbackList = this.events[key]
                callbackList.map((callback) => {
                    callback.call(undefined,data)
                })
            }
        }
    },
    on(eventName,callback) { // 订阅
       if (this.events[eventName] === undefined) {
           this.events[eventName] = []
       }
       this.events[eventName].push(callback)
    },
    off() {}
}