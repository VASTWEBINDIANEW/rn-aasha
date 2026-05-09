import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from "react-native-linear-gradient";
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { hScale, wScale } from '../../utils/styles/dimensions';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const stored = await AsyncStorage.getItem('notifications');
        if (stored) {
          setNotifications(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const clearNotifications = async () => {
    await AsyncStorage.removeItem('notifications');
    setNotifications([]);
  };

  // 🔥 Animated Card
  const renderNotificationItem = ({ item, index }: any) => {
    const fadeAnim = new Animated.Value(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({
        inputRange: [0,1],
        outputRange: [30,0]
      })}] }}>
        <LinearGradient
          colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
          style={styles.card}
        >
          {/* Top Row */}
          <View style={styles.row}>
            <Text style={styles.icon}>🔔</Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>

            {/* Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          </View>

          {/* Date */}
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.screen}>

      {/* 🔥 Premium Header */}
      <LinearGradient
        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🔔 Notifications</Text>

        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearNotifications} style={styles.clearBox}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* 🔥 Content */}
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colorConfig.primaryColor} />
        ) : notifications.length > 0 ? (
          <FlatList
            data={[...notifications].reverse()}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderNotificationItem}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>
              You're all caught up!
            </Text>
          </View>
        )}
      </View>

    </View>
  );
};

export default Notifications;
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F6FB',
  },

  header: {
    paddingTop: hScale(60),
    paddingBottom: hScale(25),
    paddingHorizontal: wScale(16),
    borderBottomLeftRadius: wScale(30),
    borderBottomRightRadius: wScale(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 10,
  },

  headerTitle: {
    fontSize: wScale(20),
    fontWeight: 'bold',
    color: '#fff',
  },

  clearBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: wScale(12),
    paddingVertical: hScale(6),
    borderRadius: wScale(20),
  },

  clearText: {
    color: '#fff',
    fontSize: wScale(12),
    fontWeight: '600',
  },

  container: {
    flex: 1,
    padding: wScale(16),
  },

  card: {
    borderRadius: wScale(20),
    padding: wScale(16),
    marginBottom: hScale(14),
    elevation: 6,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(10),
  },

  iconBox: {
    width: wScale(40),
    height: wScale(40),
    borderRadius: wScale(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    fontSize: wScale(18),
  },

  title: {
    fontSize: wScale(15),
    fontWeight: 'bold',
    color: '#fff',
  },

  body: {
    fontSize: wScale(13),
    color: '#fff',
    marginTop: hScale(2),
  },

  badge: {
    backgroundColor: '#fff',
    paddingHorizontal: wScale(8),
    paddingVertical: hScale(2),
    borderRadius: wScale(10),
  },

  badgeText: {
    fontSize: wScale(9),
    fontWeight: 'bold',
    color: '#000',
  },

  date: {
    fontSize: wScale(11),
    color: '#eee',
    textAlign: 'right',
    marginTop: hScale(10),
  },

  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: wScale(60),
  },

  emptyTitle: {
    fontSize: wScale(18),
    fontWeight: 'bold',
    marginTop: hScale(10),
    color: '#333',
  },

  emptySub: {
    fontSize: wScale(13),
    color: '#888',
    marginTop: hScale(4),
  },
});