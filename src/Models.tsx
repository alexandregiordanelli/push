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
    position?: any;
};

export type Cursor = firebase.firestore.Timestamp | null

export type MessageListCursor = {
    messages: Message[]
    cursor: Cursor
}

export type Message = {
    createdAt: firebase.firestore.Timestamp
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
    createdAt: firebase.firestore.Timestamp
    lastMessage: string
    notifications: {
        [key: string]: number
    }
    updatedAt: firebase.firestore.Timestamp
    users: {
        [key: string]: boolean
    }
}
export type User = {
    id: string
    name?: string
    avatar?: string
    location: firebase.firestore.GeoPoint
    geohash: string
}
