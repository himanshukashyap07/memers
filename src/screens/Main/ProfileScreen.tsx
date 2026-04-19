import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';
import { Settings, LogOut, Grid, User as UserIcon } from 'lucide-react-native';
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

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            Alert.alert('Logged out', 'You have been logged out.');
        } catch (error) {
            console.error('Logout error:', error);
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
                <View style={styles.headerTop}>
                    <Text style={styles.profileUsername}>{user?.username}</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerIcon}>
                            <Settings size={24} color={Colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerIcon} onPress={handleLogout}>
                            <LogOut size={24} color={Colors.error} />
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
                        <View style={styles.statBox}>
                            <Text style={styles.statCount}>0</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statCount}>0</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </View>
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
