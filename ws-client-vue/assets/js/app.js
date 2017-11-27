const ENDPOINT_PAGE_STATE = 0
const OPS_PAGE_STATE = 1
const userColor = {"me": "green", "server": "blue"}

var ws = null

var app = new Vue({
    el: '#app',
    data: {
        currentPageState: ENDPOINT_PAGE_STATE,
        endpoint: "",
        message: "",
        messages: []
    },
    methods: {
        submitEndpoint(e){
            // initialize websocket
            initializeWebsocket()
        },
        submitMessage(){
            // send message via websocket
            ws.send(this.message)
            // append message
            this.appendMessage("me", this.message, new Date().getTime())
            // reset message
            this.message = ""
        },
        appendMessage(from, content, timestamp){
            // prepare content
            var payload = content, isJSON = false
            try { 
                payload = JSON.stringify(JSON.parse(content), null, 2)
                isJSON = true
            } catch(e) {}
            // push message to messages
            this.messages.push({
                from: from, 
                content:  payload, 
                timestamp: timestamp,
                isJSON: isJSON
            })
       },
        appendServerResponse(res) {
            // pass response to appendMessage()
            this.appendMessage("server", res.data, new Date().getTime())
        },
        setPageState(state){
            this.currentPageState = state
            if (state == ENDPOINT_PAGE_STATE) {
                this.endpoint = ""
                this.messages = []
            } else if (state == OPS_PAGE_STATE) {
                this.message = ""
            }
        },
        getUserColor(hName){
            return userColor[hName]
        },
        formatTimestamp(timestamp) {
            return moment(timestamp).format("MMMM DD, YYYY - HH:mm")
        },
        scrollMessagesToEnd() {
            // scroll to bottom
            var container = this.$refs.messages
            container.scrollTop = container.scrollHeight     
        }
    },
    computed: {
        shouldShowEndpointPage() {
            return this.currentPageState === ENDPOINT_PAGE_STATE
        },
        shouldShowOpsPage() {
            return this.currentPageState === OPS_PAGE_STATE
        }
    },
    mounted() {
        console.log("clientHeight: " + this.$el.clientHeight)
        this.$refs.endpoint.focus()
    },
    updated() {
        console.log("clientHeight: " + this.$el.clientHeight)
        if (this.currentPageState === OPS_PAGE_STATE) {
            this.scrollMessagesToEnd()
            this.$refs.message.focus()
        } else if (this.currentPageState === ENDPOINT_PAGE_STATE){
            this.$refs.endpoint.focus()
        }
    }
})

function initializeWebsocket() {
    ws = new WebSocket(app.endpoint)
    ws.onopen = function() {
        app.setPageState(OPS_PAGE_STATE)
    }
    ws.onmessage = function(res) {
        app.appendServerResponse(res)
    }
    ws.onclose = function(e) {
        alert(getReasonWebsocketError(e.code))
        app.setPageState(ENDPOINT_PAGE_STATE)
        ws = null
    }
}

function getReasonWebsocketError(errCode) {
    var reason = 'Unknown error';
    switch(errCode) {
    case 1000:
        reason = 'Normal closure';
        break;
    case 1001:
        reason = 'An endpoint is going away';
        break;
    case 1002:
        reason = 'An endpoint is terminating the connection due to a protocol error.';
        break;
    case 1003:
        reason = 'An endpoint is terminating the connection because it has received a type of data it cannot accept';
        break;
    case 1004:
        reason = 'Reserved. The specific meaning might be defined in the future.';
        break;
    case 1005:
        reason = 'No status code was actually present';
        break;
    case 1006:
        reason = 'Cannot connect to server';
        break;
    case 1007:
        reason = 'The endpoint is terminating the connection because a message was received that contained inconsistent data';
        break;
    case 1008:
        reason = 'The endpoint is terminating the connection because it received a message that violates its policy';
        break;
    case 1009:
        reason = 'The endpoint is terminating the connection because a data frame was received that is too large';
        break;
    case 1010:
        reason = 'The client is terminating the connection because it expected the server to negotiate one or more extension, but the server didn\'t.';
        break;
    case 1011:
        reason = 'The server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.';
        break;
    case 1012:
        reason = 'The server is terminating the connection because it is restarting';
        break;
    case 1013:
        reason = 'The server is terminating the connection due to a temporary condition';
        break;
    case 1015:
        reason = 'The connection was closed due to a failure to perform a TLS handshake';
        break;
    }
    return reason
}