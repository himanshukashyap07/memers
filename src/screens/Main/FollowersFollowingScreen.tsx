import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const FollowersFollowingScreen = ({ route, navigation }: any) => {
    const { userId, type } = route.params;
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const endpoint = type === 'followers' ? '/friends/getFollowers' : '/friends/getFollowing';
            const response = await api.get(`${endpoint}?userId=${userId}`);
            
            // Map data to get the user objects and their follow status
            const mappedUsers = response.data.data.map((item: any) => {
                const userObj = type === 'followers' ? item.userId : item.friendId;
                return { ...userObj, isFollowing: item.isFollowing };
            });
            
            setUsers(mappedUsers);
        } catch (error) {
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [userId, type]);

    const handleFollowToggle = async (targetUser: any) => {
        try {
            const endpoint = targetUser.isFollowing ? '/friends/unfollow' : '/friends/createFollow';
            const response = await api.post(endpoint, { friendId: targetUser._id });
            
            if (response.data.success) {
                setUsers(prev => prev.map(u => 
                    u._id === targetUser._id 
                        ? { ...u, isFollowing: !u.isFollowing } 
                        : u
                ));
            }
        } catch (error) {
            console.error('List follow toggle error:', error);
        }
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <View style={styles.userRow}>
            <TouchableOpacity 
                style={styles.userItem} 
                onPress={() => {
                    if (item?._id === currentUser?._id) {
                        navigation.navigate('Profile');
                    } else {
                        navigation.push('UserProfile', { userId: item?._id });
                    }
                }}
            >
                <Image source={{ uri: item?.avatar || 'https://via.placeholder.com/50' }} style={styles.avatar} />
                <Text style={styles.username}>{item?.username}</Text>
            </TouchableOpacity>

            {item?._id !== currentUser?._id && (
                <TouchableOpacity 
                    style={[styles.smallFollowButton, item?.isFollowing && styles.smallUnfollowButton]}
                    onPress={() => handleFollowToggle(item)}
                >
                    <Text style={[styles.smallFollowText, item?.isFollowing && styles.smallUnfollowText]}>
                        {item?.isFollowing ? 'Following' : (type === 'followers' ? 'Follow Back' : 'Follow')}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{type === 'followers' ? 'Followers' : 'Following'}</Text>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={users}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item?._id || Math.random().toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No users found.</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        textTransform: 'capitalize',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: Spacing.md,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: Spacing.md,
        backgroundColor: Colors.lightBlue,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    smallFollowButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 100,
        alignItems: 'center',
    },
    smallUnfollowButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    smallFollowText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    smallUnfollowText: {
        color: Colors.text,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
});

export default FollowersFollowingScreen;
