import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface AuthContextType {
    user: any;
    isLoading: boolean;
    login: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const authDataSerialized = await AsyncStorage.getItem('@AuthData');
            if (authDataSerialized) {
                const authData = JSON.parse(authDataSerialized);
                setUser(authData);
            }
        } catch (error) {
            console.error('Error loading auth data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (userData: any) => {
        try {
            setUser(userData);
            await AsyncStorage.setItem('@AuthData', JSON.stringify(userData));
        } catch (error) {
            console.warn('AsyncStorage error in login:', error);
            // We still set the user so the transition happens
            setUser(userData);
        }
    };

    const logout = async () => {
        try {
            await api.post('/user/logout');
        } catch (error) {
            console.error('Logout API error', error);
        } finally {
            setUser(null);
            await AsyncStorage.removeItem('@AuthData');
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
