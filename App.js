import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import TaskItem from './components/TaskItem';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const showNotificationNow = async (taskText) => {
    setTimeout(async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Task Reminder",
          body: `Reminder: ${taskText}`,
        },
        trigger: null, // triggers immediately (works in Expo Go)
      });
    }, 10000);
  };

  const handleAddTask = async () => {
    if (!task.trim()) {
      Alert.alert('Error', 'Task cannot be empty!');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      text: task.trim(),
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setTask('');
    await showNotificationNow(newTask.text);
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleToggleComplete = (id) => {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 My Tasks</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a task"
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) =>
          <TaskItem task={item} onDelete={handleDeleteTask} onToggleComplete={handleToggleComplete} />
        }
      />
    </View>
  );
}

async function registerForPushNotificationsAsync() {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Permission denied for notifications');
    }
  } else {
    Alert.alert('Must use physical device for notifications');
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  inputContainer: { flexDirection: 'row', marginBottom: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  addButtonText: { color: 'white', fontWeight: 'bold' },
});
