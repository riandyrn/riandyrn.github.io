$(document).ready(() => {

    var handleName = "me",
        serverHandleName = "server";

    var endpointPage = $('#endpoint_page'),
        opsPage = $('#ops_page'),
        connectForm = $('#connect_form'),
        sendMessageForm = $('#send_message_form'),
        connectedEndpointTitleCtrl = $('#connected_endpoint_title'),
        endpointCtrl = $('#endpoint'),
        messageCtrl = $('#message'),
        messagesContainerCtrl = $('#messages'),
        messagesListCtrl = $('#messages > ul');

    var colors = ["#0000ff", "#a52a2a", "#00008b", "#008b8b", "#bdb76b", "#8b008b", "#556b2f", "#ff8c00", "#9932cc", "#8b0000", "#e9967a", "#9400d3", "#ff00ff", "#ffd700", "#008000", "#4b0082", "#800000", "#808000", "#ffa500", "#ffc0cb", "#800080", "#ff0000", "#c0c0c0"];

    var userColor = {};

    var getUserColor = function(hName) {

        if(!userColor[hName]) {
            var color = 'black';
            if(hName == handleName) {
                color = 'green';
            } else {
                color = colors[Math.floor(Math.random() * colors.length)]
            }
            userColor[hName] = color;
        }

        return userColor[hName];
    }

    var formatTimestamp = function(timestamp) {
        //return 'October 23, 2018 - 18:53';
        return moment(timestamp).format("MMMM DD, YYYY - HH:mm");
    }

    var appendMessage = function(hName, msgContent, timestamp)
    {
        var color = getUserColor(hName);
        var payload;
        try {
            payload = '<li><div class="message-box"><h6 style="color:' + color + '">[' + hName + ']</h6><pre class="message-content">' + JSON.stringify(JSON.parse(msgContent), null, 2) + '</pre> <p class="timestamp">' + formatTimestamp(timestamp) + '</p></div></li>';
        } catch(e) {
            payload = '<li><div class="message-box"><h6 style="color:' + color + '">[' + hName + ']</h6><p class="message-content">' + msgContent + '</p> <p class="timestamp">' + formatTimestamp(timestamp) + '</p></div></li>';
        }
        messagesListCtrl.append(payload);

        // scroll to bottom
        messagesContainerCtrl.scrollTop(messagesContainerCtrl.prop('scrollHeight'));
    }

    var ws = null; // ini perlu di declare disini supaya bisa reconnect si ws client-nya
    var startWebSocketConn = function() {

        ws = new WebSocket(endpointCtrl.val());
        connectedEndpointTitleCtrl.text(endpointCtrl.val());

        ws.onopen = function()
        {
            // open ops page
            endpointPage.hide();
            opsPage.show();

            messageCtrl.focus();

            // attach listener to send message form
            sendMessageForm.submit((e) => {
                e.preventDefault();

                // send message
                var payload = messageCtrl.val();
                ws.send(payload);
                messageCtrl.val('')

                // append message to textbox
                appendMessage(handleName, payload, new Date().getTime());
            });
        }

        ws.onmessage = function(event)
        {
            // append message to list
            appendMessage(serverHandleName, event.data, new Date().getTime());
        }

        ws.onclose = function(e)
        {
            var reason = 'Unknown error';
            switch(e.code) {
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
                reason = 'Cannot connect to chat server';
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

            alert(reason);

            // open login page
            opsPage.hide();
            messagesListCtrl.empty();
            messageCtrl.val('')
            endpointPage.show();

            endpointCtrl.focus();

            ws = null; // ini supaya yg udah closed connectionnya g dipake lagi
        }
    }

    connectForm.submit((e) => {
        e.preventDefault();
        startWebSocketConn();
    });
});
    