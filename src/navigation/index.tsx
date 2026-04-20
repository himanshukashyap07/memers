import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

import SettingsScreen from '../screens/Main/SettingsScreen';
import UserProfileScreen from '../screens/Main/UserProfileScreen';
import EditPostScreen from '../screens/Main/EditPostScreen';
import FollowersFollowingScreen from '../screens/Main/FollowersFollowingScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <>
                        <Stack.Screen name="MainTabs">
                            {(props) => <MainTabs {...props} userRole={user.role} />}
                        </Stack.Screen>
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                        <Stack.Screen name="EditPost" component={EditPostScreen} />
                        <Stack.Screen name="FollowersFollowing" component={FollowersFollowingScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Navigation;
