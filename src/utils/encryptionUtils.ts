import 'react-native-get-random-values';
import Crypto from 'crypto-js';
import uuid from 'react-native-uuid';

export const encrypt = (data: any[]) => {
  const uuid4 = uuid.v4().toString().substring(0, 16);
  const uuid1 = uuid.v1().toString().substring(0, 16);
  const keyStr = uuid1.toString();
  const ivStr = uuid4.toString();

  const keyEncode = Crypto.enc.Base64.stringify(Crypto.enc.Utf8.parse(keyStr));
  const ivEncode = Crypto.enc.Base64.stringify(Crypto.enc.Utf8.parse(ivStr));
  const key = Crypto.enc.Utf8.parse(keyStr);
  const ivEnc = Crypto.enc.Utf8.parse(ivStr);

  const encryptedData: string[] = [];
  for (let i = 0; i < data.length; i++) {
    const ecrypted = Crypto.AES.encrypt(data[i], key, {
      iv: ivEnc,
      mode: Crypto.mode.CBC,
      padding: Crypto.pad.Pkcs7,
    });
    encryptedData.push(ecrypted.toString());
  }
  return {
    encryptedData,
    keyEncode,
    ivEncode,
  };
};

export const decryptData = (
  key: string,
  iv: string,
  data: string | Crypto.lib.CipherParams,
) => {
  const keyDecode = Crypto.enc.Base64.parse(key);
  const ivDecode = Crypto.enc.Base64.parse(iv);

  const decrypt = Crypto.AES.decrypt(data, keyDecode, {
    iv: ivDecode,
    mode: Crypto.mode.CBC,
    padding: Crypto.pad.Pkcs7,
  });
  return decrypt.toString(Crypto.enc.Utf8);
};
