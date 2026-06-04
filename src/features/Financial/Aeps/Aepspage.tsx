// import { translate } from "../../../utils/languageUtils/I18n";
// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   ToastAndroid,
// } from 'react-native';
// import { useDispatch } from 'react-redux';

// import { APP_URLS } from '../../../utils/network/urls';
// import useAxiosHook from '../../../utils/network/AxiosClient';
// import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
// import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';
// import AepsTabScreen from './AepsTabScreen';
// import ShowLoader from '../../../components/ShowLoder';
// import { setActiveAepsLine } from '../../../reduxUtils/store/userInfoSlice';

// const AepsScreen = () => {
//   const { post } = useAxiosHook();
//   const dispatch = useDispatch();

//   const [selectedLine, setSelectedLine] = useState(1);
//   const [isLoading, setIsLoading] = useState(false);

//   // FIXED: isAutoSwitching ko yahan sahi se define kiya gaya hai
//   const isAutoSwitching = useRef(false);

//   const checkAeps = useCallback(async (requestedLine: number) => {
//     try {
//       setIsLoading(true);
//       console.log('--- Checking Status for Line:', requestedLine, '---');

//       const response = await post({ url: APP_URLS.AepsStatusCheck });

//       // ERROR CHECK: Agar server se HTML (404 error) aa raha ho
//       if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
//         Alert.alert("API Error", "Server configuration issue (404). Please check APP_URLS.AepsStatusCheck");
//         return;
//       }

//       if (!response) {
//         console.log('Empty Response Received');
//         return;
//       }

//       // Response Logs for Line by Line Check
//       console.log('Response status1:', response.status1);
//       console.log('Response status2:', response.status2);
//       console.log('Response Message:', response.message);

//       const { status1, status2, Api1, Api2, message = "No Message from Server" } = response;

//       if (requestedLine === 1) {
//         if (status1 === true) {
//           dispatch(setActiveAepsLine({
//             line: 'green',
//             provider: Api1,
//             status: true,
//           }));
//           ToastAndroid.show(
//             `${Api1} Green Line Active`,
//             ToastAndroid.SHORT
//           );
//         } else {
//           if (!isAutoSwitching.current) {
//             isAutoSwitching.current = true;
//             Alert.alert('Notice', message || 'Green Line is down.', [
//               { text: 'Switch to Yellow', onPress: () => setSelectedLine(1) }
//             ]);
//           }
//         }
//       } else if (requestedLine === 2) {
//         if (status2 === true) {
//           dispatch(setActiveAepsLine({
//             line: 'yellow',
//             provider: Api2,
//             status: true,
//           }));
//           ToastAndroid.show(
//             `${Api2} Yellow Line Active`,
//             ToastAndroid.SHORT
//           );
//         } else {
//           if (!isAutoSwitching.current) {
//             isAutoSwitching.current = true;
//             Alert.alert('Notice', message || 'Yellow Line is down.', [
//               { text: 'Switch to Green', onPress: () => setSelectedLine(0) }
//             ]);
//           }
//         }
//       }

//       // Reset flag after 1.5 seconds
//       setTimeout(() => { isAutoSwitching.current = false; }, 1500);

//     } catch (error: any) {
//       console.error('--- EXCEPTION LOG ---');
//       console.error('Msg:', error.message);
//       Alert.alert('Fatal Error', `Detail: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [post, dispatch]);

//   useEffect(() => {
//     checkAeps(selectedLine === 0 ? 1 : 2);
//   }, [selectedLine, checkAeps]);

//   return (
//     <View style={styles.container}>
//       <AppBarSecond title="AEPS / AADHAAR PAY" />

//       <View style={styles.radioContainer}>
//         <TouchableOpacity
//           disabled={isLoading}
//           style={[styles.radioButton, styles.yellowBg, selectedLine === 1 && styles.yellowSelected]}
//           onPress={() => {
//             isAutoSwitching.current = false;
//             setSelectedLine(1);
//           }}
//         >
//           {selectedLine === 1 && (
//             <View style={styles.check}><CheckSvg color="#F4C430" size={14} /></View>
//           )}
//           <Text style={styles.radioText}>{translate("Yellow_Line")}</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           disabled={isLoading}
//           style={[styles.radioButton, styles.greenBg, selectedLine === 0 && styles.greenSelected]}
//           onPress={() => {
//             isAutoSwitching.current = false;
//             setSelectedLine(0);
//           }}
//         >
//           {selectedLine === 0 && (
//             <View style={styles.check}><CheckSvg color="#1FAA59" size={14} /></View>
//           )}
//           <Text style={styles.radioText}>{translate("Green_Line")}</Text>
//         </TouchableOpacity>


