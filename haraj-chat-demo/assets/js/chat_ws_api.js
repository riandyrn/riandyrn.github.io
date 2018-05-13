//const wsURL = "ws://localhost:8065/chat/ws"
const wsURL = "ws://34.248.203.142:8065/chat/ws"

class ChatWsAPI {

    constructor() {
        this.ws = null
    }

    // authenticateConnection is used for authenticating 
    // socket connection, packet & err will be passed 
    // to packetHandler.
    // if err is received, then socket connection is closed
    // already 
    authenticateConnection(accessToken, packetHandler) {
        // initialize connection
        this.ws = new WebSocket(wsURL)
        var self = this
        // attach onopen handler
        this.ws.onopen = function() {
            // authenticate connection
            var cmd = {
                "auth": {
                    "id": "authenticate socket",
                    "access_token": accessToken
                }
            }
            self.ws.send(JSON.stringify(cmd))
        }
        // attach onmessage handler
        this.ws.onmessage = function(res) {
            var msg = JSON.parse(res.data)
            if ((msg.message != null) || (msg.reads != null) || (msg.pres != null)) {
                packetHandler(msg, null)
            }
        }
        // attach onclose handler
        this.ws.onclose = function(e) {
            packetHandler(null, getReasonWebsocketError(e.code))
            self.ws = null
        }
    }

    // listenPeerOnlinePresence is used for start listening
    // peer online presence, online & offline presence will be
    // sent to packetHandler if any
    listenPeerOnlinePresence(peerID) {
        if (this.ws != null) {
            var cmd = {
                "listen": {
                    "id": `listen peer ${peerID}`,
                    "peer_id": peerID
                }
            }
            this.ws.send(JSON.stringify(cmd))
        }
    }

    // unlistenPeerOnlinePresence is used for stop listening
    // peer online presence, online & offline presence will no
    // longer sent to packetHandler
    unlistenPeerOnlinePresence(peerID) {
        if (this.ws != null) {
            var cmd = {
                "unlisten": {
                    "id": `unlisten peer ${peerID}`,
                    "peer_id": peerID
                }
            }
            this.ws.send(JSON.stringify(cmd))
        }
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