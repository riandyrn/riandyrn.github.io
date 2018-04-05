const baseURL = "http://52.30.62.174:8065"
const mGET = "GET"
const mPOST = "POST"
const mPUT = "PUT"
const mDELETE = "DELETE"

/**
 * URL Generator
*/

function appendToBaseURL(url) {
    return baseURL + url
}

function getLoginURL() {
    return {
        url: baseURL + "/chat/sessions",
        method: mPOST
    }
}

function getRefreshAccessTokenURL(userID) {
    return {
        url: appendToBaseURL(`/chat/sessions/${userID}`),
        method: mPUT
    }
}

function getLatestTopicsURL(userID, lastKey) {
    var urlPart = `/chat/users/${userID}/topics`
    if (lastKey.length > 0) {
        urlPart = `${urlPart}?last_key=${lastKey}`
    }
    return {
        url: appendToBaseURL(urlPart),
        method: mGET
    }
}

function getResolveTopicsURL(topicIDs) {
    return {
        url: appendToBaseURL(`/chat/topics?topic_ids=${topicIDs.join(",")}`),
        method: mGET
    }
}

function getStartTopicURL(userID) {
    return {
        url: appendToBaseURL(`/chat/users/${userID}/topics`),
        method: mPOST
    }
}

function getLatestMessagesURL(userID, topicID, lastKey) {
    var urlPart = `/chat/users/${userID}/topics/${topicID}/messages`
    if (lastKey.length > 0) {
        urlPart = `${urlPart}?last_key=${lastKey}`   
    }
    return {
        url: appendToBaseURL(urlPart),
        method: mGET
    }
}

function getConfirmReadsURL(userID, topicID) {
    return {
        url: appendToBaseURL(`/chat/users/${userID}/topics/${topicID}/messages`),
        method: mPUT
    }
}

function getDeleteMessageURL(userID, topicID, seqID) {
    return {
        url: appendToBaseURL(`/chat/users/${userID}/topics/${topicID}/messages/${seqID}`),
        method: mDELETE
    }
}

function getSendTypingURL(userID, topicID) {
    return {
        url: appendToBaseURL(`/chat/users/${userID}/topics/${topicID}`),
        method: mPOST
    }
}

function getSendStopTypingURL(userID, topicID) {
    return getSendTypingURL(userID, topicID)
}

function getSendMessageURL(userID, topicID) {
    return {
        url: appendToBaseURL(`/chat/users/${userID}/topics/${topicID}/messages`),
        method: mPOST
    }
}

function getHideTopicURL(userID, topicID) {
    return {
        url: appendToBaseURL(`/chat/users/${userID}/topics/${topicID}`),
        method: mDELETE
    }
}

function getUpdateAvatarURL(userID) {
    return {
        url: appendToBaseURL(`/chat/users/${userID}`),
        method: mPUT
    }
}

function getUpdateDeviceURL(userID) {
    return getUpdateAvatarURL(userID)
}

function getFindUsersURL(usernames) {
    return {
        url: appendToBaseURL(`/chat/users?usernames=${usernames.join(",")}`),
        method: mGET
    }
}

/**
 * API Calls
 */

class ChatAPI {
    // initialize userID & accessToken values
    constructor() {
        this.userID = 0
        this.accessToken = ""
    }

    // userBasicLogin is used for login using basic schema
    // (using username & password), returns userID, accessToken, & err in callback
    userBasicLogin(username, password, callback) {
        var self = this
        var action = getLoginURL()
        var body = {
            "auth_type": "basic",
            "username": username,
            "password": password,
        }
        $.ajax({
            url: action.url,
            method: action.method,
            contentType: "application/json",
            data: JSON.stringify(body),
            success(e) {
                // set userID & accessToken
                self.userID = e.data.user_id
                self.accessToken = e.data.access_token
                // return nil to callback
                callback(self.userID, self.accessToken, null)
            },
            error(xhr, txt, errStr) {
                // return err code to callback
                callback(null, null, xhr.responseJSON.err)
            }
        })
    }

    // refreshAccessToken is used for generating new access token
    // meant to be used when access token almost expired
    // returns err in callback
    refreshAccessToken(callback) {
        var self = this
        var action = getRefreshAccessTokenURL(this.userID)
        $.ajax({
            url: action.url,
            method: action.method,
            contentType: "application/json",
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            success(e) {
                // set access token to new one
                self.accessToken = e.data.access_token
                // return nil to callback
                callback(null)
            },
            error(xhr, txt, errStr) {
                // return err code to callback
                callback(xhr.responseJSON.err)
            }
        })
    }

    // getLatestTopics is used for fetching user latest topics
    // lastKey may not be set, returns topics, lastKey, & err in callback
    getLatestTopics(lastKey, callback) {
        var action = getLatestTopicsURL(this.userID, lastKey)
        $.ajax({
            url: action.url,
            method: action.method,
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            success(e) {
                // return topics
                callback(e.data.topics, e.data.last_key, null)
            },
            error(xhr) {
                // return err
                callback(null, null, xhr.responseJSON.err)
            }
        })
    }

    // resolveTopics is used for resolving topics, topicIDs
    // is array of topic name (array of string)
    // returns topic metas & err in callback
    resolveTopics(topicIDs, callback) {
        var action = getResolveTopicsURL(topicIDs)
        $.ajax({
            url: action.url,
            method: action.method,
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            success(e) {
                // return topics meta
                callback(e.data.topics, null)
            },
            error(xhr) {
                // return error
                callback(null, xhr.responseJSON.err)
            }
        })
    }

