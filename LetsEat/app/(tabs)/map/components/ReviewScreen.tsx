import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDatabase, ref, push, get, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import StarRating from './StarRating';
import { expLevels, calculateLevel } from '../../../../expLevels';

const ReviewScreen: React.FC = () => {
  const { eatery } = useLocalSearchParams();
  const eateryData = JSON.parse(eatery as string);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const router = useRouter();
  const database = getDatabase();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleSubmitReview = () => {
    if (!currentUser) {
      alert('User not authenticated.');
      return;
    }

    const reviewDetails = {
      rating,
      reviewText,
      reviewerEmail: currentUser.email,
      reviewerUid: currentUser.uid,
      reviewerUsername: currentUser.displayName,
      timestamp: new Date().toISOString(),
    };

    const reviewRef = ref(database, `eateries/${eateryData.id}/reviews`);
    push(reviewRef, reviewDetails)
      .then(() => {
        alert('Review submitted successfully.');
        addExpToUser(currentUser.uid, 50);
        router.back();
      })
      .catch((error) => {
        console.error('Error submitting review:', error);
        alert('Error submitting review. Please try again.');
      });
  };

  const addExpToUser = async (uid: string, expGained: number) => {
    const userRef = ref(database, `users/${uid}/exp`);
    try {
      const snapshot = await get(userRef);
      let currentExp = snapshot.exists() ? snapshot.val() : 0;
      let newExp = currentExp + expGained;
      let level = calculateLevel(newExp);
      let expForNextLevel = expLevels[level - 1].exp;

      while (newExp >= expForNextLevel && level < expLevels.length) {
        newExp -= expForNextLevel;
        level++;
        expForNextLevel = expLevels[level - 1].exp;
      }

      await update(ref(database, `users/${uid}`), { exp: newExp, level });
    } catch (error) {
      console.error('Error adding EXP:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Leave a Review for {eateryData.name}</Text>
      <StarRating rating={rating} onRatingChange={setRating} />
      <TextInput
        style={styles.textInput}
        placeholder="Write your review here..."
        multiline
        numberOfLines={4}
        value={reviewText}
        onChangeText={setReviewText}
      />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
        <Text style={styles.submitButtonText}>Submit Review</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 20,
  },
  textInput: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '100%',
    textAlignVertical: 'top',
    fontFamily: 'Poppins',
  },
  submitButton: {
    backgroundColor: '#f87171',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  backButton: {
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
});

export default ReviewScreen;
