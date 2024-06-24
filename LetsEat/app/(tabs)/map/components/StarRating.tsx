import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

type StarRatingProps = {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
};

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, size = 30 }) => {
  const handlePress = (newRating: number) => {
    onRatingChange(newRating);
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => handlePress(star)}>
          <FontAwesome
            name={star <= rating ? 'star' : 'star-o'}
            size={size}
            color={star <= rating ? '#FFD700' : '#CCCCCC'}
            style={styles.star}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: 5,
  },
});

export default StarRating;
