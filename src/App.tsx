import React, { useEffect } from "react";
import ConversationList from "./ConversationList";
import { View } from "react-native";
import { Button } from "react-native-ui-lib";
import Chat from "./Chat";

import { firechat } from "./lib/Firechat";
import { ActionType, Screen, User } from "./Models";
import { StateProvider, useStateValue } from "./State";

import auth from '@react-native-firebase/auth';
import Login from "./Login";
import Main from "./Main";
import Geolocation from '@react-native-community/geolocation';

const App = () => {
    const [state, dispatch] = useStateValue();

    useEffect(()=>{
        Geolocation.getCurrentPosition(info => {
            dispatch({
                type: ActionType.ChangeLocation,
                position: info
            })
        });

        auth().onAuthStateChanged(async user => {
            if (user) {
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

                }  else {
                    dispatch({
                        type: ActionType.ChangeScreen,
                        screen: Screen.SignUp
                    })
                }
                    //await firechat.updateUserLocation(state.position.coords.latitude, state.position.coords.longitude)

            } else {
                dispatch({
                    type: ActionType.ChangeScreen,
                    screen: Screen.Login
                })

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
        view = <Main/>
    else if (state.screen == Screen.Room)
        view = <Chat/>
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