//       </View>

//       <View style={{ flex: 1 }}>
//         {isLoading && <ShowLoader />}

//         <AepsTabScreen />
//       </View>

//     </View>
//   );
// };

// export default AepsScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f8f9fa' },
//   radioContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 10,
//     backgroundColor: '#fff',
//     elevation: 4,
//   },
//   radioButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: '48%',
//     paddingVertical: 12,
//     borderRadius: 8,
//   },
//   greenBg: { backgroundColor: '#1FAA59' },
//   yellowBg: { backgroundColor: '#F4C430' },
//   greenSelected: { backgroundColor: '#138D4E', borderWidth: 2, borderColor: '#fff' },
//   yellowSelected: { backgroundColor: '#E0C200', borderWidth: 2, borderColor: '#fff' },
//   radioText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
//   check: { backgroundColor: '#fff', borderRadius: 10, padding: 2, marginRight: 8 },
// });





// import { translate } from "../../../utils/languageUtils/I18n";
// import React, {
//   useEffect,
//   useState,
//   useCallback,
//   useRef
// } from 'react';

// import {
//   View,
//   Text,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   Modal,
// } from 'react-native';

// import { useDispatch } from 'react-redux';

// import { APP_URLS } from '../../../utils/network/urls';
// import useAxiosHook from '../../../utils/network/AxiosClient';

// import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
// import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';

// import AepsTabScreen from './AepsTabScreen';
// import ShowLoader from '../../../components/ShowLoder';

// import {
//   setActiveAepsLine
// } from '../../../reduxUtils/store/userInfoSlice';

// const AepsScreen = () => {

//   const { post } = useAxiosHook();

//   const dispatch = useDispatch();

//   const [selectedLine, setSelectedLine] =
//     useState<'green' | 'yellow'>('yellow');

//   const [isLoading, setIsLoading] =
//     useState(false);

//   const [isLineSelected, setIsLineSelected] =
//     useState(false);

//   const [showProviderModal, setShowProviderModal] =
//     useState(false);

//   const [providerData, setProviderData] =
//     useState({
//       Api1: '',
//       Api2: '',
//     });

//   const [apiStatus, setApiStatus] = useState({
//     green: false,
//     yellow: false,
//   });

//   const isPopupShown = useRef(false);

//   // ==========================================
//   // CHECK AEPS
//   // ==========================================

//   const checkAeps = useCallback(

//     async () => {

//       try {

//         setIsLoading(true);

//         const response = await post({
//           url: APP_URLS.AepsStatusCheck
//         });

//         // HTML ERROR CHECK

//         if (
//           typeof response === 'string' &&
//           response.includes('<!DOCTYPE html>')
//         ) {

//           Alert.alert(
//             "API Error",
//             "Server configuration issue (404)"
//           );

//           return;
//         }

//         if (!response) {

//           console.log('Empty Response');

//           return;
//         }

//         console.log(
//           'AEPS RESPONSE:',
//           response
//         );

//         const {
//           status1,
//           status2,
//           Api1,
//           Api2,
//         } = response;

//         // ==========================================
//         // STATUS
//         // ==========================================

//         const greenActive =
//           status1 === true;

//         const yellowActive =
//           status2 === true;

//         setApiStatus({
//           green: greenActive,
//           yellow: yellowActive,
//         });

//         // ==========================================
//         // BOTH DOWN
//         // ==========================================

//         if (!greenActive && !yellowActive) {

//           Alert.alert(
//             "Service Down",
//             "Both AEPS services are unavailable."
//           );

//           return;
//         }

//         // ==========================================
//         // ONLY GREEN ACTIVE
//         // ==========================================

//         if (
//           greenActive &&
//           !yellowActive
//         ) {

//           setSelectedLine('green');

//           setIsLineSelected(true);

//           dispatch(
//             setActiveAepsLine({
//               line: 'green',
//               provider: Api1?.toUpperCase(),
//               status: true,
//             })
//           );
//         }

//         // ==========================================
//         // ONLY YELLOW ACTIVE
//         // ==========================================

//         else if (
//           !greenActive &&
//           yellowActive
//         ) {

//           setSelectedLine('yellow');

//           setIsLineSelected(true);

//           dispatch(
//             setActiveAepsLine({
//               line: 'yellow',
//               provider: Api2?.toUpperCase(),
//               status: true,
//             })
//           );
//         }

