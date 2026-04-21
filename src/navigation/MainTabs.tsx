import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Image } from 'react-native';
import FeedScreen from '../screens/Main/FeedScreen';
import CreatePostScreen from '../screens/Main/CreatePostScreen';
import ProfileScreen from '../screens/Main/ProfileScreen';
import SearchScreen from '../screens/Main/SearchScreen';
import NotificationsScreen from '../screens/Main/NotificationsScreen';
import { Home, PlusSquare, Search, User, Bell } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import Svg, { Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

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
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                    headerTitle: () => (
                        <View style={{ marginLeft: 0, justifyContent: 'center', alignItems: 'center', width: 67, height: 67 }}>
                            <Svg height="67" width="67" style={{ position: 'absolute' }}>
                                <Defs>
                                    <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                                        <Stop offset="0" stopColor="#3498db" stopOpacity="1" />
                                        <Stop offset="1" stopColor="#2c3e50" stopOpacity="1" />
                                    </LinearGradient>
                                </Defs>
                                <Circle
                                    cx="33.5"
                                    cy="33.5"
                                    r="32"
                                    stroke="url(#grad)"
                                    strokeWidth="3"
                                    fill="transparent"
                                />
                            </Svg>
                            <Image
                                source={require('../../public/images/Logo.png')}
                                style={{ width: 60, height: 60, borderRadius: 30, resizeMode: 'contain' }}
                            />
                        </View>
                    ),
                    headerTitleAlign: 'left',
                    headerStyle: { backgroundColor: Colors.white, height: 100 },
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
