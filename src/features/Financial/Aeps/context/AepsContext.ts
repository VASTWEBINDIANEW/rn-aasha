
import { createContext,} from 'react';

import noop from 'lodash/noop';


export const AepsContext = createContext<unknown>({
    setAadharNumber: noop,
    setMobileNumber: noop,
    setConsumerName: noop,
    setBankName: noop,
    setBankId: noop,
    setFingerprintData: noop,
    aadharNumber: '',
    mobileNumber: '',
    consumerName: '',
    bankName: '',
    bankid:'',
    fingerprintData:'',
    isValid:false,
    scanFingerprint: noop,
});
