import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../theme/colors';
import { launchImageLibrary } from 'react-native-image-picker';
import { Image as ImageIcon, X, Check } from 'lucide-react-native';
import api from '../../services/api';

const CreatePostScreen = ({ navigation }: any) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const pickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
        });

        if (result.assets && result.assets.length > 0) {
            setImage(result.assets[0]);
        }
    };

    const handleCreatePost = async () => {
        if (!image) {
            Alert.alert('Error', 'Please select an image');
            return;
        }

        setLoading(true);
        setUploadProgress(0);
        
        const formData = new FormData();
        formData.append('text', text);
        formData.append('image', {
            uri: image.uri,
            type: image.type,
            name: image.fileName || 'post_image.jpg',
        } as any);

        try {
            const response = await api.post('/post/createPost', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                },
            });
            
            if (response.data.success) {
                setUploadProgress(100);
                setTimeout(() => {
                    Alert.alert('Success', 'Meme Shared!', [
                        { text: 'Great', onPress: () => navigation.navigate('Feed') }
                    ]);
                    setText('');
                    setImage(null);
                    setUploadProgress(0);
                }, 500);
            }
        } catch (error: any) {
            console.error('Create post error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>New Meme</Text>
                    <TouchableOpacity 
                        style={[styles.postButton, (!image || loading) && styles.disabledButton]} 
                        onPress={handleCreatePost}
                        disabled={!image || loading}
                    >
                        {loading ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.postButtonText}>Share</Text>}
                    </TouchableOpacity>
                </View>

                {loading && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarWrapper}>
                            <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{uploadProgress < 100 ? `Uploading: ${uploadProgress}%` : 'Processing...'}</Text>
                    </View>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Write a caption... (Use # for hashtags)"
                    value={text}
                    onChangeText={setText}
                    multiline
                    placeholderTextColor={Colors.textSecondary}
                    editable={!loading}
                />

                {!image ? (
                    <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage} disabled={loading}>
                        <ImageIcon size={48} color={Colors.textSecondary} />
                        <Text style={styles.placeholderText}>Choose an image</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: image.uri }} style={styles.previewImage} />
                        {!loading && (
                            <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
                                <X size={20} color={Colors.white} />
                            </TouchableOpacity>
                        )}
                        {uploadProgress === 100 && (
                            <View style={styles.successOverlay}>
                                <Check size={48} color={Colors.white} />
                            </View>
                        )}
                    </View>
                )}
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
        padding: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.primary,
    },
    postButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        minWidth: 80,
        height: 40,
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    postButtonText: {
        color: Colors.white,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    progressContainer: {
        marginBottom: Spacing.lg,
    },
    progressBarWrapper: {
        height: 6,
        backgroundColor: Colors.background,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.primary,
    },
    progressText: {
        marginTop: 6,
        fontSize: 12,
        color: Colors.textSecondary,
        textAlign: 'right',
        fontWeight: '600',
    },
    input: {
        fontSize: 16,
        color: Colors.text,
        marginBottom: Spacing.lg,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    imagePlaceholder: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: Colors.background,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.border,
        borderStyle: 'dashed',
    },
    placeholderText: {
        marginTop: Spacing.sm,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        resizeMode: 'contain',
    },
    removeImage: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: 6,
    },
    successOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,184,148,0.4)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CreatePostScreen;
