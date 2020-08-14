import { getDocumentsNearby, encodeGeohash } from './Geofire';
import { Message, Room, User, Cursor, MessageListCursor } from '../Models';
import { firebase, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';


class Firechat {
    nMax = 40
    user?: User
    db: FirebaseFirestoreTypes.Module
    roomsRef: FirebaseFirestoreTypes.CollectionReference;
    usersRef: FirebaseFirestoreTypes.CollectionReference;

    constructor(db: FirebaseFirestoreTypes.Module) {
        this.db = db
        this.roomsRef = this.db.collection("rooms")
        this.usersRef = this.db.collection("users")
    }

    signOut() {
        firebase.auth().signOut()
    }

    createMessages(roomId: string, messages: Message[]) {
        if(!this.user){
            throw new Error("not logged");
        }
        
        for (const message of messages) {
            const msg: Message = {
                ...message,
                uid: this.user.id,
                createdAt: this.getServerTimestamp(),
            }
            this.roomsRef.doc(roomId).collection("messages").add(msg)
            if (message.image || message.location)
                this.updateRoom(roomId, "[Anexo]")
            else
                this.updateRoom(roomId, message.text)
        }
    }

    getRoom(uid: string) {
        if(!this.user){
            throw new Error("not logged");
        }

        return this.roomsRef
            .where(`users.${this.user.id}`, '==', true)
            .where(`users.${uid}`, '==', true)
            .get()
            .then(querySnapshot => {
                if (querySnapshot.empty)
                    return ''
                return querySnapshot.docs[0].id
            })
    }

    getServerTimestamp() {
        return firebase.firestore.FieldValue.serverTimestamp() as FirebaseFirestoreTypes.Timestamp
    }

    async createRoom(uid: string) {
        if(!this.user){
            throw new Error("not logged");
        }

        const id = await this.getRoom(uid)
        if (!id) {
            const timestamp = this.getServerTimestamp()
            const room: Room = {
                users: {
                    [this.user.id]: true,
                    [uid]: true,
                },
                notifications: {
                    [this.user.id]: 0,
                    [uid]: 0,
                },
                createdAt: timestamp,
                updatedAt: timestamp,
                lastMessage: ""
            }
            return (await this.roomsRef.add(room)).id
        }
        return id
    }

    updateRoom(roomId: string, lastMessage?: string) {
        if (roomId) {
            const ref = this.roomsRef.doc(roomId)

            this.db.runTransaction(transaction => {
                
                return transaction.get(ref).then(doc => {
                    if(!this.user){
                        throw new Error("not logged");
                    }
                    const data = doc.data() as Room
                    let room: Room = {
                        ...data
                    }
                    let notifications = data.notifications
                    for (let user in data.users) {
                        if (user != this.user.id)
                            if (lastMessage)
                                notifications[user]++
                            else
                                if (notifications[this.user.id] > 0)
                                    notifications[this.user.id] = 0
                    }
                    room.notifications = notifications
                    if (lastMessage) {
                        room.lastMessage = lastMessage
                        room.updatedAt = this.getServerTimestamp()
                    }
                    transaction.update(ref, room)
                })
            }).then(e => {
                //console.log("beleza")
            })
        }
    }

    deleteRoom(roomId: string) {
        this.roomsRef.doc(roomId).delete()
        //TODO delete subcolection messages on cloud functions
    }

    async setUser(uid: string){
        const docUser = await this.usersRef.doc(uid).get()
        return {
            ...docUser.data() as User,
            id: docUser.id
        } as User
    }

    getOnRooms(cb: (position: Room[]) => void) {
        if(!this.user){
            throw new Error("not logged");
        }

        return this.roomsRef
            .where(`users.${this.user.id}`, '==', true)
            .onSnapshot(querySnapshot =>
                this.parseRooms(querySnapshot, cb)
            )
    }

    getAnotherUid(room: Room){
        return Object.keys(room.users).find(x => x != this.user?.id)!
    }

    async parseRooms(querySnapshot: FirebaseFirestoreTypes.QuerySnapshot, cb: (position: Room[]) => void) {
        let rooms: Room[] = []
        querySnapshot.forEach(roomDocument => {
            let room: Room = roomDocument.data() as Room
            room.id = roomDocument.id
            rooms.push(room)
        })
        rooms = rooms.sort((a, b) => a.updatedAt > b.updatedAt ? -1 : a < b ? 1 : 0)

        const userPromiseList: Promise<User>[] = []

        for(let room of rooms){
            const uid = this.getAnotherUid(room)
            userPromiseList.push(this.setUser(uid))
        }

        const userList = await Promise.all(userPromiseList)

        rooms = rooms.map(room => {
            const anotherUid = this.getAnotherUid(room)
            return {
                ...room,
                anotherUser: userList.find(user => user.id == anotherUid)
            }
        })

        cb(rooms)
    }

    getMessages(roomId: string, cursor: Cursor) {
        return this.roomsRef
            .doc(roomId)
            .collection("messages")
            .orderBy("createdAt", "desc")
            .startAfter(cursor)
            .limit(this.nMax)
            .get()
            .then(querySnapshot =>
                this.parseMessages(querySnapshot, roomId)
            )
    }

    getOnMessages(roomId: string, cb: (position: MessageListCursor) => void) {
        return this.roomsRef
            .doc(roomId)
            .collection("messages")
            .orderBy("createdAt", "desc")
            .limit(this.nMax)
            .onSnapshot(querySnapshot =>
                this.parseMessages(querySnapshot, roomId, cb)
            )
    }

    parseMessages(querySnapshot: FirebaseFirestoreTypes.QuerySnapshot, roomId: string, cb?: (position: MessageListCursor) => void) {
        const batch = this.db.batch()
        let messages: Message[] = []
        querySnapshot.forEach(doc => {
            if(!this.user){
                throw new Error("not logged");
            }

            const sent = !doc.metadata.hasPendingWrites
            const data = doc.data() as Message
            const message: Message = {
                ...data,
                createdAt: data.createdAt || firebase.firestore.Timestamp.now(),
                sent
            }
            if (data.uid != this.user.id && !data.received) {
                batch.update(doc.ref, { received: true })
                message.received = true
            }
            messages.push(message)
        })
        batch.commit().then(() => {
            this.updateRoom(roomId)
        })

        const position: MessageListCursor = {
            messages,
            cursor: messages.length == this.nMax ?
                querySnapshot.docs[querySnapshot.docs.length - 1].get("createdAt") : null
        }

        if (cb)
            cb(position)
        else
            return position
    }

    updateUser(user: User){
        if(!this.user){
            throw new Error("not logged");
        }
        this.usersRef.doc(this.user.id).set(user, {merge: true}).then(()=> {
            this.user = user
        })
    }

    getUsersNearby(radius: number) {
        if(!this.user){
            throw new Error("not logged");
        }
        console.log(this.user.location)
        return getDocumentsNearby<User>(this.usersRef, [this.user.location.latitude, this.user.location.longitude], radius)
    }

    async updateUserLocation(latitude: number, longitude: number) {
        if(!this.user){
            throw new Error("not logged");
        }
        const location = new firebase.firestore.GeoPoint(latitude, longitude)

        await this.updateUser({
            ...this.user,
            geohash: encodeGeohash([location.latitude, location.longitude]),
            location
        })
        
    }
}

export const firechat = new Firechat(firebase.firestore())