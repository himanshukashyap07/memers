import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';
import { Trash2, UserMinus, UserCheck, LayoutDashboard } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdminBottomBar from '../../components/AdminBottomBar';

const AdminScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState('users');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'users': endpoint = '/user/users'; break;
                case 'posts': endpoint = '/post/getAllPosts'; break;
                case 'comments': endpoint = '/comments/admin/all'; break;
                case 'likes': endpoint = '/likes/admin/all'; break;
                case 'notifications': endpoint = '/notifications/all'; break; 
                case 'followings': 
                case 'followers':
                case 'followbacks': endpoint = '/friends/admin/all'; break;
                default: endpoint = '';
            }

            if (endpoint) {
                const response = await api.get(endpoint);
                setData(response.data.data);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error(`Admin fetch ${activeTab} error:`, error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleDelete = async (id: string, type: string) => {
        Alert.alert(
            `Delete ${type}`,
            `Are you sure you want to delete this ${type}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            let endpoint = '';
                            let body = {};
                            switch(type) {
                                case 'post': endpoint = '/post/deletePost'; body = { postId: id }; break;
                                case 'user': endpoint = '/user/deleteUser'; body = { userId: id }; break;
                                case 'comment': endpoint = '/comments/deleteComment'; body = { commentId: id }; break;
                            }
                            if (endpoint) {
                                await api.delete(endpoint, { data: body });
                                setData(prev => prev.filter(item => item._id !== id));
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete item');
                        }
                    }
                }
            ]
        );
    };

    const handleToggleBlock = async (user: any) => {
        try {
            const response = await api.patch('/user/blockUser', { userId: user._id });
            if (response.data.success) {
                setData(prev => prev.map(u => u._id === user._id ? { ...u, isBlock: !u.isBlock } : u));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to toggle block status');
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        switch (activeTab) {
            case 'users':
                return (
                    <View style={styles.itemRow}>
                        <View style={styles.itemMain}>
                            <Image source={{ uri: item.avatar || 'https://via.placeholder.com/50' }} style={styles.itemAvatar} />
                            <View>
                                <Text style={styles.itemTitle}>{item.username}</Text>
                                <Text style={styles.itemSub}>{item.email}</Text>
                            </View>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => handleToggleBlock(item)} style={styles.actionBtn}>
                                {item.isBlock ? <UserCheck size={20} color={Colors.success} /> : <UserMinus size={20} color={Colors.error} />}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item._id, 'user')} style={styles.actionBtn}>
                                <Trash2 size={20} color={Colors.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 'posts':
                return (
                    <View style={styles.itemRow}>
                        <View style={styles.itemMain}>
                            {item.url && <Image source={{ uri: item.url }} style={styles.postThumb} />}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemTitle} numberOfLines={1}>{item.text || 'No caption'}</Text>
                                <Text style={styles.itemSub}>by {item.userId?.username}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item._id, 'post')} style={styles.actionBtn}>
                            <Trash2 size={20} color={Colors.error} />
                        </TouchableOpacity>
                    </View>
                );
            case 'comments':
                return (
                    <View style={styles.itemRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitle}>{item.comment}</Text>
                            <Text style={styles.itemSub}>by {item.userId?.username} on {item.postId?.text || 'Post'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item._id, 'comment')} style={styles.actionBtn}>
                            <Trash2 size={20} color={Colors.error} />
                        </TouchableOpacity>
                    </View>
                );
            case 'likes':
                return (
                    <View style={styles.itemRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitle}>{item.userId?.username} liked</Text>
                            <Text style={styles.itemSub}>{item.postId?.text || 'Meme'}</Text>
                        </View>
                    </View>
                );
            case 'followings':
            case 'followers':
            case 'followbacks':
                return (
                    <View style={styles.itemRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemTitle}>{item.userId?.username} follows</Text>
                            <Text style={styles.itemSub}>{item.friendId?.username}</Text>
                        </View>
                    </View>
                );
            default:
                return (
                    <View style={styles.itemRow}>
                        <Text style={styles.itemSub}>ID: {item._id}</Text>
                    </View>
                );
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <LayoutDashboard size={24} color={Colors.primary} style={{ marginRight: 10 }} />
                <Text style={styles.headerTitle}>Admin Panel</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyText}>No data found for {activeTab}</Text>
                        </View>
                    }
                />
            )}

            <AdminBottomBar activeTab={activeTab} onTabPress={setActiveTab} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
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
    },
    listContent: {
        padding: Spacing.md,
        paddingBottom: 100, // For the floating bar
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        backgroundColor: Colors.background,
        borderRadius: 12,
        marginBottom: Spacing.sm,
    },
    itemMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: Spacing.md,
    },
    postThumb: {
        width: 40,
        height: 40,
        borderRadius: 4,
        marginRight: Spacing.md,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.text,
    },
    itemSub: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
    },
    actionBtn: {
        padding: 5,
        marginLeft: 10,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 16,
    },
});

export default AdminScreen;
