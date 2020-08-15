import React from 'react';
import { StyleSheet, ImageURISource } from 'react-native';
import { ThemeManager, Colors, ListItem, Text, Avatar, Button, AvatarHelper } from 'react-native-ui-lib';
import moment from 'moment'
import 'moment/locale/pt-br'
import { ActionType, Room, Screen } from './Models';
import { useStateValue } from './State';
import { firechat } from './lib/Firechat';

const renderTime = (timestamp: Date) => {
    const a = moment(timestamp)
    const diff = moment().diff(a, "days")
    if(diff == 0)
      return a.format("HH:mm")
    else if(diff == 1)
      return "Ontem"
    else if(diff < 8)
      return a.format("dddd").toLowerCase()
    return a.format("D/M/YYYY")
}

type ContactItemProps = {
    room: Room
};

export const ContactItem = ({room}: ContactItemProps) => {
    const notifications = room.notifications[firechat.user!.id]

    const [state, dispatch] = useStateValue();

    return (
        <ListItem
            height={75.8}
            onPress={()=>{
                dispatch({
                    type: ActionType.ChangeScreen,
                    screen: Screen.Rooms,
                    room: room
                })
            }}
        >
            <ListItem.Part left>
                <Avatar
                    size={54}
                    label={AvatarHelper.getInitials(room.anotherUser?.name ?? "Alexandre Giordanelli")}
                    containerStyle={styles.avatar} />
            </ListItem.Part>
            <ListItem.Part middle column containerStyle={styles.border}>
                <ListItem.Part containerStyle={styles.middle}>
                    <Text style={styles.text} text70 color={Colors.dark10} numberOfLines={1}>{room.anotherUser?.name ?? "Alexandre Giordanelli"}</Text>
                    <Text style={styles.subtitle} text90 color={Colors.dark50}>{renderTime(room.updatedAt.toDate())}</Text>
                </ListItem.Part>
                <ListItem.Part>
                    <Text style={styles.text} text80 color={Colors.dark40} numberOfLines={1}>{room.lastMessage}</Text>
                    {notifications > 0 && <Button backgroundColor={Colors.yellow50} size={Button.sizes.small} label={notifications.toString()} onPress={()=>{}} />}
                </ListItem.Part>
            </ListItem.Part>
        </ListItem>
    );
};

const styles = StyleSheet.create({
    border: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: ThemeManager.dividerColor,
        paddingRight: 17
    },
    avatar: {
        marginHorizontal: 18,
    },
    middle: {
        marginBottom: 3
    },
    text: {
        flex: 1,
        marginRight: 10
    },
    subtitle: {
        marginTop: 2
    }
});
