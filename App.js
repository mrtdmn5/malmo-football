import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Users from "./src/Users";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Owner from "./src/Owner";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1,padding:10, paddingTop:30,  }}>
      <StatusBar style="auto" />
      {/* <Users></Users> */}
      <Owner></Owner>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
