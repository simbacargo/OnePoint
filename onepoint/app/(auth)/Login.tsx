import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function BarcodeScannerScreen() {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  return (
    <View style={styles.container}>
      {/* The CameraView component is where the magic happens.
        It handles the live camera feed and barcode detection.
      */}
      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          // You can specify which barcode types you want to scan (e.g., 'qr', 'ean-13')
          barcodeTypes: ['qr', 'ean-13', 'upc-a', 'code-128'],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* The 'scanned' state prevents the scanner from immediately scanning 
        the same barcode multiple times in a row.
      */}
      {scanned && (
        <Button
          title={'Tap to Scan Again'}
          onPress={() => setScanned(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});