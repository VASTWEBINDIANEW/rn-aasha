import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch } from 'react-native-switch';
import { hScale, wScale } from '../../../utils/styles/dimensions'; // Assuming wScale is imported correctly

const SwitchButton2 = ({ Status, onChange }) => {
    const [isOn, setIsOn] = useState(Status);

  

    return (
        <View style={[styles.container, { paddingRight: isOn ? wScale(1) : 0, paddingLeft: isOn ? 0 : wScale(0) }]}>
            <Switch
                value={isOn}
                onValueChange={(val) => {
                    setIsOn(val);
                    if (onChange) {
                        onChange(val); 
                    }
                }}
                disabled={false}
                activeText={'ON'}
                inActiveText={'OFF'}
                circleSize={wScale(22)}
                barHeight={wScale(25)}
                circleBorderWidth={0}
                backgroundActive={'green'}
                backgroundInactive={'gray'}
                circleActiveColor={'#fff'}
                circleInActiveColor={'#000000'}
                changeValueImmediately={true} // Change state immediately without waiting for animation
                innerCircleStyle={{ alignItems: "center", justifyContent: "center", borderRadius: 10}} 
                outerCircleStyle={{}} 
                renderActiveText={true}
                renderInActiveText={true}
                switchLeftPx={2}
                switchRightPx={2}
                switchWidthMultiplier={2}
                switchBorderRadius={9}

            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        alignSelf: 'center',
    },
});

export default SwitchButton2;
