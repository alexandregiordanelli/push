import React, { Component } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
} from 'react-native'
import moment from 'moment'
import 'moment/locale/pt-br'
import { Room, ActionType } from './Models'
import { useStateValue } from './State'
import { firechat } from './Firechat'

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

export type Props = {
    item: Room,
}

export default ({item}: Props) => {
    const [state, dispatch] = useStateValue();
    
    let badge = null
    const notifications = item.notifications[firechat.user!.id]
    if(notifications)
      badge =  <View style={{borderRadius: 10, backgroundColor: '#fc6157', minWidth: 20, alignItems: 'center'}}><Text style={{color: 'black'}}>{notifications}</Text></View>
    return (
        <TouchableOpacity style={{backgroundColor: 'white', paddingRight: 0, paddingTop: 0, paddingBottom: 0 }} onPress={() => {
            dispatch({
                type: ActionType.ChangeRoom,
                roomId: item.id
            })
        }}>
          <View style={{flexDirection: 'row', paddingTop: 8}}>
            {/* {!!item..uri && <Image style={{width: 56, height: 56, borderRadius: 28, marginLeft: 16, marginRight: 8, marginBottom: 8}} source={{ uri: item.imageSource.uri}} />} */}
            <View style={{flexDirection: 'row', flex: 1, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 8}}>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={{fontWeight: '600', color: 'black'}}>{item.anotherUser?.geohash}</Text>
                  <Text style={{color: notifications? '#fc6157': 'black'}}>{renderTime(item.updatedAt.toDate()/*?.toDate()*/)}</Text>
                </View>
                <View style={{flex: 1, flexDirection: 'row', justifyContent:'space-between', alignItems: 'center'}}>
                  <Text numberOfLines={2} style={{flex: 1, color: 'black'}}>{item.lastMessage}</Text>{badge}
                </View>
              </View>
              {/* <Icon style={{alignSelf: 'center',marginLeft: 8, marginRight: 16, fontSize: 15, color: '#444'}} name="arrow-right" size={30} color="#444" /> */}
            </View>
          </View>
        </TouchableOpacity>
    )
}