//         // ==========================================
//         // BOTH ACTIVE
//         // ==========================================

//         else {

//           if (
//             !isLineSelected &&
//             !isPopupShown.current
//           ) {

//             isPopupShown.current = true;

//             setTimeout(() => {

//               setProviderData({
//                 Api1,
//                 Api2
//               });

//               setIsLoading(false);

//               setShowProviderModal(true);

//             }, 1000);
//           }
//         }

//       } catch (error: any) {

//         console.log(
//           'ERROR:',
//           error
//         );

//         Alert.alert(
//           'Fatal Error',
//           error?.message ||
//           'Something went wrong'
//         );

//       } finally {
//   if (!showProviderModal) {
//     setIsLoading(false);
//   }
//       }
//     },

//     [
//       post,
//       dispatch,
//       isLineSelected
//     ]
//   );

//   // ==========================================
//   // FIRST LOAD ONLY
//   // ==========================================

//   useEffect(() => {

//     checkAeps();

//   }, []);

//   // ==========================================
//   // SHOW BUTTONS ONLY WHEN BOTH ACTIVE
//   // ==========================================

//   const showLineSelection =
//     apiStatus.green &&
//     apiStatus.yellow;

//   return (

//     <View style={styles.container}>

//       <AppBarSecond
//         title="AEPS / AADHAAR PAY"
//       />

//       {/* ===================================== */}
//       {/* PROVIDER SELECTION MODAL */}
//       {/* ===================================== */}

//       <Modal
//         visible={showProviderModal}
//         transparent
//         animationType="fade"
//       >

//         <View style={styles.modalContainer}>

//           <View style={styles.modalContent}>

//             <Text style={styles.modalTitle}>
//               Select AEPS Provider
//             </Text>

//             {/* GREEN */}

//             <TouchableOpacity
//               style={styles.providerButtonGreen}

//               onPress={() => {

//                 setSelectedLine('green');

//                 setIsLineSelected(true);

//                 dispatch(
//                   setActiveAepsLine({
//                     line: 'green',
//                     provider: providerData.Api1?.toUpperCase(),
//                     status: true,
//                   })
//                 );

//                 setShowProviderModal(false);

//                 isPopupShown.current = false;
//               }}
//             >

//               <Text style={styles.providerButtonText}>

//                 (Green Line)

//               </Text>

//             </TouchableOpacity>

//             {/* YELLOW */}

//             <TouchableOpacity
//               style={styles.providerButtonYellow}

//               onPress={() => {

//                 setSelectedLine('yellow');

//                 setIsLineSelected(true);

//                 dispatch(
//                   setActiveAepsLine({
//                     line: 'yellow',
//                     provider: providerData.Api2.toUpperCase(),
//                     status: true,
//                   })
//                 );

//                 setShowProviderModal(false);

//                 isPopupShown.current = false;
//               }}
//             >

//               <Text style={styles.providerButtonText}>

//                 (Yellow Line)

//               </Text>

//             </TouchableOpacity>

//           </View>

//         </View>

//       </Modal>

//       {/* ===================================== */}
//       {/* BOTH ACTIVE TAB SELECTION */}
//       {/* ===================================== */}

//       {showLineSelection && isLineSelected && (

//         <View style={styles.radioContainer}>

//           {/* YELLOW */}

//           <TouchableOpacity
//             disabled={isLoading}
//             style={[
//               styles.radioButton,
//               styles.yellowBg,
//               { marginRight: 8 },

//               selectedLine === 'yellow' &&
//               styles.yellowSelected
//             ]}
//             onPress={() => {

//               setSelectedLine('yellow');

//               dispatch(
//                 setActiveAepsLine({
//                   line: 'yellow',
//                   provider: providerData.Api2?.toUpperCase(),
//                   status: true,
//                 })
//               );
//             }}
//           >

//             {selectedLine === 'yellow' && (

//               <View style={styles.check}>

//                 <CheckSvg
//                   color="#F4C430"
//                   size={14}
//                 />

//               </View>
//             )}

//             <Text style={styles.radioText}>

//               {translate("Yellow_Line")}

//             </Text>

//           </TouchableOpacity>

//           {/* GREEN */}

//           <TouchableOpacity
//             disabled={isLoading}
//             style={[
//               styles.radioButton,
//               styles.greenBg,
//               { marginLeft: 8 },

//               selectedLine === 'green' &&
//               styles.greenSelected
//             ]}
//             onPress={() => {

