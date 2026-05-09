import { translate } from "../../utils/languageUtils/I18n";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, SafeAreaView, Alert, Modal, Switch, KeyboardAvoidingView, Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle, Defs, ClipPath, Path } from "react-native-svg";
import Animated, {
  useSharedValue, useAnimatedProps, withRepeat,
  withTiming, Easing, interpolate, withSpring
} from "react-native-reanimated";
import { useSelector } from "react-redux";
import { RootState } from '../../reduxUtils/store/index';

const AnimatedPath = Animated.createAnimatedComponent(Path);

// --- Separate Header Component to prevent Re-render Focus Loss ---
const ExpenseHeader = React.memo(({ 
  colorConfig, limitEnabled, handleToggle, percentage, 
  animatedProps, limit, total, setLimitModal, 
  title, setTitle, amount, setAmount, addExpense 
}: any) => {
  return (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{translate("Expense_Tracker")}</Text>
          <Text style={styles.subtitle}>{translate("Manage_your_pocket")}</Text>
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.modeText}>{translate("Limit_Mode")}</Text>
          <Switch 
            value={limitEnabled} 
            onValueChange={handleToggle}
            trackColor={{ false: "#D1D1D1", true: colorConfig.primaryColor }}
          />
        </View>
      </View>

      {limitEnabled ? (
        <View style={styles.limitCard}>
          <View style={styles.chartBox}>
            <Svg height="100" width="100" viewBox="0 0 100 100">
              <Circle cx="50" cy="50" r="48" stroke="#E3F2FD" strokeWidth="4" fill="#fff" />
              <Defs><ClipPath id="clip"><Circle cx="50" cy="50" r="48"/></ClipPath></Defs>
              <AnimatedPath 
                animatedProps={animatedProps} 
                fill={
                  percentage >= 100 ? "#b71c1c" : 
                  percentage > 85  ? "#ff5252cc" : 
                  percentage > 50  ? "#ffb74ddd" : "#4FC3F7aa"
                }
                clipPath="url(#clip)" 
              />
            </Svg>
            <View style={styles.overlay}>
              <Text style={styles.percentText}>{Math.round(percentage)}%</Text>
            </View>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.remainText}>Remaining: ₹{Math.max(limit - total, 0)}</Text>
            <Text style={styles.spentText}>Spent: ₹{total}</Text>
            <TouchableOpacity 
              style={[styles.editBtn,{backgroundColor:colorConfig.primaryButtonColor}]} 
              onPress={() => setLimitModal(true)}
            >
              <Text style={{color:colorConfig.labelColor, fontSize: 12}}>{translate("Edit_Limit")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.simpleCard}>
          <Text style={styles.simpleLabel}>{translate("Total_Expenses")}</Text>
          <Text style={styles.simpleTotal}>₹{total}</Text>
        </View>
      )}

      <View style={styles.inputCard}>
        <TextInput 
          placeholder="What did you buy?" 
          style={styles.input} 
          value={title} 
          onChangeText={setTitle} 
        />
        <TextInput 
          placeholder="Amount" 
          keyboardType="number-pad" 
          style={styles.input} 
          value={amount} 
          onChangeText={setAmount} 
        />
        <TouchableOpacity 
          style={[styles.addBtn,{backgroundColor:colorConfig.primaryColor}]} 
          onPress={addExpense}
        >
          <Text style={styles.addBtnText}>{translate("Add_Expense")}</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginBottom: 15 }}>{translate("Recent_Expenses")}</Text>
    </View>
  );
});

