# Haraj Chat Websocket API

GET: `/chat/ws`

Websocket is used for listening packet streaming from server.

After client successfully establish websocket connection, client must issue [`Authenticate Connection`](#authenticate-connection) before able to receive streaming from server.

List of available functions:

- [`Authenticate Connection`](#authenticate-connection)
- [`Listen Peer Online Presence`](#listen-peer-online-presence)
- [`Unlisten Peer Online Presence`](#unlisten-peer-online-presence)

List of packets coming from server are following:

- [`Message Packet`](#message-packet)
- [`Reads Packet`](#reads-packet)
- [`Online Presence`](#online-presence)
- [`Offline Presence`](#offline-presence)
- [`Typing Presence`](#typing-presence)
- [`Stop Typing Presence`](#stop-typing-presence)

When client is not connected to websocket, message packet would be still delivered via FCM. Please refer to [`Message Packet`](#message-packet) for details.

---

## Authenticate Connection

Authenticate current socket connection using `access_token` retrieved from login. When the authentication is successful, user will be able to retrieve packets from server & considered to be online by server.

If client severing socket connection after successful authentication, user will be considered going offline by server.

**Command:**

```json
{
    "auth": {
        "id": "authenticate socket",
        "access_token": "<access_token>"
    }
}
```

**Success Response:**

```json
{
    "id": "authenticate socket",
    "status": 200,
    "data": {
        "user_id": 1,
    },
    "ts": "2018-02-02T08:30:39.789Z"
}
```

**Error Response:**

```json
{
    "id": "authenticate socket",
    "status": 401,
    "err": "ERR_INVALID_ACCESS_TOKEN",
    "ts": "2018-02-02T08:30:39.789Z"
}
```

If client receive this error, that means `access_token` provided by client is wrong. Client should ask user to relogin using HTTP API.

[Back to Top](#haraj-chat-websocket-api)

---

## Listen Peer Online Presence

Listening to peer online presence. Peer must have p2p connection with user.

**Command:**

```json
{
    "listen": {
        "id": "listen peer 2",
        "peer_id": 2
    }
}
```

**Success Response:**

```json
{
    "id": "listen peer 2",
    "status": 200,
    "data": {
        "user_id": 1,
        "peer_id": 2,
        "is_online": true
    },
    "ts": "2018-02-02T08:30:39.789Z"
}
```

**Error Response:**

```json
{
    "id": "listen peer 2",
    "status": 403,
    "err": "ERR_FORBIDDEN_ACCESS",
    "ts": "2018-02-02T08:30:39.789Z"
}
```

If client receive this error, that means user does not have p2p connection with peer.

[Back to Top](#haraj-chat-websocket-api)

---

## Unlisten Peer Online Presence

Unlisten from listening peer online presence.

**Command:**

```json
{
    "unlisten": {
        "id": "unlisten peer 2",
        "peer_id": 2
    }
}
```

**Success Response:**

```json
{
    "id": "unlisten peer 2",
    "status": 200,
    "data": {
        "user_id": 1,
        "peer_id": 2
    },
    "ts": "2018-02-02T08:30:39.789Z"
}
```

**Error Response:**

```json
{
    "id": "unlisten peer 2",
    "status": 403,
    "err": "ERR_FORBIDDEN_ACCESS",
    "ts": "2018-02-02T08:30:39.789Z"
}
```

If client receive this error, that means user does not have p2p connection with peer.

[Back to Top](#haraj-chat-websocket-api)

---

## Generic Error

```json
{
    "status": 400,
    "err": "ERR_BAD_REQUEST",
    "ts": "2018-02-02T08:30:39.789Z"
}
```

If client receive this error, that means client doesn't send valid request. Make sure client is sending valid request.

```json
{
    "status": 500,
    "err": "ERR_SERVER_INTERNAL_ERROR",
    "ts": "2018-02-02T08:30:39.789Z"
}
```

If client receive this error, that means server currently having problem to serve client request. Client should retry later.

---

## Message Packet

Indicating user mentioned in packet is sending message to current user.

```json
{
    "message": {
        "topic_id": "p2p1_2",
        "seq_id": 1519011921221,
        "from_id": 2,
        "name": "abdullah_zagat",
        "content": {
            "type": "text/plain",
            "payload": {
                "text": "hello!"
            }
        },
        "status": {
            "1": false
        },
        "ts": "2018-10-08T08:30:39.657Z"
    }
}
```

When curent user is offline, this packet will be delivered through FCM. In iOS, the notification would be shown directly in notification tray. However in android it would be delivered through background. The message sent to FCM server will be shown in following sections.

### iOS Format (APNS)

```json
{
    "aps" : {
        "alert": {
            "title" : "abdullah_zagat",
            "body" : "hello!"
        },
        "sound":"default",
        "mutable-content" : 1
    },
    "xtype" : "NEW_MESSAGE",
    "xdata" : {
        "topic_id": "p2p1_2",
        "seq_id": 1519011921221,
        "from_id": 2,
        "name": "abdullah_zagat",
        "content": {
            "type": "text/plain",
            "payload": {
                "text": "hello!"
            }
        },
        "status": {
            "1": false
        },
        "ts": "2018-10-08T08:30:39.657Z"
    },
    "xto" : [1]
}
```

### Android Format (FCM)

```json
{
    "registration_ids": ["<fcm_token_1>"],
    "priority": "high",
    "time_to_live": 3600,
    "data": {
        "xtype" : "NEW_MESSAGE",
        "xdata" : {
            "topic_id": "p2p1_2",
            "seq_id": 1519011921221,
            "from_id": 2,
            "name": "abdullah_zagat",
            "content": {
                "type": "text/plain",
                "payload": {
                    "text": "hello!"
                }
            },
            "status": {
                "1": false
            },
            "ts": "2018-10-08T08:30:39.657Z"
        },
        "xto" : [1]
    }
}
```

[Back to Top](#haraj-chat-websocket-api)

---

## Reads Packet

Indicating user mentioned in packet has read message in topic.

```json
{
    "reads": {
        "from_id": 2,
        "topic_id": "p2p1_2",
        "seq_ids": [
            1519011921221,
            1519011921893
        ],
        "ts": "2018-10-08T08:30:39.657Z"
    }
}
```

[Back to Top](#haraj-chat-websocket-api)

---

## Online Presence

Indicating user mentioned in packet is currently online.

```json
{
    "pres": {
        "what": "online",
        "from_id": 2,
        "ts": "2018-10-08T08:30:39Z"
    }
}
```

[Back to Top](#haraj-chat-websocket-api)

---

## Offline Presence

Indicating that the user mentioned in packet is currently offline.

```json
{
    "pres": {
        "what": "offline",
        "from_id": 2,
        "ts": "2018-10-08T08:30:39.657Z"
    }
}
```

[Back to Top](#haraj-chat-websocket-api)

---

## Typing Presence

Indicating that the user mentioned in packet is currently typing in topic.

```json
{
    "pres": {
        "what": "typing",
        "from_id": 2,
        "topic_id": "p2p1_2",
        "ts": "2018-10-08T08:30:39.657Z"
    }
}
```

[Back to Top](#haraj-chat-websocket-api)

---

## Stop Typing Presence

Indicating that the user mentioned in packet is already stop typing in topic.

```json
{
    "pres": {
        "from_id": 2,
        "what": "stop_typing",
        "topic_id": "p2p1_2",
        "ts": "2018-10-08T08:30:39.657Z"
    }
}
```

[Back to Top](#haraj-chat-websocket-api)

---