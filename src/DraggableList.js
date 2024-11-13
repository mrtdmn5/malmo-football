import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function DraggableList({ data, setData, editUser, deleteUser }) {
  const [ownerColors, setOwnerColors] = useState({});
  useEffect(() => {
    const newColors = {};
    setOwnerColors(null);
  }, [data]);

  function calculateRating(player) {
    // Özellikleri ve pozisyonu kontrol et, eksik olanları varsayılan değerlere ayarla
    if (
      !player ||
      !player.label ||
      player.label === "" ||
      player.label === "Team 1" ||
      player.label === "Team 2"
    )
      return;
    const attributes = ["dribbling", "defence", "pass", "shot", "speed"];
    const defaultAttributes = {};
    attributes.forEach((attr) => {
      if (!player.hasOwnProperty(attr) || !player[attr]) {
        defaultAttributes[attr] = 7;
      } else {
        defaultAttributes[attr] = parseInt(player[attr]);
      }
    });

    // Pozisyon kontrolü, eğer yoksa 'Midfielder' olarak al
    const position = player.position ? player.position : "Midfielder";

    // Pozisyona göre ağırlıklandırma yapabilirsiniz (isteğe bağlı)
    // Örneğin, defans oyuncuları için 'defence' özelliğine daha fazla ağırlık verebilirsiniz
    let rating = 0;
    switch (position) {
      case "1":
        rating =
          defaultAttributes.defence * 1.2 +
          defaultAttributes.pass +
          defaultAttributes.speed +
          defaultAttributes.dribbling * 0.8 +
          defaultAttributes.shot * 0.8;
        break;
      case "2":
        rating =
          defaultAttributes.dribbling +
          defaultAttributes.pass * 1.2 +
          defaultAttributes.speed +
          defaultAttributes.shot +
          defaultAttributes.defence;
        break;
      case "3":
        rating =
          defaultAttributes.shot * 1.2 +
          defaultAttributes.speed +
          defaultAttributes.dribbling +
          defaultAttributes.pass +
          defaultAttributes.defence * 0.8;
        break;
      case "4":
        rating =
          defaultAttributes.defence * 1.5 +
          defaultAttributes.pass +
          defaultAttributes.speed * 0.8 +
          defaultAttributes.dribbling * 0.5 +
          defaultAttributes.shot * 0.5;
        break;
      default:
        rating =
          defaultAttributes.dribbling +
          defaultAttributes.defence +
          defaultAttributes.pass +
          defaultAttributes.shot +
          defaultAttributes.speed;
        break;
    }

    return (rating / 5).toString().substring(0, 3);
  }

  function calculateTeamsRatings(data) {
    // 'Team 1' ve 'Team 2' etiketlerinin indekslerini bul
    const team1Index = data.findIndex((item) => item.label === "Team 1");
    const team2Index = data.findIndex((item) => item.label === "Team 2");

    let team1Rating = 0;
    let team2Rating = 0;

    if (team1Index !== -1) {
      // 'Team 1' oyuncularını al
      const team1Players = data.slice(
        team1Index + 1,
        team2Index !== -1 ? team2Index : data.length
      );
      team1Rating = team1Players.reduce(
        (sum, player) => sum + (player.rating || 0),
        0
      );
    }

    if (team2Index !== -1) {
      // 'Team 2' oyuncularını al
      const team2Players = data.slice(team2Index + 1);
      team2Rating = team2Players.reduce(
        (sum, player) => sum + (player.rating || 0),
        0
      );
    }
    team1Rating=team1Rating/5;
    team2Rating=team2Rating/5;
    return { team1Rating, team2Rating };
  }
  const renderItem = ({ item, index, drag, isActive }) =>
    item.label !== "Team 2" && item.label !== "Team 1" ? (
      <TouchableOpacity
        activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 2,
          paddingHorizontal: 7,
          backgroundColor: isActive ? "lightblue" : "#fff",
          borderRadius: 10,
          marginBottom: 7,
          marginHorizontal: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}
        onLongPress={drag}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontWeight: "bold",
              color: "#000",
              fontSize: 16,
              textTransform: "capitalize",
              marginRight: 7,
            }}
          >
            {item.label}
          </Text>

          <Text
            style={{
              color: "#000",
              fontSize: 12,
              textTransform: "capitalize",
            }}
          >
            ({calculateRating(item)})
          </Text>
        </View>
        <TouchableOpacity onPress={() => editUser(item.key)}>
          <Text style={{ color: "#3f8ed0", fontSize: 14, padding: 10 }}>
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteUser(item.key)}>
          <Text style={{ color: "red", fontSize: 20, padding: 10 }}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ) : (
      <View style={{ flexDirection: "row", alignItems:"center"}}>
        <Text
          style={{
            marginLeft: 10,
            padding: 10,
            fontWeight: "bold",
            marginTop: 10,
            marginBottom: 5,
          }}
        >
          {item.label}{" "}
        </Text>
        <Text
          style={{
            marginTop: 10,
            marginBottom: 5,
            fontSize:12
          }}
        >
          (
          {item.label === "Team 1"
            ? calculateTeamsRatings(data).team1Rating
            : calculateTeamsRatings(data).team2Rating}
          )
        </Text>
      </View>
    );

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        padding: 5,
        paddingVertical: 20,
        width: "100%",
        marginTop: 10,
      }}
    >
      {data && Array.isArray(data) && data.length > 0 && (
        <DraggableFlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.key || index.toString()}
          onDragEnd={({ data }) => setData(data)}
          style={{
            backgroundColor: "#edede9",
            marginBottom: 50,
            borderRadius: 10,
            paddingHorizontal: 5,
          }}
          ListFooterComponent={<View style={{ height: 50 }} />}
          ListHeaderComponent={
            <View style={{ width: "100%", alignItems: "flex-end", padding: 5 }}>
              <Text>Last Update By: {data[0].owner}</Text>
            </View>
          }
        />
      )}
    </GestureHandlerRootView>
  );
}
