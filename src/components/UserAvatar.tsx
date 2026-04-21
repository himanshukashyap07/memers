import React, { useState, useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

interface UserAvatarProps {
    avatar?: string;
    username?: string;
    size?: number;
    style?: any;
}

const UserAvatar = ({ avatar, username, size = 40, style }: UserAvatarProps) => {
    const dicebearUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${username || 'Memer'}`;
    const [imgSrc, setImgSrc] = useState<any>(null);

    useEffect(() => {
        if (avatar === 'guestImage' || !avatar) {
            setImgSrc({ uri: dicebearUrl });
        } else {
            setImgSrc({ uri: avatar });
        }
    }, [avatar, username]);

    const onError = () => {
        setImgSrc({ uri: dicebearUrl });
    };

    return (
        <Image
            source={imgSrc}
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: Colors.lightBlue,
                },
                style,
            ]}
            onError={onError}
        />
    );
};

export default UserAvatar;
