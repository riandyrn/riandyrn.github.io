var cAPI = new ChatAPI()

// test userBasicLogin
cAPI.userBasicLogin("root242", "root242**", (userID, accessToken, err) => {
    if (err != null) {
        console.log(`userBasicLogin, err: ${err}`)
    } else {
        console.log(`userBasicLogin success, userID: ${userID}, accessToken: ${accessToken}`)

        // test refreshAccessToken
        cAPI.refreshAccessToken((err) => {
            if (err != null) {
                console.log(`refreshAccessToken, err: ${err}`)
            } else {
                console.log("refreshAccessToken succeed")
                
                // test getLatestTopics
                cAPI.getLatestTopics("", (topics, lastKey, err) => {
                    if (err != null) {
                        console.log(`getLatestTopics, err: ${err}`)
                    } else {
                        console.log(`getLatestTopics succeed, topics: ${JSON.stringify(topics)}, lastKey: ${lastKey}`)
                        
                        // test getLatestTopics with lastKey
                        cAPI.getLatestTopics(lastKey, (topics, lastKey, err) => {
                            if (err != null) {
                                console.log(`getLatestTopics with lastKey, err: ${err}`)
                            } else {
                                console.log(`getLatestTopics with lastKey succeed, topics: ${JSON.stringify(topics)}, lastKey: ${lastKey}`)
                                
                                // test resolveTopics
                                topicIDs = ["p2p1_2", "p2p2_122"]
                                cAPI.resolveTopics(topicIDs, (topics, err) => {
                                    if (err != null) {
                                        console.log(`resolveTopics, err: ${err}`)
                                    } else {
                                        console.log(`resolveTopics succeed, topics: ${JSON.stringify(topics)}`)
                                        
                                        // test startP2PTopic
                                        cAPI.startP2PTopic(1, (topicID, err) => {
                                            if (err != null) {
                                                console.log(`startP2PTopic, err: ${err}`)
                                            } else {
                                                console.log(`startP2PTopic succeed, topicID: ${topicID}`)

                                                // test getLatestMessages
                                                var topicID = "p2p2_122"
                                                cAPI.getLatestMessages(topicID, "", (messages, lastKey, err) => {
                                                    if (err != null) {
                                                        console.log(`getLatestMessages, err: ${err}`)
                                                    } else {
                                                        console.log(`getLatestMessages, messages: ${JSON.stringify(messages)}, lastKey: ${lastKey}`)

                                                        // test confirmReads
                                                        cAPI.confirmReads(topicID, [messages[0].seq_id], (successIDs, failedIDs, err) => {
                                                            if (err != null) {
                                                                console.log(`confirmReads, err: ${err}`)
                                                            } else {
                                                                console.log(`confirmReads succeed, successIDs: ${JSON.stringify(successIDs)}, failedIDs: ${JSON.stringify(failedIDs)}`)

                                                                // test deleteMessage
                                                                cAPI.deleteMessage(topicID, [messages[0].seq_id], (err) => {
                                                                    if (err != null) {
                                                                        console.log(`deleteMessage, err: ${err}`)
                                                                    } else {
                                                                        console.log(`deleteMessage succeed`)

                                                                        // test sendTypingPresence
                                                                        cAPI.sendTypingPresence(topicID, (err) => {
                                                                            if (err != null) {
                                                                                console.log(`sendTypingPresence, err: ${err}`)
                                                                            } else {
                                                                                console.log(`sendTypingPresence succeed`)

                                                                                // test sendStopTypingPresence
                                                                                cAPI.sendStopTypingPresence(topicID, (err) => {
                                                                                    if (err != null) {
                                                                                        console.log(`sendStopTypingPresence, err: ${err}`)
                                                                                    } else {
                                                                                        console.log(`sendStopTypingPresence succeed`)

                                                                                        // test sendTextMessage
                                                                                        cAPI.sendTextMessage(topicID, "Hello World! This is from js test!", (seqID, content, err) => {
                                                                                            if (err != null) {
                                                                                                console.log(`sendTextMessage, err: ${err}`)
                                                                                            } else {
                                                                                                console.log(`sendTextMessage succeed, seqID: ${seqID}, content: ${JSON.stringify(content)}`)

                                                                                                // test hideTopic
                                                                                                cAPI.hideTopic("p2p1_2", (err) => {
                                                                                                    if (err != null) {
                                                                                                        console.log(`hideTopic, err: ${err}`)
                                                                                                    } else {
                                                                                                        console.log(`hideTopic succeed`)

                                                                                                        // test updateAvatar
                                                                                                        cAPI.updateAvatar("https://someurl.com/riandyrn.jpg", (err) => {
                                                                                                            if (err != null) {
                                                                                                                console.log(`updateAvatar, err: ${err}`)
                                                                                                            } else {
                                                                                                                console.log(`updateAvatar succeed`)

                                                                                                                // test updateDevice
                                                                                                                cAPI.updateDevice("this is token", "Android", (err) => {
                                                                                                                    if (err != null) {
                                                                                                                        console.log(`updateDevice, err: ${err}`)
                                                                                                                    } else {
                                                                                                                        console.log(`updateDevice succeed`)

                                                                                                                        // test findUsers
                                                                                                                        cAPI.findUsers(["root", "root242"], (users, err) => {
                                                                                                                            if (err != null) {
                                                                                                                                console.log(`findUsers, err: ${err}`)
                                                                                                                            } else {
                                                                                                                                console.log(`findUsers succeed, users: ${JSON.stringify(users)}`)
                                                                                                                            }
                                                                                                                        })
                                                                                                                    }
                                                                                                                })
                                                                                                            }
                                                                                                        })
                                                                                                    }
                                                                                                })
                                                                                            }
                                                                                        })
                                                                                    }
                                                                                })
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})