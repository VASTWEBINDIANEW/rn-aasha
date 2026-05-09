import { translate } from "../../utils/languageUtils/I18n";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";

// ─── Static data ──────────────────────────────────────────────────────────────
const DEMO_DATA = [
  { Name: "Aadhar Face Driver",  Link: "https://play.google.com/store/search?q=aadhaar+face+rd" },
  { Name: "Startek L1",          Link: "https://play.google.com/store/search?q=startek+l1+rd+service" },
  { Name: "Mantra MFS110 L1",    Link: "https://play.google.com/store/apps/details?id=com.mantra.mfs110.rdservice" },
  { Name: "Morpho L1",           Link: "https://play.google.com/store/search?q=morpho%20l1" },
];

const MASTER_ACCOUNTS = [
  { bank_name: "ICICI Bank",          link: "https://buy.icicibank.com/ucj/accounts" },
  { bank_name: "Axis Bank",           link: "https://www.axisbank.com/retail/accounts" },
  { bank_name: "IDFC First Bank",     link: "https://digital.idfcfirstbank.com/apply/savings" },
  { bank_name: "Central Bank of India", link: "https://vkyc.centralbank.co.in/home" },
  { bank_name: "Union Bank of India", link: "https://www.unionbankofindia.co.in/english/saving-account.aspx" },
  { bank_name: "HDFC Bank",           link: "https://applyonline.hdfcbank.com/savings-account" },
  { bank_name: "State Bank of India", link: "https://sbi.co.in/web/yono/insta-plus" },
];

const MASTER_DEMAT = [
  { service_provider: "Motilal Oswal", link: "https://moriseapp.page.link/DoWR7HduvjtkyvWr7" },
  { service_provider: "Angel One",     link: "https://angel-one.onelink.me/Wjgr/xna61v25" },
];

const IS_MASTER = APP_URLS.AppName === "Master Bank";

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionLabel = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionLine} />
  </View>
);

interface LinkCardProps {
  title: string;
  url: string;
  primaryColor: string;
  onPress: (url: string) => void;
}

const LinkCard = React.memo(({ title, url, primaryColor, onPress }: LinkCardProps) => {
  const initial = (title ?? "?").charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      <View style={[styles.avatarBox, { backgroundColor: primaryColor + "18" }]}>
        <Text style={[styles.avatarText, { color: primaryColor }]}>{initial}</Text>
      </View>

      <Text style={styles.nameText} numberOfLines={1}>
        {title}
      </Text>

      <TouchableOpacity
        activeOpacity={0.78}
        onPress={() => onPress(url)}
        style={[styles.openBtn, { backgroundColor: primaryColor }]}
      >
        <Text style={styles.openBtnText}>{translate("Open")}</Text>
      </TouchableOpacity>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────
const OtherLinks = () => {
  const [list1, setList1] = useState<any[]>([]);
  const [list2, setList2] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { get } = useAxiosHook();
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  useEffect(() => {
    if (IS_MASTER) {
      setList1(MASTER_ACCOUNTS);
      setList2(MASTER_DEMAT);
      setLoading(false);
    } else {
      fetchReports();
    }
  }, []);

  const fetchReports = async () => {
    try {
      const response = await get({ url: APP_URLS.OtherLinks });
      setList1(
        response?.uploadlink_list?.length
          ? [...response.uploadlink_list, ...DEMO_DATA]
          : DEMO_DATA
      );
    } catch {
      setList1(DEMO_DATA);
    } finally {
      setLoading(false);
    }
  };

  const openURL = useCallback((url: string) => {
    Linking.openURL(url).catch(() => Alert.alert("Error", "Unable to open link"));
  }, []);

  const renderItem1 = useCallback(
    ({ item }: { item: any }) => (
      <LinkCard
        title={IS_MASTER ? item.bank_name : item.Name?.toUpperCase()}
        url={item.Link ?? item.link}
        primaryColor={colorConfig.primaryColor}
        onPress={openURL}
      />
    ),
    [colorConfig.primaryColor, openURL]
  );

  const renderItem2 = useCallback(
    ({ item }: { item: any }) => (
      <LinkCard
        title={item.service_provider}
        url={item.link}
        primaryColor={colorConfig.primaryColor}
        onPress={openURL}
      />
    ),
    [colorConfig.primaryColor, openURL]
  );

  const keyExtractor1 = useCallback((_: any, i: number) => `l1-${i}`, []);
  const keyExtractor2 = useCallback((_: any, i: number) => `l2-${i}`, []);

  return (
    <View style={styles.main}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6F9" />
      <AppBarSecond
        title={IS_MASTER ? "Digital Services" : "Important Links"}
        onPressBack={() => {}}
      />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colorConfig.primaryColor} />
        </View>
      ) : (
        <FlatList
          data={[{ key: "content" }]}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          renderItem={() => (
            <>
              <SectionLabel title={IS_MASTER ? "SAVINGS ACCOUNTS" : "RESOURCES"} />
              <FlatList
                data={list1}
                scrollEnabled={false}
                keyExtractor={keyExtractor1}
                renderItem={renderItem1}
              />

              {IS_MASTER && list2.length > 0 && (
                <>
                  <SectionLabel title="DEMAT ACCOUNTS" />
                  <FlatList
                    data={list2}
                    scrollEnabled={false}
                    keyExtractor={keyExtractor2}
                    renderItem={renderItem2}
                  />
                </>
              )}
            </>
          )}
        />
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: hScale(40),
  },

  // Section label
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wScale(16),
    marginTop: hScale(20),
    marginBottom: hScale(8),
    gap: wScale(10),
  },
  sectionTitle: {
    fontSize: wScale(11),
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#94A3B8",
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: wScale(16),
    marginVertical: hScale(5),
    paddingHorizontal: wScale(14),
    paddingVertical: hScale(12),
    borderRadius: 12,
    shadowColor: "#B0BEC5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  avatarBox: {
    width: wScale(38),
    height: wScale(38),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wScale(12),
  },
  avatarText: {
    fontSize: wScale(16),
    fontWeight: "700",
  },
  nameText: {
    flex: 1,
    fontSize: wScale(13),
    fontWeight: "600",
    color: "#1E293B",
    marginRight: wScale(8),
  },
  openBtn: {
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(8),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  openBtnText: {
    color: "#FFFFFF",
    fontSize: wScale(12),
    fontWeight: "700",
  },
});

export default OtherLinks;