    // startP2PTopic is used for starting p2p topic with other user
    // returns topic & err in callback
    startP2PTopic(withID, callback) {
        var action = getStartTopicURL(this.userID)
        var body = {
            "type": "p2p",
            "with_id": withID
        }
        $.ajax({
            url: action.url,
            method: action.method,
            contentType: "application/json",
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            data: JSON.stringify(body),
            success(e) {
                // return topic id
                callback(e.data.topic, null)
            },
            error(xhr) {
                // return error
                callback(null, xhr.responseJSON.err)
            }
        })
    }

    // getLatestMessages is used for fetching user latest messages in
    // topic, lastKey maybe empty
    // returns messages, lastKey & err in callback
    getLatestMessages(topicID, lastKey, callback) {
        var action = getLatestMessagesURL(this.userID, topicID, lastKey)
        $.ajax({
            url: action.url,
            method: action.method,
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            success(e) {
                // return messages & lastKey
                callback(e.data.messages, e.data.last_key, null)
            },
            error(xhr) {
                // return error
                callback(null, null, xhr.responseJSON.err)
            }
        })
    }

    // confirmReads is used for confirm message reads
    // seqIDs is array of integer
    // returns successIDs, failedIDs, & err in callback
    confirmReads(topicID, seqIDs, callback) {
        var action = getConfirmReadsURL(this.userID, topicID)
        var body = {
            "seq_ids": seqIDs
        }
        $.ajax({
            url: action.url,
            method: action.method,
            contentType: "application/json",
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            data: JSON.stringify(body),
            success(e) {
                // return successIDs & failedIDs
                callback(e.data.success_ids, e.data.failed_ids, null)
            },
            error(xhr) {
                // return error
                callback(null, null, xhr.responseJSON.err)
            }
        })
    }

    // deleteMessage is used for deleting message
    // returns err in callback
    deleteMessage(topicID, seqID, callback) {
        var action = getDeleteMessageURL(this.userID, topicID, seqID)
        $.ajax({
            url: action.url,
            method: action.method,
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            success(e) {
                // return null
                callback(null)
            },
            error(xhr) {
                // return error
                callback(xhr.responseJSON.err)
            }
        })
    }

    // sendTypingPresence is used for sending typing presence
    // returns err in callback
    sendTypingPresence(topicID, callback) {
        var action = getSendTypingURL(this.userID, topicID)
        var body = {
            "what": "typing",
            "start": true
        }
        $.ajax({
            url: action.url,
            method: action.method,
            contentType: "application/json",
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            data: JSON.stringify(body),
            success(e) {
                // return null
                callback(null)
            },
            error(xhr) {
                // return error
                callback(xhr.responseJSON.err)
            }
        })
    }

    // sendStopTypingPresence is used for sending typing presence
    // returns err in callback
    sendStopTypingPresence(topicID, callback) {
        var action = getSendTypingURL(this.userID, topicID)
        var body = {
            "what": "typing",
            "start": false
        }
        $.ajax({
            url: action.url,
            method: action.method,
            contentType: "application/json",
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            data: JSON.stringify(body),
            success(e) {
                // return null
                callback(null)
            },
            error(xhr) {
                // return error
                callback(xhr.responseJSON.err)
            }
        })
    }

    // sendTextMessage is used for sending message to topic
    // returns message & err in callback
    sendTextMessage(topicID, txtMessage, callback) {
        var action = getSendMessageURL(this.userID, topicID)
        var body = {
            "content": {
                "type": "text/plain",
                "payload": {
                    "text": txtMessage
                }
            }
        }
        $.ajax({
            url: action.url,
            method: action.method,
            contentType: "application/json",
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            data: JSON.stringify(body),
            success(e) {
                // returns message
                callback(e.data.message, null)
            },
            error(xhr) {
                // returns error
                callback(null, xhr.responseJSON.err)
            }
        })
    }

    // hideTopic is used for hiding topic
    // returns err in callback
    hideTopic(topicID, callback) {
        var action = getHideTopicURL(this.userID, topicID)
        $.ajax({
            url: action.url,
            method: action.method,
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            success(e) {
                // returns null
                callback(null)
            },
            error(xhr) {
                // returns error
                callback(xhr.responseJSON.err)
            }
        })
    }

    // updateAvatar is used for updating user's avatar
    // returns err in callback
    updateAvatar(avatarURL, callback) {
        var action = getUpdateAvatarURL(this.userID)
        var body = {
            "what": "update_avatar",
            "avatar": avatarURL
        }
        $.ajax({
            url: action.url,
            method: action.method,
            contentType: "application/json",
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            data: JSON.stringify(body),
            success(e) {
                // returns null
                callback(null)
            },
            error(xhr) {
                // returns error
                callback(xhr.responseJSON.err)
            }
        })
    }

    // updateDevice is used for updating user's device
    // returns err in callback
    updateDevice(token, platform, callback) {
        var action = getUpdateAvatarURL(this.userID)
        var body = {
            "what": "update_device",
            "device": {
                "token": token,
                "platform": platform
            }
        }
        $.ajax({
            url: action.url,
            method: action.method,
            contentType: "application/json",
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            data: JSON.stringify(body),
            success(e) {
                // returns null
                callback(null)
            },
            error(xhr) {
                // returns error
                callback(xhr.responseJSON.err)
            }
        })
    }

    // findUsers is used for finding user id by username
    // return users & err in callback
    findUsers(usernames, callback) {
        var action = getFindUsersURL(usernames)
        $.ajax({
            url: action.url,
            method: action.method,
            headers: {
                "Authorization": `Bearer ${this.accessToken}`
            },
            success(e) {
                // returns users
                callback(e.data.users, null)
            },
            error(xhr) {
                // returns error
                callback(null, xhr.responseJSON.err)
            }
        })
    }
}