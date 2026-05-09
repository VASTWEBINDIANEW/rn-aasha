import { ToastAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import firestore from '@react-native-firebase/firestore';

// export const appendLog = async (message,name) => {
//   console.log(name,'@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
//   const LOG_FILE_PATH = `${RNFS.DownloadDirectoryPath}/${name}--login_debug_log.txt`;

//   const timestamp = new Date().toISOString();
//   const logMessage = `[${timestamp}] ${message}\n`;

//   try {
//     await RNFS.appendFile(LOG_FILE_PATH, logMessage, 'utf8');
//     //ToastAndroid.show('Log saved successfully', ToastAndroid.SHORT);  
//   } catch (error) {
//     console.log('Failed to write to log file:', error);
//   //  ToastAndroid.show('Failed to save log file', ToastAndroid.LONG); 
//   }
// };
// export const appendLog = async (message, name) => {

//   const LOG_FILE_PATH = `${RNFS.DownloadDirectoryPath}/${name}--login_debug_log.txt`;

//   const timestamp = new Date().toISOString();
//   const logMessage = `[${timestamp}] ${message}\n`;

//   try {
//     // ye same file me new line add karega
//     await RNFS.appendFile(LOG_FILE_PATH, logMessage, 'utf8');

//   } catch (error) {
//     console.log('Failed to write to log file:', error);
//   }
// };

export const appendLog = async (isWrite ,message, name) => {
if(isWrite == false){
  return
}
  const timestamp = new Date().toISOString();
  // Hum 'name' (jo aapne 'OPPO' rakha hai) ko hi doc ID bana lete hain
  // Ya fir date use kar sakte hain: `Login_Log_${name}`
  const docId = `${name}_Current_Trace`; 

  try {
    await firestore()
      .collection('debug_logs')
      .doc(docId)
      .set({
        user: name,
        last_updated: timestamp,
        // arrayUnion har naye message ko purane messages ke niche add karega
        steps: firestore.FieldValue.arrayUnion({
          msg: message,
          time: timestamp
        })
      }, { merge: true }); // merge: true se purana data delete nahi hoga

  } catch (error) {
    console.log("Firebase log error:", error);
  }
};
//export const getLogFilePath = () => LOG_FILE_PATH;
export const generateUniqueId = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomPart = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomPart += chars[randomIndex];
  }

  const timestampPart = Date.now().toString(36); // base-36 timestamp
  const uniqueId = randomPart + timestampPart;

  return uniqueId; // final ID will be longer than length, but very unique
};
const safeValue = (value, fallback = "NOT_AVAILABLE") => {
  try {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === "null" ||
      value === "undefined"
    ) {
      return fallback;
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return value;
  } catch (e) {
    return fallback;
  }
};

export const saveLogToFirestore = async (
  uniqueId,
  logType,
  step,
  data,
  deviceInfoRef
) => {
  try {

    const safeStringify = (obj) => {
      try {
        return JSON.stringify(obj);
      } catch {
        return "CIRCULAR_DATA";
      }
    };

    const payload =
      typeof data === "object" ? safeStringify(data) : safeValue(data);

    await Firestore()
      .collection("AppLogs")
      .doc(uniqueId || "UNKNOWN_USER")
      .collection("LoginAttempts")
      .add({
        logType: safeValue(logType),
        step: safeValue(step),

        timestamp: Firestore.FieldValue.serverTimestamp(),

        payload: payload || "NULL",

        deviceInfo: {
          brand: safeValue(deviceInfoRef?.brand, "UNKNOWN_BRAND"),
          model: safeValue(deviceInfoRef?.modelNumber, "UNKNOWN_MODEL"),
          ip: safeValue(deviceInfoRef?.ipAddress, "UNKNOWN_IP"),
        },
      });

  } catch (error) {
    console.error("Firestore Log Error:", error);
  }
};