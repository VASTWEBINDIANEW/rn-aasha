import React, { useState, useCallback, useEffect } from "react";
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Text,
    ActivityIndicator,
} from "react-native";

import {
    AadhaarCard,
    PanCard,
    MobileCard,
    EmailCard,
} from "./cards";

import {
    initAadhaar,
    initPan,
    initMobile,
    initEmail,
    AADHAAR_REGEX,
    PAN_REGEX,
    MOBILE_REGEX,
    EMAIL_REGEX,
    toast,
} from "./types";
import useAxiosHook from "../../../../../utils/network/AxiosClient";
import { useFormCtx } from "../FormContext";
import { getStepColor, StepBanner } from "../../../components/FormUI";
import { APP_URLS } from "../../../../../utils/network/urls";
import ShowLoader from "../../../../../components/ShowLoder";



const STEP = 0;

const AadhaarPanVerification = ({ onNext }: { onNext: () => void }) => {
    const { post } = useAxiosHook();
    const { updateStep, nextStep } = useFormCtx();
    const stepColor = getStepColor(STEP);

    // ─── States ─────────────────────────────────────────
    const [aadhaar, setAadhaar] = useState(initAadhaar());
    const [pan, setPan] = useState(initPan());
    const [mobile, setMobile] = useState(initMobile());
    const [email, setEmail] = useState(initEmail());
    const [submitLoading, setSubmitLoading] = useState(false);

    // ─── Validations ────────────────────────────────────
    const isAadhaarValid = AADHAAR_REGEX.test(aadhaar.value);
    const isPanValid = PAN_REGEX.test(pan.value);
    const isMobileValid = MOBILE_REGEX.test(mobile.value);
    const isEmailValid = EMAIL_REGEX.test(email.value);

    // PEHLE — agar mobile already verified hai to canSubmit me count ho
    const canSubmit =
        aadhaar.verified &&
        pan.verified &&
        mobile.verified &&  // ← pre-fill se true aa jayega
        email.verified;

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkForm1Status = async () => {
            try {
                const res = await post({ url: APP_URLS.AadhaarPanCheck });
                console.log('✅ STEP 1 RESPONSE:', JSON.stringify(res, null, 2));

                if (res) {
                    setLoading(false);

                }

                const info = res?.info;

                // ── Aadhaar ──
                if (info?.aadharcard) {
                    setAadhaar(p => ({
                        ...p,
                        value: info.aadharcard,
                        verified: info.aadharsts === true,
                        prefilled: true,   // value aayi → edit band
                    }));
                }
                // value nahi aayi → initAadhaar() same rahega, prefilled: false → editable

                // ── PAN ──
                if (info?.pancardnumber) {
                    setPan(p => ({
                        ...p,
                        value: info.pancardnumber,
                        verified: info.pansts === true,
                        prefilled: true,   // value aayi → edit band
                    }));
                }

                // ── Mobile — hamesha milega, kabhi edit nahi ──
                if (info?.Mobile) {
                    setMobile(p => ({
                        ...p,
                        value: info.Mobile,
                        verified: info.mobilests === true,
                    }));
                }

                // ── Email — hamesha milega, kabhi edit nahi ──
                if (info?.email) {
                    setEmail(p => ({
                        ...p,
                        value: info.email,
                        verified: info.emailsts === true,
                    }));
                }

            } catch (err) {
                console.log('❌ STEP 1 ERROR:', err);
            }
        };
        checkForm1Status();
    }, []);
    const onAadhaarChange = (t: string) => {
        const clean = t.replace(/\D/g, "").slice(0, 12);
        setAadhaar({ ...initAadhaar(), value: clean });
    };


    const sendAadhaarOtp = useCallback(async () => {
        if (!isAadhaarValid) return;
        setAadhaar(p => ({ ...p, loading: true, error: "" }));
        try {
            const url = `${APP_URLS.VerifyAadhaar}?AadharCard=${aadhaar.value}`;
            console.log('📡 STEP 2 URL:', url);
            const res = await post({ url });
            console.log('✅ STEP 2 RESPONSE:', JSON.stringify(res, null, 2));

            // success check — stschk === true
            if (res?.info?.stschk === true) {
                setAadhaar(p => ({
                    ...p, loading: false,
                    panCheckDone: true, otpSent: true,
                    clientId: res?.info?.clientid ?? "",
                    txnId: res?.info?.uniqueId ?? "",
                }));
                toast("OTP sent to registered mobile!");
            } else {
                // info.Message me error aata hai
                const errMsg = res?.info?.Message || "OTP send failed. Try again.";
                toast(errMsg);  // ← ToastAndroid me print
                setAadhaar(p => ({ ...p, loading: false, error: errMsg }));
            }
        } catch (err) {
            console.log('❌ STEP 2 ERROR:', err);
            const errMsg = "Something went wrong. Try again.";
            toast(errMsg);
            setAadhaar(p => ({ ...p, loading: false, error: errMsg }));
        }
    }, [aadhaar.value, isAadhaarValid]);
    const verifyAadhaarOtp = useCallback(async () => {
        if (aadhaar.otpValue.length < 4) return;
        setAadhaar(p => ({ ...p, loading: true, otpError: "" }));
        try {
            const url = `${APP_URLS.VerifyAadhaarOTP}?Clientid=${aadhaar.clientId}&TXNID=${aadhaar.txnId}&OTP=${aadhaar.otpValue}&AadharCard=${aadhaar.value}`;
            console.log('📡 STEP 3 URL:', url);
            console.log('   Clientid:', aadhaar.clientId || 'EMPTY ❌');
            console.log('   TXNID   :', aadhaar.txnId || 'EMPTY ❌');
            console.log('   OTP     :', aadhaar.otpValue || 'EMPTY ❌');
            const res = await post({ url });
            console.log('✅ STEP 3 RESPONSE:', JSON.stringify(res, null, 2));

            // info.stschk === true → verified
            if (res?.info?.stschk === true) {
                setAadhaar(p => ({ ...p, loading: false, verified: true }));
                toast("Aadhaar verified!");
            } else {
                const errMsg = res?.info?.Message || "Invalid OTP. Try again.";
                toast(errMsg);
                setAadhaar(p => ({ ...p, loading: false, otpError: errMsg }));
            }
        } catch (err) {
            console.log('❌ STEP 3 ERROR:', err);
            setAadhaar(p => ({ ...p, loading: false, otpError: "Verification failed. Try again." }));
        }
    }, [aadhaar.clientId, aadhaar.txnId, aadhaar.otpValue, aadhaar.value]);
    const onPanChange = (t: string) => {
        setPan({ ...initPan(), value: t.toUpperCase() });
    };
    
    const verifyPan = useCallback(async () => {
        if (!isPanValid) return;

        setPan(prev => ({
            ...prev,
            loading: true,
            error: "",
        }));

        try {
            const url = `${APP_URLS.VerifyPanCard}pancardnumber=${pan.value}`;

            console.log("📡 PAN URL:", url);

            const res = await post({ url });

            console.log(
                "✅ PAN RESPONSE:",
                JSON.stringify(res, null, 2),
            );

            // ✅ Different success checks
            const isSuccess =
                res?.checkpan === true ||
                res?.checkpan === "true" ||
                res?.StatusCode === 200 ||
                res?.status === 200 ||
                res?.success === true;

            if (isSuccess) {
                setPan(prev => ({
                    ...prev,
                    loading: false,
                    verified: true,
                    error: "",
                }));

                toast(
                    res?.message ||
                    res?.Message ||
                    "PAN verified successfully!",
                );

            } else {
                const errorMessage =
                    res?.message ||
                    res?.Message ||
                    "Invalid PAN number";

                toast(errorMessage);

                setPan(prev => ({
                    ...prev,
                    loading: false,
                    verified: false,
                    error: errorMessage,
                }));
            }

        } catch (err: any) {
            console.log(
                "❌ PAN ERROR:",
                JSON.stringify(err, null, 2),
            );

            const errorMessage =
                err?.response?.data?.message ||
                err?.response?.data?.Message ||
                err?.message ||
                "Verification failed. Try again.";

            setPan(prev => ({
                ...prev,
                loading: false,
                verified: false,
                error: errorMessage,
            }));

            toast(errorMessage);
        }
    }, [pan.value, isPanValid]);

    const onMobileChange = (t: string) => {
        const clean = t.replace(/\D/g, "").slice(0, 10);
        setMobile({ ...initMobile(), value: clean });
    };



    const sendMobileOtp = useCallback(async () => {
        if (!isMobileValid) return;
        setMobile(p => ({ ...p, loading: true, error: "" }));
        try {
            const url = `${APP_URLS.SendOTPMobile}Mobile=${mobile.value}&Name=''&Type=Mobile`;
            console.log('📡 MOBILE OTP URL:', url);
            const res = await post({ url });
            console.log('✅ MOBILE OTP RESPONSE:', JSON.stringify(res, null, 2));

            if (res?.StatusCode === 200 || res?.Content?.ADDINFO === "Send OTP") {
                setMobile(p => ({ ...p, loading: false, otpSent: true }));
                toast("OTP sent to mobile!");
            } else {
                setMobile(p => ({ ...p, loading: false, error: res?.message || "OTP send failed. Try again." }));
            }
        } catch (err) {
            console.log('❌ MOBILE OTP ERROR:', err);
            setMobile(p => ({ ...p, loading: false, error: "Something went wrong. Try again." }));
        }
    }, [mobile.value, isMobileValid]);





    const verifyMobileOtp = useCallback(async () => {
        if (mobile.otpValue.length < 4) return;
        setMobile(p => ({ ...p, loading: true, otpError: "" }));
        try {
            const url = `${APP_URLS.VerifyOTPMobile}Mobile=${mobile.value}&Name=''&Type=Mobile&OTP=${mobile.otpValue}`;
            console.log('📡 MOBILE VERIFY URL:', url);
            const res = await post({ url });
            console.log('✅ MOBILE VERIFY RESPONSE:', JSON.stringify(res, null, 2));

            if (res?.StatusCode === 200 && res?.Content?.ADDINFO === "DONE") {
                setMobile(p => ({ ...p, loading: false, verified: true }));
                toast("Mobile verified Successfully!");
            } else {
                setMobile(p => ({ ...p, loading: false, otpError: res?.message || "Invalid OTP. Try again." }));
            }
        } catch (err) {
            console.log('❌ MOBILE VERIFY ERROR:', err);
            setMobile(p => ({ ...p, loading: false, otpError: "Verification failed. Try again." }));
        }
    }, [mobile.value, mobile.otpValue]);

    const onEmailChange = (t: string) => {
         console.log('📧 EMAIL VALUE:', t);
    console.log('📧 IS VALID:', EMAIL_REGEX.test(t));
        setEmail({ ...initEmail(), value: t });
    };



    const sendEmailOtp = useCallback(async () => {
        if (!isEmailValid) return;
        setEmail(p => ({ ...p, loading: true, error: "" }));
        try {
            const url = `${APP_URLS.EmailVerify}?Email=${email.value}`;
            console.log('📡 EMAIL OTP URL:', url);
            const res = await post({ url });
            console.log('✅ EMAIL OTP RESPONSE:', JSON.stringify(res, null, 2));

            if (res?.info?.stschk === true) {
                setEmail(p => ({ ...p, loading: false, otpSent: true }));
                toast("OTP sent to email!");
            } else {
                setEmail(p => ({ ...p, loading: false, error: res?.message || "OTP send failed. Try again." }));
            }
        } catch (err) {
            console.log('❌ EMAIL OTP ERROR:', err);
            setEmail(p => ({ ...p, loading: false, error: "Something went wrong. Try again." }));
        }
    }, [email.value, isEmailValid]);



    const verifyEmailOtp = useCallback(async () => {
        if (email.otpValue.length < 4) return;
        setEmail(p => ({ ...p, loading: true, otpError: "" }));
        try {
            const url = `${APP_URLS.EmailVerifyOTP}?Email=${email.value}&OTP=${email.otpValue}`;
            console.log('📡 EMAIL VERIFY URL:', url);
            const res = await post({ url });
            console.log('✅ EMAIL VERIFY RESPONSE:', JSON.stringify(res, null, 2));

            if (res?.info?.stschk === true) {
                setEmail(p => ({ ...p, loading: false, verified: true }));
                toast("Email verified Successfully!");
            } else {
                setEmail(p => ({ ...p, loading: false, otpError: res?.info?.Message || "Invalid OTP. Try again." }));
            }
        } catch (err) {
            console.log('❌ EMAIL VERIFY ERROR:', err);
            setEmail(p => ({ ...p, loading: false, otpError: "Verification failed. Try again." }));
        }
    }, [email.value, email.otpValue]);

    const handleSubmit = async () => {
        console.log('🚀 handleSubmit START');
        if (!canSubmit) return;
        setSubmitLoading(true);

        try {
            // Temporarily post() ki jagah direct call
            const res = await post({ url: APP_URLS.AadhaarPanCheck });
            console.log('📦 RES VALUE:', res);           // undefined hai?
            console.log('📦 RES TYPE:', typeof res);
            console.log('📦 RES INFO:', JSON.stringify(res?.info, null, 2));
            // Agar res undefined hai to seedha onNext()
            if (!res) {
                console.warn('⚠️ res is undefined/null — checking differently');
                onNext();  // ← temporarily test karo
                return;
            }

            if (res?.info?.form1sts === true) {
                onNext();
                return;
            }

            console.warn('⚠️ form1sts:', res?.info);

        } catch (err) {
            console.log('❌ CATCH:', err);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <View style={s.main}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {loading && <ShowLoader />}

                <View style={s.container}>

                    <MobileCard
                        mobile={mobile}
                        isValid={isMobileValid}
                        onChange={onMobileChange}
                        onSendOtp={sendMobileOtp}
                        onOtpChange={(t: string) => setMobile(p => ({ ...p, otpValue: t.replace(/\D/g, ""), otpError: "" }))}

                        onVerifyOtp={verifyMobileOtp}
                        onReset={() => setMobile(initMobile())}
                        editable={false}
                    />

                    <EmailCard
                        email={email}
                        isValid={isEmailValid}
                        onChange={onEmailChange}
                        onSendOtp={sendEmailOtp}
                        onOtpChange={(t: string) => setEmail(p => ({ ...p, otpValue: t.replace(/\D/g, ""), otpError: "" }))}

                        onVerifyOtp={verifyEmailOtp}
                        onReset={() => setEmail(initEmail())}
                    />
                    <AadhaarCard
                        aadhaar={aadhaar}
                        isValid={isAadhaarValid}
                        onChange={onAadhaarChange}
                        onSendOtp={sendAadhaarOtp}
                        onOtpChange={(t: string) => setAadhaar(p => ({ ...p, otpValue: t.replace(/\D/g, ""), otpError: "" }))}

                        onVerifyOtp={verifyAadhaarOtp}
                        onReset={() => setAadhaar(initAadhaar())}
                    />

                    <PanCard
                        pan={pan}
                        isValid={isPanValid}
                        onChange={onPanChange}
                        onVerify={verifyPan}
                    />



                    <TouchableOpacity
                        style={[
                            s.submitBtn,
                            canSubmit
                                ? { backgroundColor: stepColor }
                                :
                                s.submitOff,
                            { backgroundColor: stepColor }
                        ]}
                        onPress={async () => {
                            console.log('🔘 DIRECT PRESS');
                            await handleSubmit();
                            console.log('🔘 AFTER handleSubmit');
                        }}
                        disabled={!canSubmit || submitLoading}
                    >
                        {submitLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={s.submitText}>
                                {canSubmit
                                    ? "Next"
                                    : "Complete All Fields"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default AadhaarPanVerification;

const s = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#F3F4F6",
    },

    container: {
        padding: 14,
    },

    submitBtn: {
        height: 50,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
    },

    submitOff: {
        backgroundColor: "#E5E7EB",
    },

    submitText: {
        color: "#fff",
        fontWeight: "700",
    },
}); 