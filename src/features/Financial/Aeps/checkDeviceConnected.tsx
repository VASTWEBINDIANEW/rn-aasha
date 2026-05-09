import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDeviceInfo } from 'react-native-rdservice-fingerprintscanner';

const DeviceConnected = () => {
    const [isConnect, setIsConnect] = useState(false);

    const start = () => {
        getDeviceInfo()
            .then((res) => {
                const isReady = res.rdServiceInfoJson.RDService.status;
                const rdServicePackage = res.rdServicePackage;

                console.log(rdServicePackage);

                if (isReady === 'READY') {
                    setIsConnect(true); // Device is connected
                    console.log('Device is ready:', isReady);
                } else {
                    setIsConnect(false); // Device is disconnected
                    console.log('Device is', isReady === 'NOTREADY' ? 'not ready' : 'ready');
                }
            })
            .catch((error) => {
                console.error('Error while fetching device info:', error);
            });
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            start();
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={[styles.text, { color: isConnect ? 'green' : 'red' }]}>
                {isConnect ? 'Device Is Connected' : 'Device Is Dis-Connected'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default DeviceConnected;
