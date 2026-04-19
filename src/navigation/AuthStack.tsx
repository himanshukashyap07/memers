import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import VerifyScreen from '../screens/Auth/VerifyScreen';

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    Verify: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Verify" component={VerifyScreen} />
        </Stack.Navigator>
    );
};

export default AuthStack;
