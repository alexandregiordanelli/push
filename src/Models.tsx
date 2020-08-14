import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { GeoDocument } from "./lib/Geofire";
import { GeolocationResponse } from "@react-native-community/geolocation";

export enum Screen {
    Login,
    Rooms,
    Main,
    Room,
    SignUp
}

export type MainState = {
    screen: Screen;
    roomId?: string;
    position?: GeolocationResponse
};

export const initialState: MainState = {
    screen: Screen.Login
};

export enum ActionType {
    ChangeScreen,
    ChangeRoom,
    ChangeLocation
}

export type MainAction = {
    type: ActionType;
    screen?: Screen;
    roomId?: string;
    position?: GeolocationResponse;
};

export type Cursor = FirebaseFirestoreTypes.Timestamp | null

export type MessageListCursor = {
    messages: Message[]
    cursor: Cursor
}

export type Message = {
    createdAt: FirebaseFirestoreTypes.Timestamp
    received: boolean
    text: string
    uid: string
    image: string
    location: string
    sent: boolean
}

export type Room = {
    id?: string
    anotherUser?: User
    createdAt: FirebaseFirestoreTypes.Timestamp
    lastMessage: string
    notifications: {
        [key: string]: number
    }
    updatedAt: FirebaseFirestoreTypes.Timestamp
    users: {
        [key: string]: boolean
    }
}
export type User = {
    name?: string
    avatar?: string
} & GeoDocument
