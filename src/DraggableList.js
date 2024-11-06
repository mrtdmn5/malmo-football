import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const getUniqueColor = (usedColors) => {
  const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#1A535C", "#FF9F1C"];
  const availableColors = colors.filter((color) => !usedColors[color]);
  return availableColors.length > 0
    ? availableColors[Math.floor(Math.random() * availableColors.length)]
    : colors[Math.floor(Math.random() * colors.length)];
};

export default function DraggableList({ data, setData, deleteUser }) {
  const [ownerColors, setOwnerColors] = useState({});

  useEffect(() => {
    const newColors = {};
    const usedColors = {}; // Kullanılan renkleri takip eder

    data.forEach((item) => {
      if (!newColors[item.owner]) {
        const color = getUniqueColor(usedColors);
        newColors[item.owner] = color;
        usedColors[color] = true; // Rengin kullanıldığını işaretle
      }
    });

    setOwnerColors(newColors);
  }, [data]);

  const renderItem = ({ item, index, drag, isActive }) =>
    item.label !== "Team 2" && item.label !== "Team 1" ? (
      <TouchableOpacity
      activeOpacity={0.8}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 2,
          paddingHorizontal:7,
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
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "bold",
              color: "#000",
              fontSize: 16,
              textTransform: "capitalize",
            }}
          >
            {item.label}
          </Text>
          {/* <Text
            style={{
              color: ownerColors[item.owner] || "#000",
              fontSize: 13,
              textTransform: "capitalize",
            }}
          >
            {item.owner}
          </Text> */}
        </View>
        <TouchableOpacity onPress={() => deleteUser(item.key)}>
          <Text style={{ color: "red", fontSize: 20, padding: 10 }}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ) : (
      <Text
        style={{
          marginHorizontal: 10,
          padding: 10,
          fontWeight: "bold",
          marginTop: 10,
          marginBottom: 5,
        }}
      >
        {item.label}
      </Text>
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
