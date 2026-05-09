import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Switch } from 'react-native-switch';
import { hScale, wScale } from '../../../utils/styles/dimensions'; // Assuming wScale is imported correctly
import { SvgXml } from 'react-native-svg';
const rotatesvg = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 36 36" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><rect width="36" height="36" rx="7.2" ry="7.2" fill="rgba" shape="rounded"></rect><g transform="matrix(1.0400000000000005,0,0,1.0400000000000005,-0.7199999999999989,-0.7199999999999989)"><g fill-rule="evenodd"><path fill="#000000" d="M12.57 11.14a11.74 11.74 0 0 1 .22-2.31A10.55 10.55 0 1 0 27.17 23.2a11.74 11.74 0 0 1-2.31.22 12.3 12.3 0 0 1-12.29-12.28z" opacity="1" data-original="#072a30" class=""></path><path fill="#f5d226" d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2zm11.52 20.14A12.26 12.26 0 1 1 13.86 6.48a.86.86 0 0 1 1.08 1.12 9.48 9.48 0 0 0-.65 3.54 10.58 10.58 0 0 0 10.57 10.57 9.49 9.49 0 0 0 3.54-.65.86.86 0 0 1 1.13 1.08zm-.07-4.43a.86.86 0 0 1-.94-.77 10.59 10.59 0 0 0-9.46-9.46.86.86 0 1 1 .17-1.71 12.31 12.31 0 0 1 11 11 .86.86 0 0 1-.76.94z" opacity="1" data-original="#43d685" class=""></path></g></g></svg>
`
const SwitchButton = ({ }) => {
    const [isOn, setIsOn] = useState(false);

    return (
        <View style={[styles.container, { paddingRight: isOn ? wScale(45) : 0, paddingLeft: isOn ? 0 : wScale(45) }
        ]}>
           
            <Switch
                value={isOn}
                onValueChange={(val) => setIsOn(val)}
                disabled={false}
                activeText={'ON'}
                inActiveText={'OFF'}
                circleSize={wScale(100)}
                barHeight={wScale(100)}
                circleBorderWidth={0}
                backgroundActive={'green'}
                backgroundInactive={'gray'}
                circleActiveColor={'#30a566'}
                circleInActiveColor={'#000000'}
                renderInsideCircle={() => <SvgXml xml={rotatesvg} width={wScale(90)} height={hScale(90)} />} // custom component to render inside the Switch circle (Text, Image, etc.)
                changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                innerCircleStyle={{ alignItems: "center", justifyContent: "center", borderRadius: 20 }} // style for inner animated circle for what you (may) be rendering inside the circle
                outerCircleStyle={{}} // style for outer animated circle
                renderActiveText={true}
                renderInActiveText={true}
                switchLeftPx={2} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                switchRightPx={2} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                switchWidthMultiplier={2} // multiplied by the `circleSize` prop to calculate total width of the Switch
                switchBorderRadius={20}
                activeTextStyle={[styles.text, { paddingRight: wScale(35) }]}
                inactiveTextStyle={[styles.text, { paddingLeft: wScale(35) }]} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
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

    text: {
        fontSize: wScale(45),
        fontWeight: 'bold'

    },
});

export default SwitchButton;
