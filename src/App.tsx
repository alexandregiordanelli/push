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

        firechat.usersRef!.doc("sZYgdXOufvYGae3WaXVy95aE2zl1").get().then(user => {
            firechat.user = {
                ...user.data() as User,
               id: user.id
            }

            dispatch({
                type: ActionType.ChangeScreen,
                screen: Screen.Rooms
            })
        })
  
        
        // auth().onAuthStateChanged(async user => {
        //     if (user) {
        //         const userDoc = await firechat.usersRef!.doc(user.uid).get()
        //         if (userDoc.exists) {
        //             firechat.user = {
        //                 ...userDoc.data() as User,
        //                 id: userDoc.id
        //             }

        //             dispatch({
        //                 type: ActionType.ChangeScreen,
        //                 screen: Screen.Rooms
        //             })

        //         }  else {
        //             dispatch({
        //                 type: ActionType.ChangeScreen,
        //                 screen: Screen.SignUp
        //             })
        //         }
        //             //await firechat.updateUserLocation(state.position.coords.latitude, state.position.coords.longitude)

        //     } else {
        //         dispatch({
        //             type: ActionType.ChangeScreen,
        //             screen: Screen.Login
        //         })

        //         firechat.user = undefined
        //     }
        // })
    }, [])

    if (state.screen == Screen.Rooms)
        return <ConversationList/>
    else if (state.screen == Screen.Login)
        return <Login/>
    else if (state.screen  == Screen.Main)
        return <Main/>
    else if (state.screen == Screen.Room)
        return <Chat/>
    return null
}

export default () => (
    <StateProvider>
        <App/>
    </StateProvider>
)