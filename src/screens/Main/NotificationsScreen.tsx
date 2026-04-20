import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';
import { Bell, Heart, MessageCircle, UserPlus, Reply } from 'lucide-react-native';

const NotificationsScreen = ({ navigation }: any) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications/all');
            setNotifications(response.data.data);
        } catch (error) {
            console.error('Fetch notifications error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleNotificationPress = async (notification: any) => {
        // Mark as read
        if (!notification.isRead) {
            try {
                await api.patch('/notifications/read', { notificationId: notification._id });
                setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
            } catch (error) {
                console.error('Mark as read error:', error);
            }
        }

        // Navigate based on type
        if (notification.type === 'follow') {
            navigation.navigate('UserProfile', { userId: notification.sender._id });
        } else if (notification.postId) {
            navigation.navigate('Feed');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'like': return <Heart size={16} color={Colors.error} fill={Colors.error} />;
            case 'comment': return <MessageCircle size={16} color={Colors.primary} />;
            case 'follow': return <UserPlus size={16} color={Colors.success} />;
            case 'reply': return <Reply size={16} color={Colors.primary} />;
            default: return <Bell size={16} color={Colors.textSecondary} />;
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={[styles.notificationItem, !item.isRead && styles.unreadItem]} 
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.sender.avatar || 'https://via.placeholder.com/50' }} style={styles.avatar} />
                <View style={styles.iconOverlay}>{getIcon(item.type)}</View>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.notificationText}>
                    <Text style={styles.username}>{item.sender.username}</Text>
                    {item.type === 'like' && ' liked your meme'}
                    {item.type === 'comment' && ' commented on your meme'}
                    {item.type === 'follow' && ' started following you'}
                    {item.type === 'reply' && ' replied to your comment'}
                </Text>
                <Text style={styles.timeText}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
            {item.postId && (
                <Image source={{ uri: item.postId.url }} style={styles.postThumbnail} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Bell size={48} color={Colors.textSecondary} style={{ marginBottom: Spacing.md }} />
                            <Text style={styles.emptyText}>No notifications yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.background,
    },
    unreadItem: {
        backgroundColor: '#F0F7FF',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: Spacing.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.background,
    },
    iconOverlay: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: Colors.white,
        borderRadius: 10,
        padding: 2,
    },
    textContainer: {
        flex: 1,
    },
    notificationText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },
    username: {
        fontWeight: 'bold',
    },
    timeText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    postThumbnail: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginLeft: Spacing.sm,
        backgroundColor: Colors.background,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
});

export default NotificationsScreen;
