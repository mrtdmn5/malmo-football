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
import React, { useCallback, useEffect, useState } from "react";
import { database } from "./firebase";
import { ref, set, onValue, off } from "firebase/database";
import DraggableList from "./DraggableList";

export default function Users({admin}) {
  const [label, setLabel] = useState("");
  const [userData, setUserData] = useState([]);
  const [databaseData, setDatabaseData] = useState([]);

  const writeData = () => {
    console.log(label);
    if (label === "" || label === "Team 1" || label === "Team 2") return;
    databaseData.unshift({ label: label, owner:admin });

    console.log("databaseData");
    console.log(databaseData);
    set(ref(database, "users"), databaseData)
      .then(() => {
        console.log("Data is set");
      })
      .catch((error) => {
        console.error("Error setting data: ", error);
      });
    setLabel("");
    closeModal();
  };

  const handleData = (data) => {
    if (data && Array.isArray(data) && data.length > 0) {
      const updateData = data.map((item, index) => ({
        ...item,
        key: index,
      }));
      setUserData(updateData);
      console.log("ad");
      console.log(updateData);
    }
  };

  const setSortData = (data) => {
    if (data && Array.isArray(data) && data.length > 0) {
      const updateData = data.map((item, index) => ({
        label: item.label,
        owner: admin,
      }));
      set(ref(database, "users"), updateData)
        .then(() => {
          console.log("Data is set");
        })
        .catch((error) => {
          console.error("Error setting data: ", error);
        });
    }
  };

  const deleteUser = (index) => {
    console.log(index);
    if (index > -1) {
      databaseData.splice(index, 1);
      set(ref(database, "users"), databaseData)
        .then(() => {
          console.log("Data is set");
        })
        .catch((error) => {
          console.error("Error setting data: ", error);
        });
    }
  };

  useEffect(() => {
    const userRef = ref(database, "users/");
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userArray = Object.values(data);
        setDatabaseData(userArray);
        handleData(userArray);

        console.log(userArray);
      }
    });

    return () => off(userRef);
  }, []);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>Add User</Text>
      </TouchableOpacity>

      {userData.length > 0 ? (
        <DraggableList
          data={userData}
          setData={setSortData}
          deleteUser={deleteUser}
        />
      ) : (
        <ActivityIndicator />
      )}

      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Name</Text>
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
                onPress={closeModal}
              >
                <Text
                  style={{ color: "red", fontWeight: "bold", fontSize: 16 }}
                >
                  Close
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 15, paddingBottom: 10 }}
                onPress={writeData}
              >
                <Text
                  style={{ color: "green", fontWeight: "bold", fontSize: 16 }}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
