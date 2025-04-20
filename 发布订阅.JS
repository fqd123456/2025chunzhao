class pubsub{
    constructor(){
        this.events = {}
    }

    publish(event,data){
        if(this.events[event]){
            this.events[event].forEach(callback => {
                callback(data)
            });
        }
    }

    subscript(event,callback){
        if(!this.events[event]){
            this.events[event] =  []
        }
        this.events[event].push(callback)
    }

    unsubcipt(event,callback){
        if(this.events[event]){
            this.events.event = this.events[event].filter((cb)=>cb!==callback)
        }
    }
}

const sub = new pubsub()


sub.subscript('dadd',(data)=>{
    console.log(data);
})

sub.publish('dadd','danialal1')