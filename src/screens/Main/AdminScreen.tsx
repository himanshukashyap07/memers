import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, Switch, Image } from 'react-native';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';
import { Trash2, ShieldAlert, User as UserIcon, CheckCircle, XCircle } from 'lucide-react-native';

const AdminScreen = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAllUsers = async () => {
        try {
            const response = await api.get('/user/users');
            setUsers(response.data.data);
        } catch (error) {
            console.error('Fetch all users error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const toggleBlock = async (userId: string, currentStatus: boolean) => {
        try {
            await api.patch('/user/blockUser', { userId });
            setUsers(prevUsers => prevUsers.map((u: any) => 
                u._id === userId ? { ...u, isBlock: !currentStatus } : u
            ));
        } catch (error) {
            Alert.alert('Error', 'Failed to update user status');
        }
    };

    const handleDelete = async (userId: string) => {
        Alert.alert(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete('/user/deleteUser', { data: { userId } });
                            setUsers(prevUsers => prevUsers.filter((u: any) => u._id !== userId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete user');
                        }
                    }
                }
            ]
        );
    };

    const renderUserItem = ({ item }: { item: any }) => (
        <View style={styles.userCard}>
            <View style={styles.userMainInfo}>
                <Image 
                    source={{ uri: item.avatar || 'https://via.placeholder.com/50' }} 
                    style={styles.avatar} 
                />
                <View style={styles.textDetails}>
                    <View style={styles.nameRow}>
                        <Text style={styles.username}>{item.username}</Text>
                        {item.role === 'admin' && (
                            <View style={styles.adminBadge}>
                                <Text style={styles.adminBadgeText}>Admin</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                    <View style={styles.itemFooter}>
                        <View style={styles.statusBadge}>
                            {item.isVerified ? (
                                <CheckCircle size={12} color={Colors.success} />
                            ) : (
                                <XCircle size={12} color={Colors.error} />
                            )}
                            <Text style={[styles.statusText, item.isVerified ? styles.verifiedText : styles.unverifiedText]}>
                                {item.isVerified ? 'Verified' : 'Unverified'}
                            </Text>
                        </View>
                        {item.isBlock && (
                            <View style={[styles.statusBadge, styles.blockedBadge]}>
                                <ShieldAlert size={12} color={Colors.error} />
                                <Text style={styles.blockedText}>Blocked</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            
            {item.role !== 'admin' && (
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[styles.actionBtn, item.isBlock ? styles.unblockBtn : styles.blockBtn]} 
                        onPress={() => toggleBlock(item._id, item.isBlock)}
                    >
                        <ShieldAlert size={18} color={item.isBlock ? Colors.success : Colors.error} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
                        <Trash2 size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            )}
        </View>
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
                <Text style={styles.headerTitle}>User Management</Text>
                <View style={styles.statChip}>
                    <Text style={styles.statChipText}>Total: {users.length}</Text>
                </View>
            </View>
            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <UserIcon size={48} color={Colors.border} />
                        <Text style={styles.emptyText}>No users to manage.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: Colors.white,
        padding: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: Colors.primary,
    },
    statChip: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statChipText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    list: {
        padding: Spacing.md,
    },
    userCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // Shadow for premium feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    userMainInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27,
        marginRight: Spacing.md,
        backgroundColor: Colors.background,
    },
    textDetails: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginRight: 6,
    },
    adminBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    adminBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 6,
    },
    itemFooter: {
        flexDirection: 'row',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    statusText: {
        fontSize: 11,
        marginLeft: 4,
        fontWeight: '600',
    },
    verifiedText: {
        color: Colors.success,
    },
    unverifiedText: {
        color: Colors.error,
    },
    blockedBadge: {
        backgroundColor: Colors.error + '10',
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
    },
    blockedText: {
        color: Colors.error,
        fontSize: 11,
        marginLeft: 4,
        fontWeight: '600',
    },
    actions: {
        flexDirection: 'row',
    },
    actionBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.sm,
    },
    blockBtn: {
        backgroundColor: Colors.error + '10',
    },
    unblockBtn: {
        backgroundColor: Colors.success + '10',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: Colors.textSecondary,
        marginTop: Spacing.md,
    },
});

export default AdminScreen;
