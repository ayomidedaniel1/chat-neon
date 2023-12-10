import React, { FC, useEffect, useLayoutEffect, useState } from "react";
import { View, Text, Pressable, SafeAreaView, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";

import ChatComponent from "../component/ChatComponent";
import { styles } from "../utils/style";

import Modal from "../component/Modal";
import socket from "../utils/socket";

const Chat: FC = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const [rooms, setRooms] = useState([]);

  //👇🏻 Runs when the component mounts
  useLayoutEffect(() => {
    function fetchGroups() {
      fetch("http://localhost:4000/api")
        .then((res) => res.json())
        .then((data) => setRooms(data))
        .catch((err) => console.error(err));
    }
    fetchGroups();
  }, []);

  //👇🏻 Runs whenever there is new trigger from the backend
  useEffect(() => {
    socket.on("roomsList", (rooms) => {
      setRooms(rooms);
    });
  }, [socket]);

  const handleCreateGroup = () => setVisible(true);

  return (
    <SafeAreaView style={styles.chatscreen}>
      <View style={styles.chattopContainer}>
        <View style={styles.chatheader}>
          <Text style={styles.chatheading}>Chats</Text>

          {/* 👇🏻 Logs "ButtonPressed" to the console when the icon is clicked */}
          <Pressable onPress={() => console.log("Button Pressed!")}>
            <Feather name='edit' size={24} color='green' />
          </Pressable>
        </View>
      </View>

      <View style={styles.chatlistContainer}>
        {rooms.length > 0 ? (
          <FlatList
            data={rooms}
            renderItem={({ item }) => <ChatComponent item={item} />}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <View style={styles.chatemptyContainer}>
            <Text style={styles.chatemptyText}>No rooms created!</Text>
            <Text>Click the icon above to create a Chat room</Text>
          </View>
        )}
      </View>

      {visible ? <Modal setVisible={setVisible} /> : ""}
    </SafeAreaView>
  );
};

export default Chat;