//               setSelectedLine('green');

//               dispatch(
//                 setActiveAepsLine({
//                   line: 'green',
//                   provider: providerData.Api1?.toUpperCase(),
//                   status: true,
//                 })
//               );
//             }}
//           >

//             {selectedLine === 'green' && (

//               <View style={styles.check}>

//                 <CheckSvg
//                   color="#1FAA59"
//                   size={14}
//                 />

//               </View>
//             )}

//             <Text style={styles.radioText}>

//               {translate("Green_Line")}

//             </Text>

//           </TouchableOpacity>

//         </View>
//       )}

//       {/* ===================================== */}
//       {/* BODY */}
//       {/* ===================================== */}

//       <View style={{ flex: 1 }}>

//         {isLoading && <ShowLoader />}

//         {(
//           apiStatus.green !== apiStatus.yellow ||
//           isLineSelected
//         ) && (

//             <AepsTabScreen />
//           )}

//       </View>

//     </View>
//   );
// };

// export default AepsScreen;

// const styles = StyleSheet.create({

//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa'
//   },

//   radioContainer: {
//     flexDirection: 'row',
//     padding: 10,
//     backgroundColor: '#fff',
//     elevation: 4,
//   },

//   radioButton: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 8,
//   },

//   greenBg: {
//     backgroundColor: '#1FAA59'
//   },

//   yellowBg: {
//     backgroundColor: '#F4C430'
//   },

//   greenSelected: {
//     backgroundColor: '#138D4E',
//     borderWidth: 2,
//     borderColor: '#fff'
//   },

//   yellowSelected: {
//     backgroundColor: '#E0C200',
//     borderWidth: 2,
//     borderColor: '#fff'
//   },

//   radioText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: 'bold'
//   },

//   check: {
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 2,
//     marginRight: 8
//   },

//   // =====================================
//   // MODAL
//   // =====================================

//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.4)',
//   },

//   modalContent: {
//     width: '85%',
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//   },

//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//     color: '#000',
//   },

//   providerButtonGreen: {
//     backgroundColor: '#1FAA59',
//     paddingVertical: 14,
//     borderRadius: 10,
//     marginBottom: 15,
//     alignItems: 'center',
//   },

//   providerButtonYellow: {
//     backgroundColor: '#F4C430',
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//   },

//   providerButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },

// });







