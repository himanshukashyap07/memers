import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeft, Camera, Lock, User, LogOut } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import api from '../../services/api';

const SettingsScreen = ({ navigation }: any) => {
    const { user, login, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    
    // Password state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const pickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
        });

        if (result.assets && result.assets.length > 0) {
            handleUpdateAvatar(result.assets[0]);
        }
    };

    const handleUpdateAvatar = async (image: any) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('avatar', {
            uri: image.uri,
            type: image.type,
            name: image.fileName || 'avatar.jpg',
        } as any);

        try {
            const response = await api.patch('/user/updateAvatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.success) {
                // Update local auth context
                await login({ ...user, avatar: response.data.data.avatar });
                Alert.alert('Success', 'Avatar updated successfully');
            }
        } catch (error: any) {
            console.error('Update avatar error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update avatar');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await api.patch('/user/updatePassword', {
                oldPassword,
                newPassword
            });
            if (response.data.success) {
                Alert.alert('Success', 'Password updated successfully');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error: any) {
            console.error('Update password error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: async () => {
                    try {
                        await logout();
                    } catch (error) {
                        console.error('Logout error:', error);
                    }
                }, style: 'destructive' }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Profile</Text>
                    <View style={styles.avatarContainer}>
                        <Image 
                            source={{ uri: user?.avatar === 'guestImage' ? 'https://via.placeholder.com/100' : user?.avatar }} 
                            style={styles.avatar} 
                        />
                        <TouchableOpacity style={styles.cameraButton} onPress={pickImage} disabled={loading}>
                            {loading ? <ActivityIndicator size="small" color={Colors.white} /> : <Camera size={20} color={Colors.white} />}
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.username}>{user?.username}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>

                {/* Password Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Change Password</Text>
                    <View style={styles.inputContainer}>
                        <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Current Password"
                            secureTextEntry
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>
                    <View style={styles.inputContainer}>
                        <Lock size={20} color={Colors.textSecondary} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm New Password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>
                    <TouchableOpacity 
                        style={[styles.button, loading && styles.disabledButton]} 
                        onPress={handleUpdatePassword}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>Update Password</Text>
                    </TouchableOpacity>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View style={styles.menuItemLeft}>
                            <LogOut size={20} color={Colors.error} />
                            <Text style={[styles.menuItemText, { color: Colors.error }]}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    },
    content: {
        padding: Spacing.md,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        marginBottom: Spacing.md,
        letterSpacing: 1,
    },
    avatarContainer: {
        alignSelf: 'center',
        position: 'relative',
        marginBottom: Spacing.sm,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.lightBlue,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: Colors.white,
    },
    username: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
        marginTop: Spacing.sm,
    },
    email: {
        textAlign: 'center',
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: 12,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        height: 50,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    menuItem: {
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: Colors.text,
        marginLeft: Spacing.md,
    },
});

export default SettingsScreen;
