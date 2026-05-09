import { translate } from "../../utils/languageUtils/I18n";
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import useAxiosHook from "../../utils/network/AxiosClient";
import AppBarSecond from "./headerAppbar/AppBarSecond";

const Complaint = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const [chatText, setChatText] = useState("");
  const [responseMessages, setResponseMessages] = useState<any[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const [loaderRun, setLoaderRun] = useState(false);
  const { get, post } = useAxiosHook();
  const navigation = useNavigation();
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    responseMessagesApi();
  }, []);

  const responseMessagesApi = async () => {
    try {
      setLoaderRun(true);
      const res = await get({
        url: `Common/api/data/ComplainRequestReport?txt_frm_date=2025-03-01&txt_to_date=2025-03-10`,
      });
      console.log(res)
      if (res?.Report) {
        setResponseMessages(res.Report.reverse()); // reverse so newest at bottom
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoaderRun(false);
    }
  };

  const chatMessageApi = async (chatMessage: string) => {
    try {
      const response = await post({
        url: `Common/api/data/ComplainRequest?subject=chatting&Complaint=${chatMessage}`,
      });
      if (response) {
        setChatText("");
        responseMessagesApi();
        scrollToBottom();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = () => {
    if (chatText.trim().length > 0) {
      chatMessageApi(chatText.trim());
      setIsComposing(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const renderMessage = ({ item }: { item: any }) => {
    return (
      <View style={styles.messageRow}>
        {/* Sent Bubble */}
        {item.Complaint && (
          <View style={[styles.chatBubble, styles.sentBubble]}>
            <Text style={styles.sentText}>{item.Complaint}</Text>
            <Text style={styles.timestamp}>{item.RequestDate}</Text>
          </View>
        )}

        {/* Received Bubble */}
        {item.ResponseMsg && (
          <View style={[styles.chatBubble, styles.receivedBubble]}>
            <Text style={styles.receivedText}>{item.ResponseMsg}</Text>
            <Text style={styles.timestamp}>
              {item.ResponsDate || item.RequestDate}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppBarSecond
        title={"Complain Chat"}
        actionButton={undefined}
        onActionPress={undefined}
        onPressBack={() => navigation.goBack()}
        titlestyle={undefined}
      />

      <View style={styles.container}>
        {loaderRun ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>{translate("Loading")}</Text>
        ) : (
          <FlatList
            ref={listRef}
            data={responseMessages}
            renderItem={renderMessage}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
            onContentSizeChange={scrollToBottom}
          />
        )}

        {/* Input Box */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type Text Here..."
            value={chatText}
            onChangeText={(text) => {
              setChatText(text);
              setIsComposing(text.length > 0);
            }}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!isComposing}
            style={[
              styles.sendButton,
              {
                backgroundColor: isComposing
                  ? colorConfig.secondaryColor
                  : "#ccc",
              },
            ]}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messageRow: {
    marginVertical: 5,
  },
  chatBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 15,
    marginVertical: 3,
  },
  sentBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
  },
  receivedBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#6c757d",
  },
  sentText: {
    color: "white",
    fontSize: 16,
  },
  receivedText: {
    color: "white",
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: "white",
    marginTop: 5,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#ddd",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#fafafa",
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 8,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Complaint;
