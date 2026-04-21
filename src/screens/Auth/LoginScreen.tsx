import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator, Image } from 'react-native';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }: any) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/user/login', { email, password });
            if (response.data.success) {
                // Update global auth state, which will automatically trigger navigation to Main stack
                await login(response.data.data.user);
                Alert.alert('Success', 'Logged in successfully');
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed';
            Alert.alert('Error', message);
            if (message.includes('verify')) {
                navigation.navigate('Verify', { email });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('../../../public/images/Logo.png')} 
                        style={styles.logo} 
                    />
                </View>
                <Text style={styles.subtitle}>Welcome back!</Text>

                <View style={styles.form}>
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
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Login</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkAction}>Register</Text></Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: Spacing.lg,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        
    },
    subtitle: {
        fontSize: 18,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    form: {
        marginTop: Spacing.lg,
    },
    input: {
        backgroundColor: Colors.background,
        padding: Spacing.md,
        color:Colors.black,
        borderRadius: 12,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
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

export default LoginScreen;
