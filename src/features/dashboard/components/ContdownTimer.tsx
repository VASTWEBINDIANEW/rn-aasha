import React, { useState, useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import { translate } from "../../../utils/languageUtils/I18n";

const CountdownTimer = ({ initialTime, onComplete }) => {
  const [timer, setTimer] = useState(initialTime);
  const [isActive, setIsActive] = useState(true); // New state to control if the timer is active

  useEffect(() => {
    if (!isActive) return; // Prevent the timer from starting if not active

    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          setIsActive(false); // Stop the timer
          if (onComplete) {
            onComplete(); // Call the onComplete callback
          }
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    // Clear interval on component unmount
    return () => clearInterval(countdown);
  }, [isActive]);

  // Function to start the timer manually
  const startTimer = () => {
    setIsActive(true);
    setTimer(initialTime); // Reset the timer to the initial time
  };

  return (
    <Text style={styles.timerText}>
      {translate(`Time remaining: ${timer} seconds`)}
    </Text>
  );
};

const styles = StyleSheet.create({
  timerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "white", // Adjust according to your theme
  },
});

export default CountdownTimer;
