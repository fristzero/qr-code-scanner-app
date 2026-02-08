import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  BackHandler,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as BarcodeScanner from 'expo-barcode-scanner';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [torchOn, setTorchOn] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (scanned) {
        setScanned(false);
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setResult(data);
    setHistory(prev => [data, ...prev]);

    // Play beep sound
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/beep.mp3')
      );
      await sound.playAsync();
      setTimeout(() => sound.unloadAsync(), 1000);
    } catch (error) {
      console.log('Error playing sound:', error);
    }

    Alert.alert(
      'Scanned Successfully!',
      `Type: ${type}\nData: ${data}`,
      [
        {
          text: 'OK',
          onPress: () => setScanned(false),
        },
        {
          text: 'View Details',
          onPress: () => console.log('View details pressed'),
        },
      ],
      { cancelable: false }
    );
  };

  const toggleTorch = async () => {
    if (cameraRef.current) {
      try {
        await cameraRef.current.toggleTorch();
        setTorchOn(!torchOn);
      } catch (error) {
        console.log('Error toggling torch:', error);
      }
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {scanned ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Scan Result</Text>
          <TextInput
            style={styles.resultInput}
            value={result}
            editable={false}
            multiline
          />
          
          <Text style={styles.historyTitle}>Scan History</Text>
          <ScrollView style={styles.historyContainer}>
            {history.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyText}>{item}</Text>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.buttonText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barCodeTypes: [BarcodeScanner.Constants.BarCodeType.qr],
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.overlayTop} />
              <View style={styles.overlayMiddle}>
                <View style={styles.overlayLeft} />
                <View style={styles.scanArea}>
                  <View style={styles.cornerTopLeft} />
                  <View style={styles.cornerTopRight} />
                  <View style={styles.cornerBottomLeft} />
                  <View style={styles.cornerBottomRight} />
                </View>
                <View style={styles.overlayRight} />
              </View>
              <View style={styles.overlayBottom}>
                <Text style={styles.scanText}>Position QR code within the frame</Text>
                <TouchableOpacity
                  style={styles.torchButton}
                  onPress={toggleTorch}
                >
                  <Text style={styles.torchButtonText}>
                    {torchOn ? 'Turn Off Flash' : 'Turn On Flash'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Camera>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTop: {
    flex: 1,
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: width - 80,
  },
  overlayLeft: {
    flex: 1,
  },
  scanArea: {
    width: width - 80,
    height: width - 80,
    borderWidth: 2,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#2196F3',
  },
  cornerTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#2196F3',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#2196F3',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#2196F3',
  },
  overlayRight: {
    flex: 1,
  },
  overlayBottom: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  torchButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  torchButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyContainer: {
    flex: 1,
    marginBottom: 20,
  },
  historyItem: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  historyText: {
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
