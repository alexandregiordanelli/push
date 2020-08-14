import React, { useState, useEffect } from 'react';
import { FlatList } from 'react-native';
import { ContactItem } from './ContactItem';
import { firechat } from './Firechat';
import { Room } from './Models';
import MessageItem from './MessageItem';

export default () => {

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

    return (
        <FlatList
            data={rooms}
            renderItem={({ item }) => {
                return <ContactItem room={item} />
            }}
            keyExtractor={(item, index) => `${item.id}-${index}`}
        />
    );
}