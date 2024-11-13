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
import { Dropdown } from "react-native-element-dropdown";
import MyList from "./../MyList.json"

export default function Users({ admin }) {
  const [label, setLabel] = useState("");
  const [userData, setUserData] = useState([]);
  const [databaseData, setDatabaseData] = useState([]);
  const [tempDatabaseData, setTempDatabaseData] = useState({});

function createBalancedTeams(data) {
  // 'Team 1' ve 'Team 2' etiketlerinin indekslerini bul
  const team1Index = data.findIndex(item => item.label === 'Team 1');
  const team2Index = data.findIndex(item => item.label === 'Team 2');

  if (team1Index === -1 || team2Index === -1) {
    // Eğer etiketler yoksa, orijinal diziyi döndür
    return data;
  }

  // 'Team 1' etiketinden önceki oyuncuları dışarıda bırak
  const excludedItems = data.slice(0, team1Index + 1); // 'Team 1' etiketi dahil
  const betweenTeams = data.slice(team1Index + 1, team2Index);
  const afterTeam2 = data.slice(team2Index + 1);

  // Takımlara atanacak oyuncuların listesi
  const players = betweenTeams.concat(afterTeam2);

  // Oyuncu özelliklerini kontrol et ve boş veya eksik olanları 7 ile doldur
  const cleanedPlayers = players.map(player => {
    const attributes = ['dribbling', 'defence', 'pass', 'shot', 'speed'];
    const cleanedPlayer = { ...player };
    attributes.forEach(attr => {
      if (!cleanedPlayer.hasOwnProperty(attr) || !cleanedPlayer[attr]) {
        cleanedPlayer[attr] = '7';
      }
    });
    return cleanedPlayer;
  });

  // Her oyuncu için toplam puanı hesapla
  const ratedPlayers = cleanedPlayers.map(player => {
    const rating =
      parseInt(player.dribbling) +
      parseInt(player.defence) +
      parseInt(player.pass) +
      parseInt(player.shot) +
      parseInt(player.speed);
    return { ...player, rating };
  });

  // Oyuncuları karıştırarak rastgelelik ekle
  for (let i = ratedPlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ratedPlayers[i], ratedPlayers[j]] = [ratedPlayers[j], ratedPlayers[i]];
  }

  // Oyuncuları toplam puanlarına göre sıralar (isteğe bağlı)
  ratedPlayers.sort((a, b) => b.rating - a.rating);

  // Takımları dengelemek için oyuncuları atar
  const team1Players = [];
  const team2Players = [];
  let team1TotalRating = 0;
  let team2TotalRating = 0;

  ratedPlayers.forEach(player => {
    if (team1TotalRating <= team2TotalRating) {
      team1Players.push(player);
      team1TotalRating += player.rating;
    } else {
      team2Players.push(player);
      team2TotalRating += player.rating;
    }
  });

  // Sonucu oluştur
  const result = [
    ...excludedItems,
    ...team1Players,
    data[team2Index], // 'Team 2' etiketi
    ...team2Players,
  ];
  console.log(result);
  set(ref(database, "users"), result)
  .then(() => {
    console.log("Data is set");
  })
  .catch((error) => {
    console.error("Error setting data: ", error);
  });
  return result;
}

  const positionData = [
    { label: "Defence", value: "1" },
    { label: "Midfielder", value: "2" },
    { label: "Striker", value: "3" },
    { label: "Keeper", value: "4" },
  ];

  const [writebleData, setWritebleData] = useState({
    label: null,
    speed: null,
    shot: null,
    pass: null,
    dribbling: null,
    defence: null,
    position: null,
  });

  const createDatabaseObject = (data) => {
    return {
      ...data,
      owner: admin,
    };
  };
  const writeData = () => {
    console.log(label);

    if (
      !writebleData ||
      !writebleData.label ||
      writebleData.label === "" ||
      writebleData.label === "Team 1" ||
      writebleData.label === "Team 2"
    )
      return;

    console.log("writebleData sin", writebleData);

    if (
      writebleData &&
      writebleData.editIndex !== null &&
      writebleData.editIndex !== undefined
    ) {
      console.log("burada sin");
      deleteUser(writebleData.editIndex);
    }
    delete writebleData.editIndex;
    databaseData.unshift(createDatabaseObject(writebleData));
    console.log("databaseData");
    console.log(databaseData);
    set(ref(database, "users"), databaseData)
      .then(() => {
        console.log("Data is set");
      })
      .catch((error) => {
        console.error("Error setting data: ", error);
      });
    setWritebleData({
      label: null,
      speed: null,
      shot: null,
      pass: null,
      dribbling: null,
      defence: null,
      position: null,
      editIndex: null,
    });
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
      const updateData = data.map((item) => createDatabaseObject(item));
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
          console.log("Data is deleted");
        })
        .catch((error) => {
          console.error("Error setting data: ", error);
        });
    }
  };
  const editUser = (index) => {
    console.log(index);
    if (index > -1) {
      setWritebleData({ ...userData[index], editIndex: index });
      openModal();
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
  const addList=()=>{
    set(ref(database, "users"), MyList)
    .then(() => {
      console.log("Data is set");
    })
    .catch((error) => {
      console.error("Error setting data: ", error);
    });
  }
  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity style={styles.createTeamButton} onPress={()=>createBalancedTeams(databaseData)}>
          <Text style={styles.addButtonText}>Create Teams</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addListButton} onLongPress={()=>addList()}>
          <Text style={styles.addButtonText}>add list</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={openModal}>
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>
      {userData.length > 0 ? (
        <DraggableList
          data={userData}
          setData={setSortData}
          deleteUser={deleteUser}
          editUser={editUser}
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
            <TextInput
              style={styles.input}
              placeholder="Name"
              onChangeText={(text) =>
                setWritebleData({
                  ...writebleData,
                  label: text,
                })
              }
              value={writebleData.label}
            />
            <TextInput
              keyboardType="numeric"
              style={styles.input}
              placeholder="Speed"
              onChangeText={(text) =>
                setWritebleData({
                  ...writebleData,
                  speed: text,
                })
              }
              value={writebleData.speed}
            />

            <TextInput
              keyboardType="numeric"
              style={styles.input}
              placeholder="Shot"
              onChangeText={(text) =>
                setWritebleData({
                  ...writebleData,
                  shot: text,
                })
              }
              value={writebleData.shot}
            />

            <TextInput
              keyboardType="numeric"
              style={styles.input}
              placeholder="Pass"
              onChangeText={(text) =>
                setWritebleData({
                  ...writebleData,
                  pass: text,
                })
              }
              value={writebleData.pass}
            />

            <TextInput
              keyboardType="numeric"
              style={styles.input}
              placeholder="Dribbling"
              onChangeText={(text) =>
                setWritebleData({
                  ...writebleData,
                  dribbling: text,
                })
              }
              value={writebleData.dribbling}
            />
            <TextInput
              keyboardType="numeric"
              style={styles.input}
              placeholder="Defence"
              onChangeText={(text) =>
                setWritebleData({
                  ...writebleData,
                  defence: text,
                })
              }
              value={writebleData.defence}
            />

            <Dropdown
              style={styles.dropdown}
              data={positionData}
              labelField="label"
              valueField="value"
              placeholder="Position"
              value={writebleData.position}
              onChange={(item) => {
                setWritebleData({
                  ...writebleData,
                  position: item.value,
                });
              }}
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
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  createTeamButton: {
    backgroundColor: "#3f8ed0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  addListButton: {
    backgroundColor: "#3f8ed0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    opacity:0
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
  dropdown: {
    height: 50,
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
    borderRadius: 5,
  },
});
