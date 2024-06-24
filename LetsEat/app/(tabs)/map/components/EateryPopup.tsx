import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // For star ratings
import { useRouter } from 'expo-router';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

type Eatery = {
  id: number;
  name: string;
  description: string;
  address: string;
  openingHours: Record<DayOfWeek, string>;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  imageTab: any;
  imagePopup: any;
};

type EateryPopupProps = {
  eatery: Eatery | null;
  onClose: () => void;
};

const EateryPopup: React.FC<EateryPopupProps> = ({ eatery, onClose }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showOpeningHours, setShowOpeningHours] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const router = useRouter();
  const database = getDatabase();

  useEffect(() => {
    if (eatery) {
      const reviewsRef = ref(database, `eateries/${eatery.id}/reviews`);
      get(reviewsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const reviews = snapshot.val();
          const totalRatings = Object.values(reviews).map((review: any) => Number(review.rating));
          const average = totalRatings.reduce((acc, rating) => acc + rating, 0) / totalRatings.length;
          setAverageRating(parseFloat(average.toFixed(1)));
        } else {
          setAverageRating(0);
        }
      }).catch((error) => {
        console.error("Error fetching reviews:", error);
      });
    }
  }, [eatery, database]);

  const parseTime = (timeString: string): Date => {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  if (!eatery) return <Text style={styles.instructions}>Click on an eatery to see more details!</Text>;

  const currentTime = new Date();
  const singaporeCurrentTime = new Date(currentTime.getTime());

  const dayOfWeek: DayOfWeek = singaporeCurrentTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek;
  const openingHours = eatery.openingHours[dayOfWeek];

  let isOpen = false;

  if (openingHours && openingHours.toLowerCase() !== 'closed') {
    const [opening, closing] = openingHours.split(' - ');
    const openingTime = parseTime(opening);
    const closingTime = parseTime(closing);

    isOpen = singaporeCurrentTime >= openingTime && singaporeCurrentTime <= closingTime;
  }

  const handleLeaveReview = () => {
    router.push({ pathname: './map/components/ReviewScreen', params: { eatery: JSON.stringify(eatery) } });
  };

  return (
    <>
      <View style={styles.popup}>
        <TouchableOpacity style={styles.touchableContainer} onPress={() => setIsModalVisible(true)}>
          <View style={styles.row}>
            <Text style={styles.popupTitle}>{eatery.name}</Text>
            <Text style={[styles.status, isOpen ? styles.open : styles.closed]}>
              {isOpen ? 'Open Now' : 'Closed Now'}
            </Text>
            <Image source={require('../../../../assets/icons/up-arrows.png')} style={styles.upArrow} />
          </View>
          <Image source={eatery.imagePopup} style={styles.image} />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <ScrollView style={styles.modalView}>
          <Image source={eatery.imageTab} style={styles.modalImage} />
          <Text style={styles.modalTitle}>{eatery.name}</Text>
          <Text style={styles.modalDescription}>{eatery.description}</Text>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Address</Text>
            <Text>{eatery.address}</Text>
          </View>
          <View style={styles.section}>
            <TouchableOpacity onPress={() => setShowOpeningHours(!showOpeningHours)} style={styles.openingHoursHeader}>
              <Text style={styles.sectionHeader}>Opening Hours</Text>
              <Image source={require('../../../../assets/icons/down-arrow.png')} style={styles.downArrow} />
            </TouchableOpacity>
            {showOpeningHours && Object.keys(eatery.openingHours).map((day) => (
              <Text key={day} style={styles.openingHours}>
                {day.charAt(0).toUpperCase() + day.slice(1)}: {eatery.openingHours[day as DayOfWeek]}
              </Text>
            ))}
          </View>
          <TouchableOpacity style={styles.section} onPress={() => setShowReviews(!showReviews)}>
            <View style={styles.reviewHeader}>
              <Text style={styles.sectionHeader}>Reviews</Text>
              <Text style={styles.averageRating}>
                {averageRating.toFixed(1)} <FontAwesome name="star" size={16} color="#FFD700" />
              </Text>
              <Image source={require('../../../../assets/icons/down-arrow.png')} style={styles.downArrow} />
            </View>
            {showReviews && (
              <TouchableOpacity style={styles.leaveReviewButton} onPress={() => {setIsModalVisible(false);
                                                                                handleLeaveReview();}}>
                <Text style={styles.leaveReviewButtonText}>Leave a Review</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/takeaway')}>
              <Text style={styles.buttonText}>Takeaway</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '35%',
    padding: 20,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    padding: 20,
  },
  touchableContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    flex: 1,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    marginLeft: 10,
  },
  open: {
    color: 'green',
  },
  closed: {
    color: 'red',
  },
  upArrow: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginTop: 10,
  },
  modalView: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    fontFamily: 'Poppins',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
    fontFamily: 'Poppins',
    marginBottom: 15,
  },
  section: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
    marginTop: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  openingHoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downArrow: {
    width: 20,
    height: 20,
  },
  openingHours: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'Poppins',
    marginTop: 5,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 16,
    fontFamily: 'Poppins',
    marginRight: 180,
  },
  leaveReviewButton: {
    backgroundColor: 'pink',
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    alignSelf: 'center',
  },
  leaveReviewButtonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: 'pink',
    borderRadius: 20,
    padding: 10,
    width: '90%',
    elevation: 2,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  closeButton: {
    backgroundColor: 'red',
    borderRadius: 20,
    padding: 10,
    width: '90%',
    elevation: 2,
    marginTop: 15,
    alignSelf: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});

export default EateryPopup;
