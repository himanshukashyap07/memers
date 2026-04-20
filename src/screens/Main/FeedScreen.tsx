import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, RefreshControl, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';
import { Heart, MessageCircle, Share2, MoreVertical, Send, X } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const FeedScreen = () => {
    const navigation = useNavigation<any>();
    const { user: currentUser } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Comment state
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentsLoading, setCommentsLoading] = useState(false);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/post/getAllPosts');
            console.log("post fetch");

            setPosts(response.data.data);
        } catch (error) {
            console.error('Fetch posts error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPosts();
    }, []);

    const handleLike = async (postId: string) => {
        try {
            const response = await api.post('/likes/toggleLike', { postId });
            const { liked } = response.data.data;

            // Optimistic update
            setPosts(currentPosts => currentPosts.map(post => {
                if (post._id === postId) {
                    return {
                        ...post,
                        isLiked: liked,
                        likesCount: liked ? post.likesCount + 1 : post.likesCount - 1
                    };
                }
                return post;
            }));
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const openComments = async (post: any) => {
        setSelectedPost(post);
        setCommentModalVisible(true);
        setCommentsLoading(true);
        try {
            const response = await api.get(`/comments/getPostComments?postId=${post._id}`);
            setComments(response.data.data);
        } catch (error) {
            console.error('Fetch comments error:', error);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !selectedPost) return;

        try {
            const response = await api.post('/comments/addComment', {
                postId: selectedPost._id,
                comment: newComment
            });

            if (response.data.success) {
                setComments(prev => [response.data.data, ...prev]);
                setNewComment('');

                // Update post comment count in list
                setPosts(currentPosts => currentPosts.map(post => {
                    if (post._id === selectedPost._id) {
                        return { ...post, commentsCount: post.commentsCount + 1 };
                    }
                    return post;
                }));
            }
        } catch (error) {
            console.error('Add comment error:', error);
        }
    };

    const renderPost = ({ item }: { item: any }) => (
        <View style={styles.postCard}>
            {/* Header */}
            <View style={styles.postHeader}>
            <TouchableOpacity 
                style={styles.userInfo} 
                onPress={() => {
                    if (item.userId?._id === currentUser?._id) {
                        navigation.navigate('Profile');
                    } else {
                        navigation.navigate('UserProfile', { userId: item.userId?._id });
                    }
                }}
            >
                <Image
                    source={{ uri: item.userId?.avatar || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                />
                <Text style={styles.username}>{item.userId?.username}</Text>
            </TouchableOpacity>
                <TouchableOpacity>
                    <MoreVertical size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Media */}
            <Image source={{ uri: item.url }} style={styles.postImage} resizeMode="cover" />

            {/* Actions */}
            <View style={styles.postActions}>
                <View style={styles.leftActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item._id)}>
                        <Heart
                            size={24}
                            color={item.isLiked ? Colors.error : Colors.text}
                            fill={item.isLiked ? Colors.error : 'transparent'}
                        />
                        {item.likesCount > 0 && <Text style={styles.actionCount}>{item.likesCount}</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => openComments(item)}>
                        <MessageCircle size={24} color={Colors.text} />
                        {item.commentsCount > 0 && <Text style={styles.actionCount}>{item.commentsCount}</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Share2 size={24} color={Colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <View style={styles.postContent}>
                <Text style={styles.caption}>
                    <Text style={styles.boldUsername}>{item.userId?.username} </Text>
                    {item.text}
                </Text>
                {item.hashtags?.length > 0 && (
                    <Text style={styles.hashtagText}>
                        {item.hashtags.map((tag: string) => `#${tag} `)}
                    </Text>
                )}
                <Text style={styles.timeAgo}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
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
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No memes yet. Be the first to post!</Text>
                    </View>
                }
            />

            {/* Comments Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={commentModalVisible}
                onRequestClose={() => setCommentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContent}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Comments</Text>
                            <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                                <X size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>

                        {commentsLoading ? (
                            <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
                        ) : (
                            <FlatList
                                data={comments}
                                keyExtractor={(item) => item._id}
                                style={styles.commentsList}
                                renderItem={({ item }) => {
                                    const isOwnComment = item.userId?._id === currentUser?._id;
                                    return (
                                        <View style={[styles.commentItem, isOwnComment && styles.ownCommentItem]}>
                                            <Image source={{ uri: item.userId?.avatar || 'https://via.placeholder.com/40' }} style={styles.commentAvatar} />
                                            <View style={[styles.commentTextContainer, isOwnComment && styles.ownCommentTextContainer]}>
                                                <Text style={styles.commentUser}>{item.userId?.username}</Text>
                                                <Text style={styles.commentText}>{item.comment}</Text>
                                            </View>
                                        </View>
                                    );
                                }}
                                ListEmptyComponent={
                                    <Text style={styles.emptyComments}>No comments yet. Start the conversation!</Text>
                                }
                            />
                        )}

                        <View style={styles.commentInputContainer}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment..."
                                value={newComment}
                                onChangeText={setNewComment}
                            />
                            <TouchableOpacity
                                onPress={handleAddComment}
                                disabled={!newComment.trim()}
                                style={[styles.sendButton, !newComment.trim() && { opacity: 0.5 }]}
                            >
                                <Send size={20} color={Colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
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
    postCard: {
        backgroundColor: Colors.white,
        marginBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: Spacing.sm,
        backgroundColor: Colors.lightBlue,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 14,
        color: Colors.text,
    },
    postImage: {
        width: '100%',
        aspectRatio: 1,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: Spacing.md,
    },
    leftActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        marginRight: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionCount: {
        marginLeft: 4,
        fontSize: 14,
        color: Colors.text,
        fontWeight: '600',
    },
    postContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
    },
    caption: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },
    boldUsername: {
        fontWeight: 'bold',
    },
    hashtagText: {
        color: Colors.primary,
        marginTop: 4,
    },
    timeAgo: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: Colors.textSecondary,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        height: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: Spacing.md,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    commentsList: {
        flex: 1,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: Spacing.md,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: Spacing.sm,
    },
    commentTextContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.sm,
        borderRadius: 12,
    },
    commentUser: {
        fontWeight: 'bold',
        fontSize: 13,
        marginBottom: 2,
    },
    commentText: {
        fontSize: 14,
        color: Colors.text,
    },
    emptyComments: {
        textAlign: 'center',
        color: Colors.textSecondary,
        marginTop: 30,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    commentInput: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: 20,
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
        marginRight: Spacing.sm,
    },
    sendButton: {
        padding: 4,
    },
    ownCommentItem: {
        flexDirection: 'row-reverse',
    },
    ownCommentTextContainer: {
        backgroundColor: Colors.lightBlue,
        borderBottomRightRadius: 2,
        marginLeft: 0,
        marginRight: Spacing.sm,
    },
});

export default FeedScreen;
