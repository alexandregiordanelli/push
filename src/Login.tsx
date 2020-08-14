import React, { Component, useState } from 'react'
import { View, Button, Text, TextInput, StyleSheet, KeyboardAvoidingView } from 'react-native'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

//auth().settings.appVerificationDisabledForTesting = true



type PhoneNumberInputProps = {
    phoneNumber: string,
    setPhoneNumber: any,
    sendSMS: any
}

const PhoneNumberInput = (props: PhoneNumberInputProps) => {
    return (
        <>
            <Text style={styles.text}>Digite seu celular com o código da cidade</Text>
            <TextInput
                autoFocus
                keyboardType={'phone-pad'}
                style={styles.input}
                onChangeText={value => props.setPhoneNumber(value)}
                placeholder={'21987654321'}
                placeholderTextColor='#444'
                value={props.phoneNumber}
            />
            <Button title="Enviar SMS com código" color="#fc6157" onPress={props.sendSMS} />
        </>
    )
}
type VerificationCodeInputProps = {
    setMessageAfterCodeVerification: any
    codeInput: string
    setCodeInput: any
}

const VerificationCodeInput = (props: VerificationCodeInputProps) => {
    return (
        <>
            <Text style={styles.text}>Digite o código recebido por SMS</Text>
            <TextInput
                autoFocus
                keyboardType={'number-pad'}
                style={styles.input}
                onChangeText={value => props.setCodeInput(value)}
                placeholder={'123456'}
                placeholderTextColor='#444'
                value={props.codeInput}
            />
            <Button title="Continuar" color="#fc6157" onPress={props.setMessageAfterCodeVerification} />
        </>
    )
}

const Login = () => {


    const [message, setMessage] = useState('')
    const [codeInput, setCodeInput] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [confirmResult, setConfirmResult] = useState<FirebaseAuthTypes.ConfirmationResult>()


    const setMessageAfterCodeVerification = () => {
        confirmResult?.confirm(codeInput).then(() => {
            setMessage('Código confirmado! Aguarde..')
        }).catch(error => {
            setMessage(`Erro ao confirmar o código: ${error.message}`)
        })
    }

    const sendSMS = () => {
        setMessage('Enviando o SMS com o código ...')
        auth().signInWithPhoneNumber('+55' + phoneNumber).then(confirmResult => {
            setMessage('Código foi enviado com sucesso!')
            setConfirmResult(confirmResult)
        }).catch(error => {
            setMessage(`Erro: ${error.message}`)
        })
    }


    return (
        <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {!confirmResult &&
                <PhoneNumberInput
                    phoneNumber={phoneNumber}
                    sendSMS={sendSMS}
                    setPhoneNumber={setPhoneNumber}
                />}
            {confirmResult &&
                <VerificationCodeInput
                    setMessageAfterCodeVerification={setMessageAfterCodeVerification}
                    codeInput={codeInput}
                    setCodeInput={setCodeInput}
                />}
            {!!message.length && <Text style={styles.msg}>{message}</Text>}
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    text: {
        color: 'black', fontSize: 16
    },
    input: {
        marginTop: 15, marginBottom: 15, fontSize: 28, color: 'black'
    },
    msg: {
        padding: 5, backgroundColor: '#222', color: 'black', fontSize: 16
    }
})

export default Login