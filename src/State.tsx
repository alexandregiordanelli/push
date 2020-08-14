import React, {createContext, useContext, useReducer, PropsWithChildren} from 'react';
import { MainState, MainAction, ActionType, Screen, initialState } from './Models';

type Teste = [MainState, React.Dispatch<MainAction>]

export const StateContext = createContext<Teste>({} as Teste);

function reducer(state: MainState, action: MainAction) {
    console.log(action.roomId, Screen[state.screen].toString(), action.screen? Screen[action.screen].toString(): '' , ActionType[action.type].toString())
    switch (action.type) {
        case ActionType.ChangeRoom: {
            console.log({
                ...state,
                roomId: action.roomId,
                screen: Screen.Room
            })
            return {
                ...state,
                roomId: action.roomId,
                screen: Screen.Room
            } as MainState
        }
        case ActionType.ChangeScreen:
            return {
                ...state,
                screen: action.screen!
            } as MainState
        case ActionType.ChangeLocation:
            return {
                ...state,
                position: action.position
            } as MainState
        default:
            return state
    }
}

type StateProviderProps = {}

export const StateProvider = (props: PropsWithChildren<StateProviderProps>) =>(
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {props.children}
  </StateContext.Provider>
);

export const useStateValue = () => useContext(StateContext);