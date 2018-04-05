# Haraj Chat HTTP API

List of available functions:

- [`User Login`](#user-login)
- [`Refresh Access Token`](#refresh-access-token)
- [`Get Latest Topic List`](#get-latest-topic-list)
- [`Resolve Topics`](#resolve-topics)
- [`Start P2P Topic`](#start-p2p-topic)
- [`Get Latest Messages`](#get-latest-messages)
- [`Confirm Reads`](#confirm-reads)
- [`Delete Message`](#delete-message)
- [`Send Typing Presence`](#send-typing-presence)
- [`Send Stop Typing Presence`](#send-stop-typing-presence)
- [`Send Message`](#send-message)
- [`Hide Topic`](#hide-topic)
- [`Update Avatar`](#update-avatar)
- [`Update Device`](#update-device)
- [`Find Users`](#find-users)

Beside these functions, client need to be aware of [`Generic Errors`](#generic-errors) as well.

---

## User Login

POST: `/chat/sessions`

There are two ways of authenticating user in haraj chat:

- using username & password (we call it `basic` authentication)
- using haraj session value (we call it `haraj_session` authentication)

If authentication is successful, this function will return `access_token` which need to be included in `Authorization` header for authenticating subsequent request.

**Body:**

For `basic` authentication:

```json
{
    "auth_type": "basic",
    "username": "riandyrn",
    "password": "123456"
}
```

For `haraj_session` authentication:

```json
{
    "auth_type": "haraj_session",
    "session_value": "<session_value>"
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "access_token": "<access_token>",
        "expires": "2018-02-09T08:30:39.987Z",
    },
    "ts": "2018-02-02T08:30:39.783Z"
}
```

**Error Responses:**

```json
{
    "status": 409,
    "err": "ERR_MISMATCH_CREDENTIALS",
    "ts": "2018-02-02T08:30:39.892Z"
}
```

If client receive this error, that means the combination of username & password or session value sent by client is wrong.

[Back to Top](#haraj-chat-http-api)

---

## Refresh Access Token

PUT: `/sessions/{user_id}`

This function is used to generate new access token for user. This function is expected to be called when current `access_token` is almost expired.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "access_token": "<access_token>",
        "expires": "2018-02-09T08:30:39Z"
    },
    "ts": "2018-02-02T08:30:39.873Z"
}
```

**Error Response:**

No specific errors

[Back to Top](#haraj-chat-http-api)

---

## Get Latest Topic List

GET: `/chat/users/{user_id}/topics?last_key=<last_key>`

This function is used to fetch latest updated user's topics from server.

Notice that the result of successfull call of this function does not contains avatar for p2p & group topic. The name of group topic won't be included too.

The maximum result returned from this function is 8.

To fill this missing information, client is expected to call [Resolve Topics](#resolve-topics).

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Example Request:**

```bash
GET /chat/users/1/topics?last_key=MXxwMnAxXzJ8MTUxODc2NTUxNTIyMg
Authorization: Bearer 3BbzhEyaiPUle5tZFAABAKICLHJsZQq0D2WTquYowk_yjpZcdzaQSBrmq0WckdBJ
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "topics": [
            {
                "topic_id": "p2p1_2",
                "title": "abdullah_zagat",
                "last_message": {
                    "from_id": 2,
                    "name": "abdullah_zagat",
                    "type": "text/plain",
                    "short": "ABCDEFGHIJKLMNOPQRST..."
                },
                "last_updated": "2018-09-08T08:12:31.994Z",
                "unread": 2
            },
            {
                "topic_id": "p2p1_3",
                "title": "yahya_asim",
                "last_message": {
                    "from_id": 1,
                    "name": "riandyrn",
                    "type": "image/jpeg"
                },
                "last_updated": "2018-09-08T08:11:31.994Z"
            },
            {
                "topic_id": "grp1518765515224234",
                "last_message": {
                    "from_id": 2,
                    "name": "abdullah_zagat",
                    "type": "text/plain",
                    "short": "Hello World!"
                },
                "last_updated": "2018-09-08T07:12:31.994Z",
                "unread": 1
            }
        ],
        "last_key": "MXxncnAxNTE4NzY1NTE1MjI0MjM0fDE1MTg3NjU1MTUyMjI"
    },
    "ts": "2018-10-08T08:30:39.764Z"
}
```

**Error Responses:**

No specific error response

[Back to Top](#haraj-chat-http-api)

---

## Resolve Topics

GET: `/chat/topics?topic_ids=<topic_ids>`

This function is used to fill missing information of avatar & group topic name. This function is expected to be called only if necessary after [Get Latest Topic List](#get-latest-topic-list).

The success response of this function will have two `status`:

- `200`: when all topics is found
- `207`: when at least one topic is found

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Example Request:**

```bash
GET /chat/topics?topic_ids=p2p1_2,p2p1_3,grp1518765515224234
Authorization: Bearer 3BbzhEyaiPUle5tZFAABAKICLHJsZQq0D2WTquYowk_yjpZcdzaQSBrmq0WckdBJ
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "topics": [
            {
                "topic_id": "p2p1_2",
                "avatar": "https://someurl.com/abdullah.jpg",
            },
            {
                "topic_id": "p2p1_3",
                "avatar": "https://someurl.com/yahya.jpg",
            },
            {
                "topic_id": "grp1518765515224234",
                "title": "Yorom yorom",
                "avatar": "https://someurl.com/yorom.jpg"
            }
        ],
        "failed": []
    },
    "ts": "2018-10-08T08:30:39.765Z"
}
```

```json
{
    "status": 207,
    "data": {
        "user_id": 1,
        "topics": [
            {
                "topic_id": "p2p1_2",
                "avatar": "https://someurl.com/abdullah.jpg",
            }
        ],
        "failed": ["p2p1_3", "grp1518765515224234"]
    },
    "ts": "2018-10-08T08:30:39.893Z"
}
```

**Error Responses:**

```json
{
    "status": 409,
    "err": "ERR_MAX_RESOLVE_TOPICS_REACHED",
    "ts": "2018-02-02T08:30:39Z.765"
}
```

Client will receive this error when it trying to resolve more than 4 topics at once. So if client got this error, it should lowered the number of topics in parameter.

[Back to Top](#haraj-chat-http-api)

---

## Start P2P Topic

POST: `/chat/users/{user_id}/topics`

This function is used to setup & repair subscriptions for P2P topic.

If the subscriptions are exist, this function will still return success response. If the subscriptions is partially exist, then this function will complete the missing subscription in database. If success, it will return success response.

If client is not sure whether current user has subscription already to target user, client could start with calling this function before sending the message with [Send Message](#send-message).

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Body:**

```json
{
    "type": "p2p",
    "with_id": 2
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "topic": "p2p1_2",
        "with_id": 2
    },
    "ts": "2018-10-08T08:30:39.675Z"
}
```

**Error Responses:**

No specific error response

[Back to Top](#haraj-chat-http-api)

---

## Get Latest Messages

GET: `/chat/users/{user_id}/topics/{topic_id}/messages?last_key=<last_key>`

This function is used to fetch topic's last message. Expected to be used when client is loading chat details screen.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Example Request:**

```bash
GET /chat/users/{user_id}/topics/{topic_id}/messages?last_key=cDJwMV8yfDE1MTkwMjMxOTIxMjM
Authorization: Bearer 3BbzhEyaiPUle5tZFAABAKICLHJsZQq0D2WTquYowk_yjpZcdzaQSBrmq0WckdBJ
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "topic_id": "p2p1_2",
        "messages": [
            {
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
                    "1": true
                },
                "ts": "2018-10-08T08:30:39Z.765"
            },
            {
                "seq_id": 1519023192122,
                "from_id": 1,
                "name": "riandyrn",
                "content": {
                    "type": "text/plain",
                    "payload": {
                        "text": "hello world!"
                    }
                },
                "status": {
                    "2": false
                },
                "ts": "2018-10-08T08:31:39.765Z"
            }
        ],
        "last_key": "cDJwMV8yfDE1MTg3NjU1MTUyMjI"
    },
    "ts": "2018-10-08T08:30:39.876Z"
}
```

**Error Responses:**

No specific error response

[Back to Top](#haraj-chat-http-api)

---

## Confirm Reads

PUT: `/chat/users/{user_id}/topics/{topic_id}/messages`

This function is used by client to confirm user has read the messages. Maximum messages to be confirmed at one time is 2.

Notice that there will be two `status` value for success response:

- `200`: all read confirmation is successful
- `207`: at least one confirmation is successful

If client receive `207`, client should check which confirmation is failed and retry it later.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Body:**

```json
{
    "seq_ids": [
        1519011921221,
        1519011921893
    ]
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "topic_id": "p2p1_2",
        "success_ids": [
            1519011921221,
            1519011921893
        ],
        "failed_ids": []
    },
    "ts": "2018-10-08T08:30:39Z.765"
}
```

```json
{
    "status": 207,
    "data": {
        "topic_id": "p2p1_2",
        "success_ids": [
            1519011921221
        ],
        "failed_ids": [
            1519011921893
        ]
    },
    "ts": "2018-10-08T08:30:39.765Z"
}
```

**Error Response:**

```json
{
    "id": "confirm reads",
    "status": 409,
    "err": "ERR_MAX_CONFIRMATION_REACHED",
    "ts": "2018-02-02T08:30:39Z"
}
```

If client receive this error, client should lower the number of confirmation in parameter. The maximum number of confirmation is 2.

---

## Delete Message

DELETE: `/chat/users/{user_id}/topics/{topic_id}/messages/{seq_id}`

This function is used to delete user's message from server. Client only allowed to delete message one at a time.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Example Request:**

```bash
DELETE /chat/users/1/topics/p2p1_2/messages/1519011921221
Authorization: Bearer 3BbzhEyaiPUle5tZFAABAKICLHJsZQq0D2WTquYowk_yjpZcdzaQSBrmq0WckdBJ
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "topic_id": "p2p1_2",
        "seq_id": 1519011921221
    },
    "ts": "2018-02-02T08:30:39.765Z"
}
```

**Error Response:**

```json
{
    "status": 409,
    "err": "ERR_MESSAGE_NOT_FOUND",
    "ts": "2018-02-02T08:30:39.869Z"
}
```

Client will receive this error if client trying to delete non-existent message.

---

## Send Typing Presence

POST: `/chat/users/{user_id}/topics/{topic_id}`

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Body:**

```json
{
    "what": "typing",
    "start": true
}
```

Broadcast to topic that user start typing.

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "what": "typing",
        "start": true,
        "topic_id": "p2p1_2"
    },
    "ts": "2018-02-02T08:30:39.869Z"
}
```

**Error Response:**

No specific error response

[Back to Top](#haraj-chat-http-api)

---

## Send Stop Typing Presence

POST: `/chat/users/{user_id}/topics/{topic_id}`

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Body:**

```json
{
    "what": "typing",
    "start": false
}
```

Broadcast to topic that user stop typing.

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "what": "typing",
        "start": false,
        "topic_id": "p2p1_2"
    },
    "ts": "2018-02-02T08:30:39.869Z"
}
```

**Error Response:**

No specific error response

[Back to Top](#haraj-chat-http-api)

---

## Send Message

POST: `/chat/users/{user_id}/topics/{topic_id}/messages`

This function is used to send message to a topic. After the message is saved on server, the message will be relayed via FCM or websocket depending on target user's situation.

The value of content refer to the value of messages explained in database schema document.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Body:**

```json
{
    "content": {
        "type": "text/plain",
        "payload": {
            "text": "hello world!"
        }
    }
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "topic_id": "p2p1_2",
        "seq_id": 1519011921290,
        "content": {
            "type": "text/plain",
            "payload": {
                "text": "hello world!"
            }
        }
    },
    "ts": "2018-10-08T08:30:39.765Z"
}
```

**Error Responses:**

```json
{
    "status": 409,
    "err": "ERR_MISSING_SUBSCRIPTION",
    "ts": "2018-02-02T08:30:39.765Z"
}
```

This error is specific for P2P topic. Client will receive this error when topic's subscriptions is found to be not complete:

- whether both of them doesn't exist on database
- only one of them is exist due to some circumstances

If client receive this error, client should issue [Start P2P Topic](#start-p2p-topic) to repair the subscriptions.

[Back to Top](#haraj-chat-http-api)

---

## Hide Topic

DELETE: `/chat/users/{user_id}/topics/{topic_id}`

Mark topic as hidden. Topic will shows up again if there is new message on the topic.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Example Request:**

```bash
DELETE /chat/users/1/topics/p2p1_2
Authorization: Bearer 3BbzhEyaiPUle5tZFAABAKICLHJsZQq0D2WTquYowk_yjpZcdzaQSBrmq0WckdBJ
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "topic_id": "p2p1_2"
    },
    "ts": "2018-02-02T08:30:39.765Z"
}
```

**Error Response:**

```json
{
    "status": 409,
    "err": "ERR_TOPIC_NOT_FOUND",
    "ts": "2018-02-02T08:30:39.657Z"
}
```

Client will get this error, if client trying to hide non existent topic.

---

## Update Avatar

PUT: `/chat/users/{user_id}`

This function is used to update user's avatar.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Body:**

```json
{
    "what": "update_avatar",
    "avatar": "https://someurl.com/riandyrn.jpg"
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "what": "update_avatar",
        "avatar": "https://someurl.com/riandyrn.jpg"
    },
    "ts": "2018-10-08T08:30:39Z.765"
}
```

**Error Response:**

No specific error response

[Back to Top](#haraj-chat-http-api)

---

## Update Device

PUT: `/chat/users/{user_id}`

This function is used to update user's device information. Notice that in Haraj Chat, user only permitted to register single device.

The only possible value for platform is either `iOS` or `Android`.

The registered device will receive message notification from server via FCM when user is offline.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Body:**

```json
{
    "what": "update_device",
    "device": {
        "token": "<fcm_token>",
        "platform": "iOS"
    }
}
```

**Success Response:**

```json
{
    "status": 200,
    "data": {
        "user_id": 1,
        "what": "update_device",
        "device": {
            "token": "<fcm_token>",
            "platform": "iOS"
        }
    },
    "ts": "2018-10-08T08:30:39.765Z"
}
```

**Error Responses:**

No specific error responses

[Back to Top](#haraj-chat-http-api)

---

## Find Users

GET: `/chat/users?usernames=<usernames>`

Lookup user id by using username. Maximum number of simultaneous lookup is 3.

The value of `usernames` must be url encoded. For example if username contains space like `"Riandy Rahman"`, then the resulted value should be `"Riandy%20Rahman"`. If it is `اثاث`, then the resulted value would be `%D8%A7%D8%AB%D8%A7%D8%AB`.

**Header:**

```bash
Authorization: Bearer <access_token>
```

**Example Request:**

```bash
GET /chat/users?usernames=hrome_drome,abdullah_zagat,yahya_zaid
Authorization: Bearer 3BbzhEyaiPUle5tZFAABAKICLHJsZQq0D2WTquYowk_yjpZcdzaQSBrmq0WckdBJ
```

**Success Response:**

```json
{
    "id": "find users",
    "data": {
        "user_id": 1,
        "users": [
            {
                "username": "hrome_drome",
                "user_id": 10,
                "avatar": "https://someurl.con/hrome_drome.jpg"
            },
            {
                "username": "abdullah_zagat",
                "user_id": 2,
                "avatar": "https://someurl.com/abdullah_zagat.jpg"
            },
            {
                "username": "yahya_zaid",
                "user_id": 3,
                "avatar": "https://someurl.com/yahya_zaid.jpg"
            }
        ]
    },
    "ts": "2018-10-08T08:30:39Z.765"
}
```

**Error response:**

```json
{
    "id": "find users",
    "err": "ERR_MAX_FIND_REACHED",
    "ts": "2018-10-08T08:30:39.765Z"
}
```

If client receive this error, that means usernames input is more than 3. Lower the input number to resolve this error.

[Back to Top](#haraj-chat-http-api)

---

## Generic Errors

Besides function specific error, there are generic errors as well. Here is the list of such errors:

```json
{
    "status": 400,
    "err": "ERR_BAD_REQUEST",
    "ts": "2018-02-02T08:30:39.765Z"
}
```

If client receive this error, that means the value in function parameter is invalid.

```json
{
    "status": 500,
    "err": "ERR_INTERNAL_ERROR",
    "ts": "2018-02-02T08:30:39.765Z"
}
```

If client receive this error, that means something happens on server side. Client should retry the request in the mean time.

```json
{
    "status": 401,
    "err": "ERR_INVALID_ACCESS_TOKEN",
    "ts": "2018-02-02T08:30:39.765Z"
}
```

If client receive this error, that means the token is no longer valid (expired) or the token is literally invalid (wrong access token).

When client received this error, client is expected to call [Refresh Access Token](#refresh-access-token). If the resulted response is still contains this error, that means the token is literally invalid (wrong access token).

[Back to Top](#haraj-chat-http-api)

---