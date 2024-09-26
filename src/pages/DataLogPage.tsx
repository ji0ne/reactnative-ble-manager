import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { NativeEventEmitter, NativeModules } from 'react-native';
import BleManager from 'react-native-ble-manager';

import { Device } from '../types/device'

interface DataProps {
    peripheral: string;
    characteristic : string;
    value : string;
}

interface DataLogProps {
    device : Device;
}

const DataLog = ({ device } : DataLogProps) => {
 // const { device } = route.params; // ConnectDevice에서 전달된 장치 정보
  const [logs, setLogs] = useState<string[]>([]); // 로그 데이터를 저장할 상태 변수

  // BLE 통신 초기화 및 데이터 수신 설정
  useEffect(() => {
    // 데이터 업데이트를 감지하는 리스너 추가
    const BleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);
    const dataListener = BleManagerEmitter.addListener(
        'BleManagerDidUpdateValueForCharacteristic', 
        handleDataUpdate);

    return () => {
      dataListener.remove();
    };
  }, [device.id]);

  // 데이터 업데이트를 처리하는 함수
  const handleDataUpdate = (data : DataProps) => {
    if (data.peripheral === device.id) {
      const { characteristic, value } = data;
      const logMessage = 
      `Characteristic: ${characteristic}, Value: ${value}, Time: ${new Date().toLocaleTimeString()}`;
      // 새로운 로그 메시지를 logs 상태에 추가
      setLogs((prevLogs) => [...prevLogs, logMessage]);
    }
  };


  // 로그 아이템을 렌더링하는 함수
  const renderLogItem = ({ item } : {item:string} ) => (
    <View style={styles.logItem}>
      <Text style={styles.logText}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Device: {device.name}</Text>
      <Text style={styles.subtitle}>ID: {device.id}</Text>

      <ScrollView style={styles.logContainer}>
        <FlatList
          data={logs}
          renderItem={renderLogItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  logItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logText: {
    fontSize: 14,
    color: '#333',
  },
});

export default DataLog;