// --- Main Component ---
export default function MyExpenseApp() {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [limit, setLimit] = useState(0);
  const [tempLimit, setTempLimit] = useState("");
  const [limitEnabled, setLimitEnabled] = useState(false);
  const [limitModal, setLimitModal] = useState(false);

  const waveOffset = useSharedValue(0);
  const liquidLevel = useSharedValue(100);

  useEffect(() => {
    loadData();
    waveOffset.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1, false
    );
  }, []);

  const total = useMemo(() => expenses.reduce((sum, i) => sum + i.amount, 0), [expenses]);
  const percentage = limitEnabled && limit > 0 ? Math.min((total / limit) * 100, 100) : 0;

  useEffect(() => {
    liquidLevel.value = withSpring(100 - percentage, { damping: 15 });
  }, [percentage]);

  const animatedProps = useAnimatedProps(() => {
    const moveX = interpolate(waveOffset.value, [0, 1], [0, -100]);
    return {
      d: `M${moveX} ${liquidLevel.value} 
          Q${moveX + 25} ${liquidLevel.value - 7}, ${moveX + 50} ${liquidLevel.value} 
          T${moveX + 100} ${liquidLevel.value} 
          T${moveX + 150} ${liquidLevel.value} 
          T${moveX + 200} ${liquidLevel.value} 
          V100 H${moveX} Z`
    };
  });

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem("@expenses");
      const limitData = await AsyncStorage.getItem("@limit");
      const toggle = await AsyncStorage.getItem("@limitEnabled");

      if (data) setExpenses(JSON.parse(data));
      if (limitData) {
        setLimit(Number(limitData));
        setTempLimit(limitData);
      }
      if (toggle) setLimitEnabled(JSON.parse(toggle));
    } catch (e) { console.log(e); }
  };

  const saveExpenses = async (data: any) => {
    await AsyncStorage.setItem("@expenses", JSON.stringify(data));
  };

  const handleToggle = async (value: boolean) => {
    setLimitEnabled(value);
    await AsyncStorage.setItem("@limitEnabled", JSON.stringify(value));
    if (value && limit === 0) setLimitModal(true);
  };

  const updateLimit = async () => {
    const newLimit = Number(tempLimit);
    if (isNaN(newLimit) || newLimit <= 0) return Alert.alert("Error", "Please enter a valid amount");
    setLimit(newLimit);
    await AsyncStorage.setItem("@limit", String(newLimit));
    setLimitModal(false);
  };

  const addExpense = () => {
    if (!title || !amount) return Alert.alert("Hold on!", "Please fill in all fields");
    const item = {
      id: Date.now().toString(),
      title,
      amount: Number(amount),
      date: new Date().toLocaleDateString()
    };
    const updated = [item, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    setTitle("");
    setAmount("");
  };

  const deleteExpense = (id: string) => {
    const filtered = expenses.filter(i => i.id !== id);
    setExpenses(filtered);
    saveExpenses(filtered);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{flex:1}}
      >
        <FlatList
          data={expenses}
          keyExtractor={item => item.id}
          ListHeaderComponent={
            <ExpenseHeader 
              colorConfig={colorConfig}
              limitEnabled={limitEnabled}
              handleToggle={handleToggle}
              percentage={percentage}
              animatedProps={animatedProps}
              limit={limit}
              total={total}
              setLimitModal={setLimitModal}
              title={title}
              setTitle={setTitle}
              amount={amount}
              setAmount={setAmount}
              addExpense={addExpense}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemDate}>{item.date}</Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Text style={styles.itemAmount}>₹{item.amount}</Text>
                <TouchableOpacity onPress={() => deleteExpense(item.id)}>
                  <Text style={styles.deleteText}>{translate("Remove")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <Modal visible={limitModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{translate("Set_Monthly_Limit")}</Text>
              <TextInput 
                autoFocus
                keyboardType="number-pad" 
                style={styles.modalInput} 
                value={tempLimit} 
                onChangeText={setTempLimit}
                placeholder="e.g. 5000"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.mBtn, {backgroundColor: '#ddd'}]} onPress={() => setLimitModal(false)}>
                  <Text>{translate("Cancel")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.mBtn, {backgroundColor: colorConfig.primaryColor || '#3949ab'}]} onPress={updateLimit}>
                  <Text style={{color: '#fff'}}>{translate("Save")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FE", paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, marginTop: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1A237E" },
  subtitle: { color: "#7986CB", fontSize: 14 },
  toggleRow: { alignItems: 'flex-end' },
  modeText: { fontSize: 10, fontWeight: 'bold', color: '#666', marginBottom: 2 },
  
  limitCard: { backgroundColor: "#fff", padding: 15, borderRadius: 24, flexDirection: "row", alignItems: "center", elevation: 4, marginBottom: 20 },
  chartBox: { position: 'relative' },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" },
  percentText: { fontSize: 18, fontWeight: "bold", color: "#000" },
  statsBox: { flex: 1, marginLeft: 15 },
  remainText: { fontSize: 15, color: "#2E7D32", fontWeight: "600" },
  spentText: { fontSize: 13, color: "#C62828", marginTop: 2 },
  editBtn: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start' },

  simpleCard: { backgroundColor: "#fff", padding: 25, borderRadius: 24, alignItems: "center", elevation: 4, marginBottom: 20 },
  simpleLabel: { color: "#666", fontSize: 14 },
  simpleTotal: { fontSize: 36, fontWeight: "bold", color: "#1A237E" },

  inputCard: { backgroundColor: "#fff", padding: 15, borderRadius: 20, marginBottom: 25, elevation: 2 },
  input: { backgroundColor: "#F1F3F9", padding: 12, borderRadius: 12, marginBottom: 10, fontSize: 16 },
  addBtn: { padding: 15, borderRadius: 12, alignItems: "center" },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  item: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1 },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  itemDate: { fontSize: 12, color: "#999" },
  itemAmount: { fontSize: 18, fontWeight: "bold", color: "#1A237E" },
  deleteText: { color: "#FF5252", fontSize: 12, marginTop: 4 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 25, borderRadius: 24, width: "85%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", textAlign: 'center' },
  modalInput: { borderBottomWidth: 2, borderColor: '#3949ab', marginVertical: 20, fontSize: 24, textAlign: "center" },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  mBtn: { flex: 0.45, padding: 12, borderRadius: 10, alignItems: 'center' }
});