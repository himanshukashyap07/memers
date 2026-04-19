import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Dimensions } from 'react-native';
import { Colors, Spacing } from '../../theme/colors';
import api from '../../services/api';
import { Search as SearchIcon, Grid, Hash } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

const SearchScreen = ({ navigation }: any) => {
    const [query, setQuery] = useState('');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (text: string) => {
        if (!text.trim()) {
            setPosts([]);
            return;
        }

        setLoading(true);
        try {
            // Remove # if the user typed it
            const hashtag = text.replace('#', '').trim();
            const response = await api.get(`/post/getPostsByHashtag?hashtag=${hashtag}`);
            setPosts(response.data.data);
        } catch (error) {
            console.error('Search error:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            handleSearch(query);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const renderMeme = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.gridItem}
            onPress={() => navigation.navigate('Feed', { highlightPostId: item._id })}
        >
            <Image source={{ uri: item.url }} style={styles.gridImage} />
            <View style={styles.gridOverlay}>
                <Hash size={12} color={Colors.white} />
                <Text style={styles.gridHashtag} numberOfLines={1}>
                    {item.hashtags?.[0] || 'meme'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchContainer}>
                <SearchIcon size={20} color={Colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search memes by hashtag..."
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    renderItem={renderMeme}
                    keyExtractor={(item) => item._id}
                    numColumns={3}
                    contentContainerStyle={styles.grid}
                    ListHeaderComponent={
                        query.trim() && posts.length > 0 ? (
                            <View style={styles.resultsHeader}>
                                <Text style={styles.resultsTitle}>Results for #{query.replace('#', '')}</Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconContainer}>
                                <Hash size={48} color={Colors.border} />
                            </View>
                            <Text style={styles.emptyText}>
                                {query.trim() ? "No memes found with this hashtag." : "Search for #funny, #gaming, #coding..."}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        marginHorizontal: Spacing.md,
        marginVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: 20,
        height: 44,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    grid: {
        paddingHorizontal: 1,
    },
    gridItem: {
        width: COLUMN_WIDTH,
        height: COLUMN_WIDTH,
        padding: 1,
        position: 'relative',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.background,
    },
    gridOverlay: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    gridHashtag: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
        marginLeft: 2,
    },
    resultsHeader: {
        padding: Spacing.md,
    },
    resultsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: Spacing.xl,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    emptyText: {
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default SearchScreen;
