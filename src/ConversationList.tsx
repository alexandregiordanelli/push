import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Alert, ImageURISource, StatusBar } from 'react-native';
import { ContactItem } from './ContactItem';
import { firechat } from './lib/Firechat';
import { Room, User, Message } from './Models';
import { View, PageControl, Carousel, Modal, Colors, ThemeManager } from 'react-native-ui-lib';
import { UserItem } from './UserItem';
import { useStateValue } from './State';
import Chat from './Chat';

export default () => {

    const [state, dispatch] = useStateValue();
    const [page, setPage] = useState(0) 
    const [rooms, setRooms] = useState<Room[]>([])

    useEffect(() => {
        const unsubscribe = firechat.getOnRooms((rooms) => {
            setRooms(rooms)
        })

        return () => {
            if (unsubscribe)
                unsubscribe()
        }
    }, [])

    const [targetList, setTargetList] = useState<User[]>([])
    const [msgText, setMsgText] = useState('')

    useEffect(() => {
        firechat.getUsersNearby(4.6 * 1000).then(userList => {
            setTargetList(userList.filter(x => x.id != firechat.user?.id))
        })
    }, [])

    const pushMessage = async () => {
        const createRoomList = targetList.map(x => firechat.createRoom(x.id))
        const roomIdList = await Promise.all(createRoomList)
        roomIdList.forEach(x => firechat.createMessages(x, [{ text: msgText } as Message]))
    }

    return (

        <>
            <StatusBar translucent backgroundColor={Colors.rgba("#000000",0)} barStyle='dark-content' />
            <Carousel containerStyle={{ flex: 1, backgroundColor: Colors.yellow80 }} onChangePage={x => setPage(x)}>
                <View bg-green80 flex>
                    <Modal.TopBar
                    
                        title='Nearby me'
                        includeStatusBar={true}
                    />
                    <FlatList
                        data={targetList}
                        renderItem={({ item }) => {
                            return <UserItem user={item} />
                        }}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                    />
                </View>
                <View bg-blue80 flex>
                    <Modal.TopBar
                        title='Conversations'
                        includeStatusBar={true}
                    />
                    <FlatList
                        data={rooms}
                        renderItem={({ item }) => {
                            return <ContactItem room={item} />
                        }}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                    />
                </View>
            </Carousel>
            {state.room?.id && <Modal visible={!!state.room?.id}><Chat/></Modal>}
        </>

    );
}

const styles = StyleSheet.create({
    border: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: ThemeManager.dividerColor,
        paddingRight: 17
    },
    pageControl: {
        zIndex: 1
    },
    absoluteContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 0
    }
});