import { translate } from "../../../utils/languageUtils/I18n";
import React, {
  useEffect,
  useState,
  useCallback,
  useRef
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';

import { useDispatch } from 'react-redux';

import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';

import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';

import AepsTabScreen from './AepsTabScreen';
import ShowLoader from '../../../components/ShowLoder';

import {
  setActiveAepsLine
} from '../../../reduxUtils/store/userInfoSlice';

const AepsScreen = () => {

  const { post } = useAxiosHook();

  const dispatch = useDispatch();

  const [selectedLine, setSelectedLine] =
    useState<'green' | 'yellow'>('yellow');

  const [isLoading, setIsLoading] =
    useState(false);

  const [isLineSelected, setIsLineSelected] =
    useState(false);

  const [showProviderModal, setShowProviderModal] =
    useState(false);

  const [providerData, setProviderData] =
    useState({
      Api1: '',
      Api2: '',
    });

  const [apiStatus, setApiStatus] = useState({
    green: false,
    yellow: false,
  });

  const isPopupShown = useRef(false);

  // ==========================================
  // CHECK AEPS
  // ==========================================

  // const checkAeps = useCallback(

  //   async () => {

  //     try {

  //       setIsLoading(true);

  //       const response = await post({
  //         url: APP_URLS.AepsStatusCheck
  //       });

  //       // HTML ERROR CHECK

  //       if (
  //         typeof response === 'string' &&
  //         response.includes('<!DOCTYPE html>')
  //       ) {

  //         Alert.alert(
  //           "API Error",
  //           "Server configuration issue (404)"
  //         );

  //         return;
  //       }

  //       if (!response) {

  //         console.log('Empty Response');

  //         return;
  //       }

  //       console.log(
  //         'AEPS RESPONSE:',
  //         response
  //       );

  //       const {
  //         status1,
  //         status2,
  //         Api1,
  //         Api2,
  //       } = response;

  //       // ==========================================
  //       // STATUS
  //       // ==========================================

  //       const greenActive =
  //         status1 === true;

  //       const yellowActive =
  //         status2 === true;

  //       setApiStatus({
  //         green: greenActive,
  //         yellow: yellowActive,
  //       });

  //       // ==========================================
  //       // BOTH DOWN
  //       // ==========================================

  //       if (!greenActive && !yellowActive) {

  //         Alert.alert(
  //           "Service Down",
  //           "Both AEPS services are unavailable."
  //         );

  //         return;
  //       }

  //       // ==========================================
  //       // ONLY GREEN ACTIVE
  //       // ==========================================

  //       if (
  //         greenActive &&
  //         !yellowActive
  //       ) {

  //         setSelectedLine('green');

  //         setIsLineSelected(true);

  //         dispatch(
  //           setActiveAepsLine({
  //             line: 'green',
  //             provider: Api1?.toUpperCase(),
  //             status: true,
  //           })
  //         );
  //       }

  //       // ==========================================
  //       // ONLY YELLOW ACTIVE
  //       // ==========================================

  //       else if (
  //         !greenActive &&
  //         yellowActive
  //       ) {

  //         setSelectedLine('yellow');

  //         setIsLineSelected(true);

  //         dispatch(
  //           setActiveAepsLine({
  //             line: 'yellow',
  //             provider: Api2?.toUpperCase(),
  //             status: true,
  //           })
  //         );
  //       }

  //       // ==========================================
  //       // BOTH ACTIVE
  //       // ==========================================

  //       else {

  //         if (
  //           !isLineSelected &&
  //           !isPopupShown.current
  //         ) {

  //           isPopupShown.current = true;

  //           setTimeout(() => {

  //             setProviderData({
  //               Api1,
  //               Api2
  //             });

  //         setIsLoading(false); 

  //             setShowProviderModal(true);

  //           }, 500);
  //         }
  //       }

  //     } catch (error: any) {

  //       console.log(
  //         'ERROR:',
  //         error
  //       );

  //       Alert.alert(
  //         'Fatal Error',
  //         error?.message ||
  //         'Something went wrong'
  //       );

  //     } finally {
 
  //    if (!isPopupShown.current) {
  //   setIsLoading(false);
  // }
  
  //     }
  //   },

  //   [
  //     post,
  //     dispatch,
  //     isLineSelected
  //   ]
  // );


  const checkAeps = useCallback(async () => {
  try {
    setIsLoading(true);

    const response = await post({ url: APP_URLS.AepsStatusCheck });

    if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
      Alert.alert("API Error", "Server configuration issue (404)");
      return;
    }

    if (!response) {
      console.log('Empty Response');
      return;
    }

    const { status1, status2, Api1, Api2 } = response;

    const greenActive = status1 === true;
    const yellowActive = status2 === true;

    setApiStatus({ green: greenActive, yellow: yellowActive });

    // BOTH DOWN
    if (!greenActive && !yellowActive) {
      Alert.alert("Service Down", "Both AEPS services are unavailable.");
      return;
    }

    // ✅ ONLY GREEN ACTIVE — YAHAN LAGAO
    if (greenActive && !yellowActive) {
      setTimeout(() => {
        setSelectedLine('green');
        setIsLineSelected(true);
        dispatch(setActiveAepsLine({
          line: 'green',
          provider: Api1?.toUpperCase(),
          status: true,
        }));
        setIsLoading(false);
      }, 500);
    }

    // ✅ ONLY YELLOW ACTIVE — YAHAN LAGAO
    else if (!greenActive && yellowActive) {
      setTimeout(() => {
        setSelectedLine('yellow');
        setIsLineSelected(true);
        dispatch(setActiveAepsLine({
          line: 'yellow',
          provider: Api2?.toUpperCase(),
          status: true,
        }));
        setIsLoading(false);
      }, 500);
    }

    // BOTH ACTIVE
    else {
      if (!isLineSelected && !isPopupShown.current) {
        isPopupShown.current = true;
        setTimeout(() => {
          setProviderData({ Api1, Api2 });
          setIsLoading(false);
          setShowProviderModal(true);
        }, 800);
      }
    }

  } catch (error: any) {
    Alert.alert('Fatal Error', error?.message || 'Something went wrong');

  } finally {
    // ✅ Sirf tab band karo jab koi setTimeout use nahi hua
    if (!isPopupShown.current) {
      setIsLoading(false);
    }
  }

}, [post, dispatch, isLineSelected]);

  // ==========================================
  // FIRST LOAD ONLY
  // ==========================================

  useEffect(() => {

    checkAeps();

  }, []);

  // ==========================================
  // SHOW BUTTONS ONLY WHEN BOTH ACTIVE
  // ==========================================

  const showLineSelection =
    apiStatus.green &&
    apiStatus.yellow;

  return (

    <View style={styles.container}>

      <AppBarSecond
        title="AEPS / AADHAAR PAY"
      />

      {/* ===================================== */}
      {/* PROVIDER SELECTION MODAL */}
      {/* ===================================== */}

      <Modal
        visible={showProviderModal}
        transparent
        animationType="fade"
      >

        <View style={styles.modalContainer}>

          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>
              Select AEPS Provider
            </Text>

            {/* GREEN */}

            <TouchableOpacity
              style={styles.providerButtonGreen}

              onPress={() => {

                setSelectedLine('green');

                setIsLineSelected(true);

                dispatch(
                  setActiveAepsLine({
                    line: 'green',
                    provider: providerData.Api1?.toUpperCase(),
                    status: true,
                  })
                );

                setShowProviderModal(false);

                isPopupShown.current = false;
              }}
            >

              <Text style={styles.providerButtonText}>

                (Green Line)

              </Text>

            </TouchableOpacity>

            {/* YELLOW */}

            <TouchableOpacity
              style={styles.providerButtonYellow}

              onPress={() => {

                setSelectedLine('yellow');

                setIsLineSelected(true);

                dispatch(
                  setActiveAepsLine({
                    line: 'yellow',
                    provider: providerData.Api2.toUpperCase(),
                    status: true,
                  })
                );

                setShowProviderModal(false);

                isPopupShown.current = false;
              }}
            >

              <Text style={styles.providerButtonText}>

                (Yellow Line)

              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

      {/* ===================================== */}
      {/* BOTH ACTIVE TAB SELECTION */}
      {/* ===================================== */}

      {showLineSelection && isLineSelected && (

        <View style={styles.radioContainer}>

          {/* YELLOW */}

          <TouchableOpacity
            disabled={isLoading}
            style={[
              styles.radioButton,
              styles.yellowBg,
              { marginRight: 8 },

              selectedLine === 'yellow' &&
              styles.yellowSelected
            ]}
            onPress={() => {

              setSelectedLine('yellow');

              dispatch(
                setActiveAepsLine({
                  line: 'yellow',
                  provider: providerData.Api2?.toUpperCase(),
                  status: true,
                })
              );
            }}
          >

            {selectedLine === 'yellow' && (

              <View style={styles.check}>

                <CheckSvg
                  color="#F4C430"
                  size={14}
                />

              </View>
            )}

            <Text style={styles.radioText}>

              {translate("Yellow_Line")}

            </Text>

          </TouchableOpacity>

          {/* GREEN */}

          <TouchableOpacity
            disabled={isLoading}
            style={[
              styles.radioButton,
              styles.greenBg,
              { marginLeft: 8 },

              selectedLine === 'green' &&
              styles.greenSelected
            ]}
            onPress={() => {

              setSelectedLine('green');

              dispatch(
                setActiveAepsLine({
                  line: 'green',
                  provider: providerData.Api1?.toUpperCase(),
                  status: true,
                })
              );
            }}
          >

            {selectedLine === 'green' && (

              <View style={styles.check}>

                <CheckSvg
                  color="#1FAA59"
                  size={14}
                />

              </View>
            )}

            <Text style={styles.radioText}>

              {translate("Green_Line")}

            </Text>

          </TouchableOpacity>

        </View>
      )}

      {/* ===================================== */}
      {/* BODY */}
      {/* ===================================== */}

      <View style={{ flex: 1 }}>

        {isLoading && !showProviderModal && <ShowLoader />}

        {(
          apiStatus.green !== apiStatus.yellow ||
          isLineSelected
        ) && (

            <AepsTabScreen />
          )}

      </View>

    </View>
  );
};

export default AepsScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },

  radioContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 4,
  },

  radioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },

  greenBg: {
    backgroundColor: '#1FAA59'
  },

  yellowBg: {
    backgroundColor: '#F4C430'
  },

  greenSelected: {
    backgroundColor: '#138D4E',
    borderWidth: 2,
    borderColor: '#fff'
  },

  yellowSelected: {
    backgroundColor: '#E0C200',
    borderWidth: 2,
    borderColor: '#fff'
  },

  radioText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },

  check: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 2,
    marginRight: 8
  },

  // =====================================
  // MODAL
  // =====================================

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },

  providerButtonGreen: {
    backgroundColor: '#1FAA59',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },

  providerButtonYellow: {
    backgroundColor: '#F4C430',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  providerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

});