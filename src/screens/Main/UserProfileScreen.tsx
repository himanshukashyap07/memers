import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';
import { ChevronLeft, Grid, User as UserIcon, UserPlus, UserMinus } from 'lucide-react-native';

const UserProfileScreen = ({ route, navigation }: any) => {
    const { userId } = route.params;
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);

    const fetchUserProfile = async () => {
        try {
            const userRes = await api.get(`/user/getUserProfile?userId=${userId}`);
            setUser(userRes.data.data);
            
            const postsRes = await api.get(`/post/getUserPost?userId=${userId}`);
            setPosts(postsRes.data.data);
        } catch (error) {
            console.error('Fetch user profile error:', error);
            Alert.alert('Error', 'Failed to load user profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

    const handleFollowToggle = async () => {
        if (!user) return;
        setFollowLoading(true);
        try {
            const endpoint = user.isFollowing ? '/friends/unfollow' : '/friends/createFollow';
            const response = await api.post(endpoint, { friendId: userId });
            
            if (response.data.success) {
                setUser({
                    ...user,
                    isFollowing: !user.isFollowing,
                    followersCount: user.isFollowing ? user.followersCount - 1 : user.followersCount + 1
                });
            }
        } catch (error: any) {
            console.error('Follow toggle error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Action failed');
        } finally {
            setFollowLoading(false);
        }
    };

    const renderPostItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.gridItem}>
            <Image source={{ uri: item.url }} style={styles.gridImage} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{user?.username}</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.profileHeader}>
                <View style={styles.profileInfo}>
                    <Image 
                        source={{ uri: user?.avatar === 'guestImage' ? 'https://via.placeholder.com/100' : user?.avatar }} 
                        style={styles.largeAvatar} 
                    />
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statCount}>{user?.postsCount || 0}</Text>
                            <Text style={styles.statLabel}>Posts</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.statBox}
                            onPress={() => navigation.navigate('FollowersFollowing', { userId, type: 'followers' })}
                        >
                            <Text style={styles.statCount}>{user?.followersCount || 0}</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.statBox}
                            onPress={() => navigation.navigate('FollowersFollowing', { userId, type: 'following' })}
                        >
                            <Text style={styles.statCount}>{user?.followingCount || 0}</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity 
                    style={[
                        styles.followButton, 
                        user?.isFollowing && styles.unfollowButton
                    ]} 
                    onPress={handleFollowToggle}
                    disabled={followLoading}
                >
                    {followLoading ? (
                        <ActivityIndicator size="small" color={user?.isFollowing ? Colors.text : Colors.white} />
                    ) : (
                        <>
                            {user?.isFollowing ? (
                                <UserMinus size={18} color={Colors.text} style={{ marginRight: 8 }} />
                            ) : (
                                <UserPlus size={18} color={Colors.white} style={{ marginRight: 8 }} />
                            )}
                            <Text style={[styles.followButtonText, user?.isFollowing && styles.unfollowButtonText]}>
                                {user?.isFollowing ? 'Unfollow' : (user?.followsMe ? 'Follow Back' : 'Follow')}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem}>
                    <Grid size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts}
                renderItem={renderPostItem}
                keyExtractor={(item: any) => item._id}
                numColumns={3}
                contentContainerStyle={styles.postGrid}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No posts yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    },
    profileHeader: {
        padding: Spacing.md,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    largeAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.lightBlue,
    },
    statsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginLeft: Spacing.md,
    },
    statBox: {
        alignItems: 'center',
    },
    statCount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    followButton: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        height: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    unfollowButton: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    followButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    unfollowButtonText: {
        color: Colors.text,
    },
    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: Colors.border,
        borderBottomColor: Colors.border,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.sm,
    },
    postGrid: {
        padding: 1,
    },
    gridItem: {
        flex: 1/3,
        aspectRatio: 1,
        padding: 1,
    },
    gridImage: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: Colors.textSecondary,
    },
});

export default UserProfileScreen;
