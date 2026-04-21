import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, SafeAreaView, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';

import { launchImageLibrary } from 'react-native-image-picker';
import { Camera, User as UserIcon } from 'lucide-react-native';

const RegisterScreen = ({ navigation }: any) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
            if (response.didCancel) return;
            if (response.assets && response.assets.length > 0) {
                setAvatar(response.assets[0]);
            }
        });
    };

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);

        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);

        if (avatar) {
            formData.append('avatar', {
                uri: avatar.uri,
                type: avatar.type,
                name: avatar.fileName || 'avatar.jpg',
            } as any);
        }

        try {
            const response = await api.post('/user/registerUser', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.success) {
                Alert.alert('Success', 'Registration successful. Verification email sent!', [
                    { text: 'OK', onPress: () => navigation.navigate('Verify', { email }) }
                ]);
            }
        } catch (error: any) {
            console.log(error);
            Alert.alert('Error', error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../../../public/images/Logo.png')} 
                        style={styles.logo} 
                    />
                </View>
                <Text style={styles.subtitle}>Create an account to start sharing!</Text>

                <View style={styles.form}>
                    <TouchableOpacity style={styles.avatarPicker} onPress={pickImage}>
                        {avatar ? (
                            <Image source={{ uri: avatar.uri }} style={styles.selectedAvatar} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <UserIcon size={40} color={Colors.textSecondary} />
                                <View style={styles.cameraIconBadge}>
                                    <Camera size={14} color={Colors.white} />
                                </View>
                            </View>
                        )}
                        <Text style={styles.avatarPickerText}>Choose Profile Picture</Text>
                    </TouchableOpacity>

                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor={Colors.textSecondary}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={Colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={Colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Register</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Already have an account? <Text style={styles.linkAction}>Login</Text></Text>
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
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    form: {
        marginTop: Spacing.lg,
    },
    avatarPicker: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
    },
    selectedAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    avatarPickerText: {
        marginTop: Spacing.sm,
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        backgroundColor: Colors.background,
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.black,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: Spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        textAlign: 'center',
        marginTop: Spacing.lg,
        color: Colors.textSecondary,
    },
    linkAction: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
