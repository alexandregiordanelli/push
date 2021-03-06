import React, { useState, useEffect } from 'react'
import { firechat } from './lib/Firechat'

import {
    Text,
    SectionList,
    StyleSheet,
    TouchableOpacity,
    PixelRatio,
    TextInput,
    SafeAreaView,
    Alert,
} from 'react-native'

import moment from 'moment'
import "moment/locale/pt-br"

import { useStateValue } from './State';
import { Message, MessageListCursor, ActionType, Screen } from './Models'
import { Keyboard, View, ConnectionStatusBar, Colors, Modal } from 'react-native-ui-lib'
import { firebase } from '@react-native-firebase/auth'

const offset = 20 + 44

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
        <View style={styles.inputContainer}>
            <TextInput style={styles.textInput} multiline={true} onChangeText={text => setMsgText(text)} value={msgText} />
            <TouchableOpacity style={styles.sendButton} onPress={async () => await onSend([{ text: msgText } as Message])}>
                <Text>Enviar</Text>
            </TouchableOpacity>
        </View>
    )
}

export default () => {
    const initMessageListCursor: MessageListCursor = {
        cursor: firebase.firestore.Timestamp.now(),
        messages: []
    }

    const [messageList, setMessageList] = useState<Message[]>([])
    const [sessionMessageList, setSessionMessageList] = useState<SectionMessage[]>([])
    const [position, setPosition] = useState(initMessageListCursor)
    const [endOfChat, setEndOfChat] = useState(false)
    const [state, dispatch] = useStateValue();

    const { room } = state


    useEffect(() => {
        if (!room?.id) return

        const unsubscribe = firechat.getOnMessages(room.id, (_position: MessageListCursor) => {
            setPosition(_position)
        })

        return () => {
            if (unsubscribe)
                unsubscribe()
        }
    }, [])

    useEffect(() => {
        const filteredPositionMessages = position.messages.filter(y => !(messageList.length > 0 && messageList.some(x => x.id == y.id)))
        const newMsgList = messageList.concat(filteredPositionMessages).sort((a, b) => a.createdAt > b.createdAt ? -1 : a < b ? 1 : 0)
        setMessageList(newMsgList)
        setSessionMessageList(splitToSections(newMsgList))
        if (!position.cursor) {
            setEndOfChat(true)
        }
    }, [position, endOfChat])


    const onLoadEarlier = async () => {
        if (position.cursor && !endOfChat) {
            const _position = await firechat.getMessages(room!.id!, position.cursor)
            setPosition(_position)
        } else if (position.cursor) {
            setPosition({
                ...initMessageListCursor,
                cursor: null
            })
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

    return (
        <>
            {/* <View useSafeArea/> */}
            <Modal.TopBar
                title={firechat.getAnotherUid(room!)}
                onCancel={() => dispatch({
                    type: ActionType.ChangeScreen,
                    screen: Screen.Rooms,
                    room: undefined
                })}
                cancelButtonProps={{ iconStyle: { tintColor: Colors.orange30 } }}
            />
            {/* <SafeAreaView> */}
            <SectionList<Message>
                inverted={true}
                // contentInsetAdjustmentBehavior='scrollableAxes'
                onEndReached={onLoadEarlier}
                onEndReachedThreshold={0.4}
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
            <View useSafeArea />
            {/* </SafeAreaView> */}
            <Keyboard.KeyboardAccessoryView
                renderContent={() => <KeyboardAccessoryViewContent roomId={room?.id!} />}
                trackInteractive={true}
                requiresSameParentToManageScrollView={true}
                scrollIsInverted={true}
                revealKeyboardInteractive={false}
            />
        </>
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
        // backgroundColor: '#eee',
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
        backgroundColor: '#eee',
    },
    right: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.yellow50,
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
        backgroundColor: 'white'
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
        // backgroundColor: 'gray',
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