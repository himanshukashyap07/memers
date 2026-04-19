import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';

const VerifyScreen = ({ route, navigation }: any) => {
    const { email: initialEmail } = route.params || {};
    const [email, setEmail] = useState(initialEmail || '');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!email || !token) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/user/userVerification', { email, token });
            if (response.data.success) {
                Alert.alert('Success', 'Email verified successfully!', [
                    { text: 'Login', onPress: () => navigation.navigate('Login') }
                ]);
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Verify Email</Text>
                <Text style={styles.subtitle}>Enter the token sent to your email.</Text>

                <View style={styles.form}>
                    <TextInput
                        style={[styles.input, initialEmail && styles.disabledInput]}
                        placeholder="Email"
                        placeholderTextColor={Colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!initialEmail}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Verification Token"
                        placeholderTextColor={Colors.textSecondary}
                        value={token}
                        onChangeText={setToken}
                    />
                    
                    <TouchableOpacity 
                        style={styles.button} 
                        onPress={handleVerify}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.buttonText}>Verify</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Back to <Text style={styles.linkAction}>Login</Text></Text>
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
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.primary,
        textAlign: 'center',
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
    input: {
        backgroundColor: Colors.background,
        padding: Spacing.md,
        borderRadius: 12,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        color: Colors.black,
    },
    disabledInput: {
        color: Colors.textSecondary,
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

export default VerifyScreen;
