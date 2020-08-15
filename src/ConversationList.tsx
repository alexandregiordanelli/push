import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Alert, ImageURISource } from 'react-native';
import { ContactItem } from './ContactItem';
import { firechat } from './lib/Firechat';
import { Room, User, Message } from './Models';
import { View, PageControl, Carousel, Modal, Colors, ThemeManager } from 'react-native-ui-lib';
import { UserItem } from './UserItem';
import { useStateValue } from './State';
import Chat from './Chat';

export default () => {

    const [state, dispatch] = useStateValue();

    const [rooms, setRooms] = useState<Room[]>([])
    const [currentPage, setCurrentPage] = useState(0)

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
        firechat.getUsersNearby(10000).then(userList => {
            setTargetList(userList.filter(x => x.id != firechat.user?.id))
        })
    }, [])

    const pushMessage = async () => {
        const createRoomList = targetList.map(x => firechat.createRoom(x.id))
        const roomIdList = await Promise.all(createRoomList)
        roomIdList.forEach(x => firechat.createMessages(x, [{ text: msgText } as Message]))
    }

    return (

        <View flex>
            <PageControl
                containerStyle={[styles.pageControl, styles.absoluteContainer]}
                numOfPages={2}
                currentPage={currentPage}
                color={Colors.dark10}
                size={15}
            />
            <Carousel onChangePage={x => setCurrentPage(x)} containerStyle={{ flex: 1 }} >
                <>
                    <Modal.TopBar
                        title='Nearby me'
                    />
                    <FlatList
                        data={targetList}
                        renderItem={({ item }) => {
                            return <UserItem user={item} />
                        }}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                    />
                </>
                <>
                    <Modal.TopBar
                        title='Conversations'
                    />
                    <FlatList
                        data={rooms}
                        renderItem={({ item }) => {
                            return <ContactItem room={item} />
                        }}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                    />
                </>
            </Carousel>
            {state.room?.id && <Chat/>}
        </View>

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
