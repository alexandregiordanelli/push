import React, { useState, useEffect } from 'react'
import { firechat } from './lib/Firechat'

import {
    Text,
    SectionList,
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    PixelRatio,
    InputAccessoryView,
    TextInput,
} from 'react-native'

import moment from 'moment'
import "moment/locale/pt-br"

import { useStateValue } from './State';
import { Message, Cursor } from './Models'
import { Keyboard } from 'react-native-ui-lib'


type SectionMessage = {
    title: string,
    data: Message[]
}

const KeyboardAccessoryViewContent = ({ roomId }: { roomId: string }) => {
    const [msgText, setMsgText] = useState('')

    const onSend = async (messages: Message[]) => {
        setMsgText('')
        if (messages.some(x => x.text.trim() == "")) return

        firechat.createMessages(roomId, messages)
    }

    return (
        // <InputAccessoryView >
            <View style={styles.inputContainer}>
                <TextInput style={styles.textInput} multiline={true} onChangeText={text => setMsgText(text)} value={msgText} />
                <TouchableOpacity style={styles.sendButton} onPress={async () => await onSend([{ text: msgText } as Message])}>
                    <Text>Enviar</Text>
                </TouchableOpacity>
            </View>
        // </InputAccessoryView>
    )
}

export default () => {
    const cursor: Cursor = null
    const offset = 44 + 20

    const [messageList, setMessageList] = useState<Message[]>([])
    const [sessionMessageList, setSessionMessageList] = useState<SectionMessage[]>([])
    const [loadEarlier, setLoadEarlier] = useState(false)
    const [isLoadingEarlier, setIsLoadingEarlier] = useState(false)

    const [state] = useStateValue();

    const { roomId } = state

    useEffect(() => {
        console.log(state)
        if (!roomId) return

        const unsubscribe = firechat.getOnMessages(roomId, (position) => {
            //const newMessages = messages.concat(this.state.messages)
            storeMessages(position.messages, position.cursor)
        })

        return () => {
            if (unsubscribe)
                unsubscribe()
        }
    }, [roomId])


    const onLoadEarlier = async () => {
        setIsLoadingEarlier(true)
        const position = await firechat.getMessages(roomId!, cursor)
        if (position) {
            const newMessages = position.messages.concat(messageList)
            storeMessages(newMessages, position.cursor)
        }
    }

    const splitToSections = (messages: Message[]) => {
        let sectionListData: SectionMessage[] = []
        for (let message of messages) {
            const title = moment(message.createdAt.toDate()).calendar(null, {
                sameDay: '[Hoje]',
                lastDay: '[Ontem]',
                lastWeek: 'dddd',
                sameElse: 'DD/MM/YYYY'
            })
            let hasTitle = sectionListData.findIndex(x => x.title == title)

            if (hasTitle >= 0) {
                sectionListData[hasTitle].data.push(message)
            } else {
                sectionListData.push({
                    data: [message],
                    title
                })
            }
        }
        return sectionListData
    }

    const storeMessages = (messages: Message[], cursor: Cursor) => {
        let loadEarlier = false
        if (cursor)
            loadEarlier = true
        setMessageList(messages)
        setSessionMessageList(splitToSections(messages))
        setLoadEarlier(loadEarlier)
        setIsLoadingEarlier(false)
        cursor = null
    }

    return (
        <React.Fragment>

            <SectionList<Message>
                style={{backgroundColor: '#eee'}}
                inverted={true}
                onEndReached={onLoadEarlier}
                // contentInset={{ bottom: offset }}
                keyboardDismissMode='interactive'
                renderSectionFooter={({ section }) => {
                    return (
                        <View style={styles.container}>
                            <Text style={styles.text2}>{section.title}</Text>
                        </View>
                    )
                }}
                sections={sessionMessageList}
                keyExtractor={(item, index) => index + item.createdAt.toDate().toString()}
                renderItem={({ item }) => {
                    const me = item.uid == (firechat.user?.id ?? "") ? 'right' : 'left'
                    return (
                        <View style={[styles.bubble, styles[me]]}>
                            <Text style={styles.text}>{item.text}</Text>
                            <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'flex-end', height: 18, marginRight: me == "right" ? 8 : 0 }}>
                                <Text style={styles.time}>{moment(item.createdAt.toDate()).format("HH:mm")}</Text>
                                {me == "right" && <React.Fragment>
                                    {/* {item.sent && <Icon name="ios-checkmark" size={14} color="blue" />} */}
                                    {/* {item.received && <Icon name="ios-checkmark" size={14} color="blue" />} */}
                                </React.Fragment>}
                            </View>
                        </View>
                    )
                }} />

            

            <Keyboard.KeyboardAccessoryView
                renderContent={() => <KeyboardAccessoryViewContent roomId={roomId!} />}
                trackInteractive={true}
                requiresSameParentToManageScrollView={true}
                scrollIsInverted={true}
                revealKeyboardInteractive={false}
            />

        </React.Fragment>
    )
}


const styles = StyleSheet.create({
    text: {
        color: 'black',
        margin: 8,
        fontSize: 16,
        lineHeight: 22,
    },
    container: {
        width: 100,
        borderRadius: 18,
        backgroundColor: '#eee',
        alignSelf: 'center',
        marginTop: 8
    },
    time: {
        color: 'black',
        fontSize: 11,
        marginRight: 4,
        marginBottom: 6,
    },
    left: {
        alignSelf: 'flex-start',
        backgroundColor: '#222',
    },
    right: {
        alignSelf: 'flex-end',
        backgroundColor: '#fc6157',
    },
    bubble: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        borderRadius: 5,
        maxWidth: 250,
        margin: 2,
    },
    text2: {
        color: 'black',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 28
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textInput: {
        flex: 1,
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 10,
        paddingLeft: 10,
        paddingTop: 2,
        paddingBottom: 5,
        fontSize: 16,
        backgroundColor: 'gray',
        // backgroundColor: '#666',
        borderWidth: 0.5 / PixelRatio.get(),
        borderRadius: 18,
    },
    sendButton: {
        paddingRight: 15,
        paddingLeft: 15,
        alignSelf: 'center',
    },
})