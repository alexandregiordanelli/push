import React, { useEffect, useState } from "react";
import { Button, Text, View, TextArea, Colors } from "react-native-ui-lib";
import { firechat } from "./lib/Firechat";
import { User, Message } from "./Models";

export default () => {

    const [targetList, setTargetList] = useState<User[]>([])
    const [msgText, setMsgText] = useState('')

    useEffect(()=> {
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
        <View>
            <View
            style={{
            height: 150,
            borderWidth: 1,
            borderColor: Colors.dark60
            }}
            >
                <TextArea placeholder="Write something.." onChangeText={x => setMsgText(x)} value={msgText}/>
            </View>
            {targetList.map((target, i) => {
                return <Text key={i} center>{target.geohash} {target.distance}</Text>
            })}
            <Button
                label={'Push'}
                size={Button.sizes.small}
                onPress={pushMessage}
            />
      </View>
    )
}
