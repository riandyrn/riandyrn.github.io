const LOGIN_PAGE_STATE = 0
const MAIN_PAGE_STATE = 1

var app = new Vue({
    el: '#app',
    data: {
        currentPageState: LOGIN_PAGE_STATE,
        inUsername: "",
        inPassword: "",
        inMessage: "",
        inFindUsers: "",
        chatAPI: new ChatAPI(),
        chatWsAPI: new ChatWsAPI(),
        ws: null,
        userID: 0,
        activeTopicID: "",
        topicPosMap: {}, // used for holding topic index in topic list, mainly used for updating view from packet
        topicDataMap: {}, // used for holding resolve topic result, in simple terms it is a cache
        topicLastKey: "",
        topics: [],
        messagePosMap: {},
        messageLastKey: "",
        messages: [],
        contacts: []
    },
    methods: {
        submitLogin() {
           this.chatAPI.userBasicLogin(this.inUsername, this.inPassword, (userID, accessToken, err) => {
                // check if login successful
                if (err != null) {
                    alert(err)
                    return
                }
                // set userID
                this.userID = userID
                // get latest topics
                this.getLatestTopics()
                // initialize websocket
                this.initializeWebsocket(accessToken)
                // change page state to main page
                this.currentPageState = MAIN_PAGE_STATE
           })
           this.inUsername = ""
           this.inPassword = ""
       },
       initializeWebsocket(accessToken) {
            this.chatWsAPI = new ChatWsAPI()
            // authenticate socket connection & attach packet handler
            // this handler is used for handling upcoming packet or error
            // it's different from concept of callback
            this.chatWsAPI.authenticateConnection(accessToken, (packet, err) => {
                // if handler receive error, socket connection will 
                // immediately closed, hence handler will no longer
                // receive error & packet
                if (err != null) {
                    alert(err)
                    return
                }
                console.log(`receiving packet: ${JSON.stringify(packet)}`)
                // handle packet, currently only handle message packet
                if (packet.message != null) {
                    var topicID = packet.message.topic_id
                    // check if topic exist
                    var topicIndex = this.topicPosMap[topicID]
                    // if topic not exist create new topic
                    if (topicIndex === undefined) {
                        this.createNewTopicFromPacketMessage(packet.message)
                    }
                    // push topic to top
                    this.pushTopicToFirst(topicID)
                    // update last message for that topic
                    this.updateTopicLastMessage(topicID, packet.message)

                    return
                }
                if (packet.reads != null) {
                    // check if originating topic is active topic
                    var topicID = packet.reads.topic_id
                    if (this.activeTopicID !== topicID) {
                        return
                    }
                    // update message status
                    for (var i = 0; i < packet.reads.seq_ids.length; i++) {
                        var seqID = packet.reads.seq_ids[i]
                        var fromID = packet.reads.from_id
                        var msgIndex = this.messagePosMap[`${seqID}`]
                        var msg = this.messages[msgIndex]

                        msg.status[`${fromID}`] = true
                    }
                }
            })
       },
       createNewTopicFromPacketMessage(packetMsg) {
            var topic = {
                "topic_id": packetMsg.topic_id,
                "title": packetMsg.name,
                "last_message": {},
                "last_updated": packetMsg.ts
            }
            // add topic
            this.topics.unshift(topic)
            // update topicPosMap
            var topicPosMap = {}
            for (var i = 0; i < this.topics.length; i++) {
                topicPosMap[this.topics[i].topic_id] = i
            }
            this.topicPosMap = topicPosMap
       },
       getLatestTopics() {
           // define function for progressively fetch latest topics 
           // until 8 topics, callback return topics
           var MIN_TOPICS_FETCHED = 8
           var MAX_TOPICS_RESOLVED_AT_ONCE = 4
           var allTopics = []
           var self = this
           var getLatestTopics = function(lastKey, callback) {
               self.chatAPI.getLatestTopics(lastKey, (topics, lastKey, err) => {
                    // stop fetch topics if encountering error
                    if (err != null) {
                        alert(err)
                        callback(allTopics)
                        return
                    }
                    // append fetched topics to allTopics
                    allTopics = allTopics.concat(topics)
                    // if last key is empty return
                    if (!lastKey) {
                        callback(allTopics)
                        return
                    }
                    // if number of topics reached threshold, return
                    if (allTopics.length >= MIN_TOPICS_FETCHED) {
                        self.topicLastKey = lastKey
                        callback(allTopics)
                        return
                    }

                    // fetch more topics
                    getLatestTopics(lastKey, callback)
               })
           }
           // progressively fetch latest topics
           getLatestTopics("", (topics) => {
                // build queue & position map
                var queue = []
                var topicPosMap = {}
                for (var i = 0; i < topics.length; i++) {
                    var topicID = topics[i].topic_id
                    queue.push(topicID)
                    topicPosMap[topicID] = i
                }
                // define function for progressively resolve topics
                var resolveTopics = function(callback) {
                    // stop resolving topics once queue is empty
                    if (queue.length == 0) {
                        callback()
                        return
                    }
                    // fetch max 4 topic id from queue to be resolved
                    var toProcess = queue.splice(0, MAX_TOPICS_RESOLVED_AT_ONCE)
                    self.chatAPI.resolveTopics(toProcess, (metas, err) => {
                        // skip if error
                        if (err != null) {
                            // embed metas to topics
                            for (var i = 0; i < metas.length; i++) {
                                // get topic index
                                var idx = topicPosMap[metas[i].topic_id]
                                // embed meta topic
                                topics[idx].avatar = metas[i].avatar
                            }
                        }
                        // recall resolve topics
                        resolveTopics(callback)
                    })
                }
                // progressively resolve topics
                resolveTopics(() => {
                    // in new loaded topic, there shouldn't be any
                    // overlapping topics, thus we could use assumption
                    // that all topics will be new

                    // update main topicPosMap
                    var initTopicPosMapLen = Object.keys(this.topicPosMap).length
                    for (var topicID in topicPosMap) {
                        this.topicPosMap[topicID] = initTopicPosMapLen + topicPosMap[topicID]
                    }
                    // append topics to main topics
                    this.topics = this.topics.concat(topics)
                })
           })
       },
       formatTopicTimestamp(tsRFC) {
            return moment(tsRFC).format("DD/MM/YYYY")
       },
       getTopicShortMessage(topicIndex) {
            var lastMessage = this.topics[topicIndex].last_message
            if (lastMessage) {
                return lastMessage.short
            }
            return ""
       },
       getTopicUnread(topicIndex) {
            var topic = this.topics[topicIndex]
            if (topic.unread > 9) {
                return "9"
            }
            return `${topic.unread}`
       },
       loadTopic(topicIndex) {
           // deactivate previous active topic if any
           if (this.activeTopicID) {
                var prevActiveTopicIndex = this.topicPosMap[this.activeTopicID]
                this.topics[prevActiveTopicIndex].active = false
           }
           // get topicID
           var topicID = this.topics[topicIndex].topic_id
           // set active topicID to this topicID
           this.activeTopicID = topicID
           this.topics[topicIndex].active = true
           // define function for progressively fetch latest messages from server
           var self = this
           var allMessages = []
           var MIN_MESSAGES_FETCHED = 20
           var getLatestMessages = function(lastKey, callback) {
                self.chatAPI.getLatestMessages(topicID, lastKey, (messages, lastKey, err) => {
                    // if error, immediately return
                    if (err != null) {
                        alert(err)
                        callback(allMessages, lastKey)
                        return
                    }
                    // append messages to allMessages
                    allMessages = messages.concat(allMessages)
                    // check if lastKey is empty
                    if (!lastKey) {
                        callback(allMessages, lastKey)
                        return
                    }
                    // check if number of messages fetched is enough
                    if (allMessages.length >= MIN_MESSAGES_FETCHED) {
                        callback(allMessages, lastKey)
                        return
                    }
                    // fetch more messages
                    getLatestMessages(lastKey, callback)
                })
           }
           // fetch latest messages progressively from server
           getLatestMessages("", (messages, lastKey) => {
               // reset unread counter in view
               this.topics[topicIndex].unread = 0
               // set messages to view
               this.messages = messages
               this.messageLastKey = lastKey
               // reinitialize messagePosMap
               this.messagePosMap = {}

               // get unconfirmed messages & fill messagePosMap
               var queue = []
               for (var i = 0; i < messages.length; i++) {
                   var msg = messages[i]
                   if (!msg.status[`${this.userID}`]) {
                        // fill the queue
                        queue.push(msg.seq_id)
                   }
                   // update messagePosMap
                   this.messagePosMap[msg.seq_id] = i
               }
               // define confirm reads recursive func for
               // confirming reads partially
               var self = this
               var confirmReads = function(callback){
                    // if queue is empty, return immediately
                    if (queue.length == 0) {
                        callback()
                        return
                    }
                    // fetch max 2 item from queue
                    var toProcess = queue.splice(0, 2)
                    self.chatAPI.confirmReads(topicID, toProcess, (successIDs, failedIDs, err) => {
                        // in this demo we doesn't care about the calling 
                        // result, however in production, it should
                        confirmReads(callback)
                    })
               }
               // confirm read messages
               confirmReads(() => {
                   // do nothing
                   return
               })
           })
       },
       resolveActiveTopicTitle() {
            var topicID = this.activeTopicID
            var topicIndex = this.topicPosMap[topicID]
            var topic = this.topics[topicIndex]
            if (topic) {
                return topic.title
            }
            return ""
       },
       isOwnMessage(messageIndex) {
            return this.messages[messageIndex].from_id === this.userID
       },
       formatMessageTimestamp(tsRFC) {
            return moment(tsRFC).format("MMM DD, HH:mm")
       },
       getMessagePayload(messageIndex) {
           var message = this.messages[messageIndex]
           var payload = message.content.payload
           if (payload) {
                return payload.text
           }
           return ""
       },
       isMessageRead(messageIndex) {
           var message = this.messages[messageIndex]
           var peerID = ParsePeerID(this.activeTopicID, this.userID)
           if (message.status[`${peerID}`]) {
               return true
           }
           return false
       },
       sendMessage() {
           // send message
           this.chatAPI.sendTextMessage(this.activeTopicID, this.inMessage, (msg, err) => {
               if (err != null) {
                   alert(err)
                   return
               }
               // push topic to first
               this.pushTopicToFirst(this.activeTopicID)
               // update last message
               this.updateTopicLastMessage(this.activeTopicID, msg)
           })
           this.inMessage = ""
       },
       pushTopicToFirst(topicID) {
            var pos = this.topicPosMap[topicID]
            // check if topic already on top
            if (pos == 0) {
                return
            }
            // get topic from topic list
            var topic = this.topics[pos]
            // delete topic from topic list
            this.topics.splice(pos, 1)
            // push topic forward
            this.topics.unshift(topic)
            // update topic pos map
            var topicPosMap = {}
            for (var i = 0; i < this.topics.length; i++) {
                var topic = this.topics[i]
                topicPosMap[topic.topic_id] = i
            }
            this.topicPosMap = topicPosMap
       },
       // updateTopicLastMessage will be called on sendMessage()
       // & packetHandler in websocket
       updateTopicLastMessage(topicID, msg) {
            var pos = this.topicPosMap[topicID]
            var topic = this.topics[pos]
            // update last message
            topic.last_message = {
                "from_id": msg.from_id,
                "name": msg.name,
                "type": msg.content.type,
            }
            if (msg.content.type === "text/plain") {
                var short = msg.content.payload.text
                if (short.length > 20) {
                    short = short.substring(0, 20) + "..."
                }
                topic.last_message.short = short
            }
            topic.last_updated = moment().utc().format()
            // increment unread counter if necessary
            if (msg.from_id !== this.userID && topicID !== this.activeTopicID) {
                if (!topic.unread) {
                    topic.unread = 1
                } else {
                    topic.unread++
                }
            }
            // check if originating topic is active topic
            if (topicID === this.activeTopicID) {
                // update current messagePosMap
                this.messagePosMap[msg.seq_id] = this.messages.length
                // append message to messages
                this.messages.push(msg)    
                // confirm read this message
                this.chatAPI.confirmReads(topicID, [msg.seq_id], () => {
                    // do nothing
                    return
                })
            }
       },
       deleteMessage(msgIndex) {
           // get seqID
           var seqID = this.messages[msgIndex].seq_id
           // delete message from server
           this.chatAPI.deleteMessage(this.activeTopicID, seqID, (err) => {
               if (err != null) {
                   alert(err)
                   return
               }
               // remove message
               this.messages.splice(msgIndex, 1)
               // update messagePosMap
               var messagePosMap = {}
               for (var i = 0; i < this.messages.length; i++) {
                   var seqID = this.messages[i].seq_id
                   messagePosMap[seqID] = i
               }
               this.messagePosMap = messagePosMap
           })   
       },
       hideTopic(topicIndex) {
           alert("Not implemented in this demo")
           /*// get topicID
           var topicID = this.topics[topicIndex].topic_id
           // hide topicID
           this.chatAPI.hideTopic(topicID, (err) => {
               if (err != null) {
                   alert(err)
                   return
               }
               // delete from view
               this.topics.splice(topicIndex, 1)
               // update topicPosMap
               var topicPosMap = {}
               for (var i = 0; i < this.topics.length; i++) {
                    var topicID = this.topics[i].topic_id
                    topicPosMap[topicID] = i 
               }
               this.topicPosMap = topicPosMap
           })*/    
       },
       findUsers() {
            var usernames = this.inFindUsers.split(",").map(username => {return username.trim()})
            this.chatAPI.findUsers(usernames, (contacts, err) => {
                if (err != null) {
                    alert(err)
                    return
                }
                // update contacts in view
                this.contacts = contacts
            })
       },
       startP2PChat(withID) {
           // start p2p topic
           this.chatAPI.startP2PTopic(withID, (topic, err) => {
               if (err != null) {
                   alert(err)
                   return
               }
               // hide modal
               $('#modal_start_chat').modal('hide')
               // add new topic to topics
               this.addThenLoadTopic(topic)
           })
       },
       addThenLoadTopic(topic) {
            // check if topic is already exist
            var topicIndex = this.topicPosMap[topic.topic_id]
            if (topicIndex !== undefined) {
                // load existing topic
                this.loadTopic(topicIndex)
                return
            }
            // push new topic to first
            topic.last_message = {}
            this.topics.unshift(topic)
            // update topicPosMap
            var topicPosMap = {}
            for (var i = 0; i < this.topics.length; i++) {
                topicPosMap[this.topics[i].topic_id] = i
            }
            this.topicPosMap = topicPosMap
            // load topic
            this.loadTopic(0)
       },
       applyUpdateViewToDOM() {
           // do necessary update to DOM, like:
           // - scroll messages to bottom
           // - set focus to input
           //
           // will be called on mounted() & update()

           // if one of the topic loaded, scroll message list
           // to bottom
           if (this.currentPageState === MAIN_PAGE_STATE) {
                if (this.activeTopicID) {
                    // scroll to bottom
                    var container = this.$refs.messages
                    container.scrollTop = container.scrollHeight
                    // set focus to message input
                    //this.$refs.message.focus()
                }
           } else if (this.currentPageState === LOGIN_PAGE_STATE) {
                if (this.$refs.username.value === "") {
                    // set focus to username input
                    this.$refs.username.focus()
                }
           }
       }
    },
    computed: {
        shouldShowLoginPage() {
            return this.currentPageState === LOGIN_PAGE_STATE
        },
        shouldShowMainPage() {
            return this.currentPageState === MAIN_PAGE_STATE
        },
        shouldShowNoTopicSelected() {
            return this.activeTopicID === ""
        },
        shouldShowTopicSelected() {
            return this.activeTopicID !== ""
        }
    },
    mounted() {
        this.applyUpdateViewToDOM()
    },
    updated() {
        this.applyUpdateViewToDOM()
    }
})

// ParsePeerID is used for parsing peerID from p2p topicID
function ParsePeerID(topicID, userID) {
    // parse userID from p2p topicID
    var userIDs = topicID.substring(3).split("_")
    if (userIDs.length !== 2) {
        return 0
    }
    // determine peerID
    if (userIDs[0] == userID) {
        return userIDs[1]
    }
    return userIDs[0]
}