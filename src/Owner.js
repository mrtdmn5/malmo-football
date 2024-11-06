import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Users from "./Users";

export default function Owner() {
  const [label, setLabel] = useState("");
  const [adminName, setAdminName] = useState(null);
  const [loading, setLoading] = useState(true);

  const _storeData = async (label) => {
    try {
      console.log("_storeData");
      await AsyncStorage.setItem("adminName", label);
      setAdminName(label);
    } catch (error) {}
  };

  const _retrieveData = async () => {
    try {
      console.log("try");
      const value = await AsyncStorage.getItem("adminName");
      if (value !== null) {
        console.log(value);
         setAdminName(value);
      }
    } catch (error) {
      console.log("no item");
    } finally {
      setLoading(false);
    }
  };

  const _deleteData = async () => {
    try {
      console.log("Deleting adminName from AsyncStorage");
      await AsyncStorage.removeItem("adminName");
      setAdminName(null); // Uygulamanın state'ini de güncelle
      console.log("adminName key deleted successfully");
    } catch (error) {
      console.log("Error deleting item:", error);
    }
  };
  

  const handleSaveUser = () => {
    _storeData(label);
  };
  useEffect(() => {
    _retrieveData();
  }, []);
  return loading ? (
    <ActivityIndicator />
  ) : !adminName ? (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Enter Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          onChangeText={(text) => setLabel(text)}
          value={label}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          <TouchableOpacity
            style={{ padding: 15, paddingBottom: 10 }}
            onPress={handleSaveUser}
          >
            <Text style={{ color: "green", fontWeight: "bold", fontSize: 16 }}>
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ) : (
    <Users admin={adminName} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingTop: 50,
  },
  addButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
    borderRadius: 5,
  },
});
