import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FeedScreen from '../screens/Main/FeedScreen';
import CreatePostScreen from '../screens/Main/CreatePostScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import SearchScreen from '../screens/Main/SearchScreen';
import NotificationsScreen from '../screens/Main/NotificationsScreen';
import { Home, PlusSquare, Search, User, Bell } from 'lucide-react-native';
import { Colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const MainTabs = ({ userRole }: { userRole?: string }) => {
    return (
        <Tab.Navigator 
            screenOptions={{ 
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textSecondary,
                headerStyle: { backgroundColor: Colors.white },
                headerTitleStyle: { fontWeight: 'bold', color: Colors.primary },
            }}
        >
            <Tab.Screen 
                name="Feed" 
                component={FeedScreen} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> 
                }} 
            />
            <Tab.Screen 
                name="Search" 
                component={SearchScreen} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> 
                }} 
            />
            <Tab.Screen 
                name="Create" 
                component={CreatePostScreen} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <PlusSquare color={color} size={size} /> 
                }} 
            />
            <Tab.Screen 
                name="Notifications" 
                component={NotificationsScreen} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> 
                }} 
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{ 
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} /> 
                }} 
            />
        </Tab.Navigator>
    );
};

export default MainTabs;
