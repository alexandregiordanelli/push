import React, { useEffect } from "react";
import ConversationList from "./ConversationList";
import { View, YellowBox } from "react-native";
import { Button } from "react-native-ui-lib";
import Chat from "./Chat";

import { firechat } from "./Firechat";
import { ActionType, Screen, User } from "./Models";
import { StateProvider, useStateValue } from "./State";

import auth from '@react-native-firebase/auth';
import Login from "./Login";
import { encodeGeohash } from "./Geofire";
import { firebase } from "@react-native-firebase/firestore";

// YellowBox.ignoreWarnings(['Setting a timer']);

// const _console = { ...console };
// console.warn = (message: string | string[]) => {
//     if (message.indexOf('Setting a timer') <= -1) {
//         _console.warn(message);
//     }
// };



const App = () => {
    const [state, dispatch] = useStateValue();

    useEffect(()=>{
        auth().onAuthStateChanged(async user => {
            if (user) {
                firechat.userLogged = true;
                const userDoc = await firechat.usersRef!.doc(user.uid).get()
                if (userDoc.exists) {
                    firechat.user = {
                        ...userDoc.data() as User,
                        id: userDoc.id
                    }

                    dispatch({
                        type: ActionType.ChangeScreen,
                        screen: Screen.Rooms
                    })
                } else {
                    const location = new firebase.firestore.GeoPoint(1, 1)
        
                    const userEntity: User = {
                        //avatar: user.photoURL ?? undefined,
                        //name: user.displayName ?? undefined,
                        id: user.uid,
                        geohash: encodeGeohash([location.latitude, location.longitude]),
                        location
                    }
                    await firechat.usersRef!.doc(user.uid).set(userEntity)
                    firechat.user = userEntity

                    dispatch({
                        type: ActionType.ChangeScreen,
                        screen: Screen.Rooms
                    })
                }
            } else {
                dispatch({
                    type: ActionType.ChangeScreen,
                    screen: Screen.Login
                })

                firechat.userLogged = false;
                firechat.user = undefined
            }
        })
    }, [])

    let view = null;
    if (state.screen == Screen.Rooms)
        view = <ConversationList/>
    else if (state.screen == Screen.Login)
        return <Login/>
    else if (state.screen  == Screen.Main)
        view = (
            <>
                {firechat && <Button
                    label={'Criar sala'}
                    size={Button.sizes.small}
                    onPress={async () => console.log(await firechat.createRoom("bDiNlvscpAQuLcbEvCtRKlfsX5y2"))}
                />}
            </>
        )
    else if (state.screen == Screen.Room)
        return <Chat/>
    return (
        <View>
            {firechat && <Button
                label={'Small'}
                size={Button.sizes.small}
                onPress={firechat.signOut}
            />}
            {view}
        </View>
    )
}

export default () => (
    <StateProvider>
        <App/>
    </StateProvider>
)