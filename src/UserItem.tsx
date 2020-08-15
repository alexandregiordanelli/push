import React from 'react';
import { StyleSheet } from 'react-native';
import { User } from './Models';
import { Text, Colors, ListItem, Avatar, AvatarHelper, ThemeManager } from 'react-native-ui-lib';

type UserItemProps = {
    user: User;
};

export const UserItem = ({ user }: UserItemProps) => {
    return (
        <ListItem
            onPress={() => { }}
        >
            <ListItem.Part left>
                <Avatar
                    label={AvatarHelper.getInitials(user.name ?? "Alexandre Giordanelli")}
                    badgeProps={{ backgroundColor: Colors.green30 }}
                    containerStyle={{ marginHorizontal: 18 }} />
            </ListItem.Part>
            <ListItem.Part middle containerStyle={styles.border}>
                <Text text70>Alexandre Giordanelli</Text>
                <Text text90 color={Colors.dark50}>{user.distance} m</Text>
            </ListItem.Part>
        </ListItem>

    );
};
export const styles = StyleSheet.create({
    border: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: ThemeManager.dividerColor,
        paddingRight: 17
    },
});
