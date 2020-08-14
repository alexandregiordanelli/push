import React, { useEffect } from "react";
import { Button } from "react-native-ui-lib";
import { firechat } from "./lib/Firechat";

export default () => {


    useEffect(()=> {
        firechat.getUsersNearby(1000).then(userList => {
            console.log(userList)
        })
    }, [])

    return <Button
        label={'Criar sala'}
        size={Button.sizes.small}
        onPress={async () => console.log(await firechat.createRoom("bDiNlvscpAQuLcbEvCtRKlfsX5y2"))}
    />
}
