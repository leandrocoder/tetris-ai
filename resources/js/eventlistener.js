class EventListener {
    constructor() {
        this.__eventList = []
    }

    addEventListener(name, callback) {
        if (name && callback) this.__eventList.push({ name, callback })
    }

    removeEventListener(name, callback) {
        if (this.__eventList && this.__eventList.length) {
            for (let i = this.__eventList.length - 1; i >= 0; i--) {
                if (this.__eventList[i] && this.__eventList[i].name === name) {
                    if (this.__eventList[i].callback === callback) {
                        this.__eventList.splice(i, 1)
                    }
                }
            }
        }
    }

    removeEventListenerByName(name) {
        if (this.__eventList && this.__eventList.length) {
            for (let i = this.__eventList.length - 1; i >= 0; i--) {
                if (this.__eventList[i] && this.__eventList[i].name === name) {
                    this.__eventList.splice(i, 1)
                }
            }
        }
    }

    dispatchEvent(name, data) {
        for (let i = 0; i < this.__eventList.length; i++) {
            if (this.__eventList[i].name === name) this.__eventList[i].callback(data)
        }
    }
}