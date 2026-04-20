import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Colors, Spacing } from '../../theme/colors';
import { ChevronLeft, Check } from 'lucide-react-native';
import api from '../../services/api';

const EditPostScreen = ({ route, navigation }: any) => {
    const { post } = route.params;
    const [text, setText] = useState(post.text);
    const [loading, setLoading] = useState(false);

    const handleUpdatePost = async () => {
        setLoading(true);
        try {
            const response = await api.patch('/post/updatePost', {
                postId: post._id,
                text
            });
            if (response.data.success) {
                Alert.alert('Success', 'Post updated successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error: any) {
            console.error('Update post error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ChevronLeft size={28} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Post</Text>
                <TouchableOpacity onPress={handleUpdatePost} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color={Colors.primary} /> : <Check size={24} color={Colors.primary} />}
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Image source={{ uri: post.url }} style={styles.previewImage} />
                <TextInput
                    style={styles.input}
                    placeholder="Update your caption..."
                    value={text}
                    onChangeText={setText}
                    multiline
                    placeholderTextColor={Colors.textSecondary}
                />
            </View>
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
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        marginBottom: Spacing.md,
        backgroundColor: Colors.background,
    },
    input: {
        fontSize: 16,
        color: Colors.text,
        minHeight: 100,
        textAlignVertical: 'top',
    },
});

export default EditPostScreen;
