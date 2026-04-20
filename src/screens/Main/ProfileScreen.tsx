import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';
import { Settings, Grid, User as UserIcon, LayoutDashboard } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }: any) => {
    const { logout } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        try {
            const userRes = await api.get('/user/currentUser');
            setUser(userRes.data.data);
            
            const postsRes = await api.get('/post/getUserPost');
            setPosts(postsRes.data.data);
        } catch (error) {
            console.error('Fetch profile error:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const handlePostPress = (post: any) => {
        Alert.alert(
            "Manage Post",
            "What would you like to do?",
            [
                { text: "Edit", onPress: () => navigation.navigate("EditPost", { post }) },
                { text: "Delete", onPress: () => confirmDelete(post._id), style: "destructive" },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const confirmDelete = (postId: string) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this meme? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: () => handleDelete(postId), style: "destructive" }
            ]
        );
    };

    const handleDelete = async (postId: string) => {
        try {
            const response = await api.delete("/post/deletePost", { data: { postId } });
            if (response.data.success) {
                setPosts(prev => prev.filter((p: any) => p._id !== postId));
            }
        } catch (error) {
            console.error("Delete post error:", error);
            Alert.alert("Error", "Failed to delete post");
        }
    };

    const renderPostItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.gridItem} onPress={() => handlePostPress(item)}>
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
                <View style={styles.headerTop}>
                    <Text style={styles.profileUsername}>{user?.username}</Text>
                    <View style={styles.headerActions}>
                        {user?.role === 'admin' && (
                            <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Admin')}>
                                <LayoutDashboard size={24} color={Colors.primary} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('Settings')}>
                            <Settings size={24} color={Colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.profileInfo}>
                    <Image 
                        source={{ uri: user?.avatar === 'guestImage' ? 'https://via.placeholder.com/100' : user?.avatar }} 
                        style={styles.largeAvatar} 
                    />
                    <View style={styles.statsContainer}>
                        <View style={styles.statBox}>
                            <Text style={styles.statCount}>{posts.length}</Text>
                            <Text style={styles.statLabel}>Posts</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.statBox} 
                            onPress={() => navigation.navigate('FollowersFollowing', { userId: user?._id, type: 'followers' })}
                        >
                            <Text style={styles.statCount}>{user?.followersCount || 0}</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.statBox}
                            onPress={() => navigation.navigate('FollowersFollowing', { userId: user?._id, type: 'following' })}
                        >
                            <Text style={styles.statCount}>{user?.followingCount || 0}</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem}>
                    <Grid size={24} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <UserIcon size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts}
                renderItem={renderPostItem}
                keyExtractor={(item) => item._id}
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
        padding: Spacing.md,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    profileUsername: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerIcon: {
        marginLeft: Spacing.md,
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

export default ProfileScreen;
