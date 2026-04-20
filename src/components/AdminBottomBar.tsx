import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../theme/colors';
import { Users, FileText, MessageSquare, Heart, Share2, Reply, Bell, UserPlus, Users as UsersGroup, UserCheck } from 'lucide-react-native';

const AdminBottomBar = ({ activeTab, onTabPress }: any) => {
    const insets = useSafeAreaInsets();
    const tabs = [
        { id: 'users', icon: Users, label: 'Users' },
        { id: 'posts', icon: FileText, label: 'Posts' },
        { id: 'comments', icon: MessageSquare, label: 'Comments' },
        { id: 'likes', icon: Heart, label: 'Likes' },
        { id: 'shares', icon: Share2, label: 'Shares' },
        { id: 'replies', icon: Reply, label: 'Replies' },
        { id: 'notifications', icon: Bell, label: 'Notifs' },
        { id: 'followbacks', icon: UserCheck, label: 'F-Back' },
        { id: 'followings', icon: UsersGroup, label: 'Following' },
        { id: 'followers', icon: UserPlus, label: 'Followers' },
    ];

    return (
        <View style={[styles.container, { bottom: Math.max(20, insets.bottom) }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <TouchableOpacity 
                            key={tab.id} 
                            style={[styles.tab, isActive && styles.activeTab]} 
                            onPress={() => onTabPress(tab.id)}
                        >
                            <Icon size={20} color={isActive ? Colors.white : Colors.textSecondary} />
                            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // bottom moved to inline style
        left: 20,
        right: 20,
        backgroundColor: Colors.white,
        borderRadius: 30,
        height: 60,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        overflow: 'hidden',
    },
    scrollContent: {
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: Colors.primary,
    },
    tabLabel: {
        fontSize: 12,
        marginLeft: 6,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    activeTabLabel: {
        color: Colors.white,
    }
});

export default AdminBottomBar;
