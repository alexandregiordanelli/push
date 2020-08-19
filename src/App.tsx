import React, { useEffect } from "react";
import ConversationList from "./ConversationList";
import { View } from "react-native";
import { Button } from "react-native-ui-lib";

import { firechat } from "./lib/Firechat";
import { ActionType, Screen, User } from "./Models";
import { StateProvider, useStateValue } from "./State";
import ngeohash from 'ngeohash'
import auth from '@react-native-firebase/auth';
import Login from "./Login";
import Geolocation from '@react-native-community/geolocation';
import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";


const App = () => {
    const [state, dispatch] = useStateValue();

    useEffect(()=>{
        // Geolocation.getCurrentPosition(info => {
        //     dispatch({
        //         type: ActionType.ChangeLocation,
        //         position: info
        //     })
        // });

        firechat.usersRef!.doc("03jFAXqSz8Qzdifpqyu2MGxHRGo1").get().then(user => {
            const userData = user.data() as User
            firechat.user = {
                ...userData,
                location: ngeohash.decode(userData.geohash) as FirebaseFirestoreTypes.GeoPoint,
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
    return null
}

export default () => (
    <StateProvider>
        <App/>
    </StateProvider>
)