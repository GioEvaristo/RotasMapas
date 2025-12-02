import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';

export default function App() {
  const [rota, setRota] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const origem = {
    latitude: -21.56820567341847,
    longitude: -45.446054298480874,
  };

  const destino = {
    latitude: -21.53764419061342,
    longitude: -45.40782828854381,
  };

  const buscarRota = async () => {
    try {
      const inicio = `${origem.longitude},${origem.latitude}`;
      const final = `${destino.longitude},${destino.latitude}`;

      const url = `http://router.project-osrm.org/route/v1/driving/${inicio};${final}?overview=full&geometries=polyline`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.routes.length > 0) {
        const points = result.routes[0].geometry;
        const decodedPoints = polyline.decode(points);
        const coordenadasFormatadas = decodedPoints.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));

        setRota(coordenadasFormatadas);
      }
    } catch (error) {
      console.error('Erro ao buscar rota:', error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarRota();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          mapType="hybrid"
          initialRegion={{
            latitude: origem.latitude,
            longitude: origem.longitude,
            latitudeDelta: 0.0005,
            longitudeDelta: 0.0005,
          }}
        >
          <Marker coordinate={origem} title="Partida" pinColor="#34D399" />
          <Marker coordinate={destino} title="Chegada" pinColor="#34D399" />
          {rota.length > 0 && (
            <Polyline
              coordinates={rota}
              strokeColor="#9333EA"
              strokeWidth={5}
              lineDashPattern={[10, 10]}
            />
          )}
        </MapView>
      </View>

      {carregando && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F43F5E" />
          <Text style={styles.loading}>Calculando Rota...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff6cd8ff',
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20, 
    overflow: 'hidden', 
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fundo semi-transparente para destacar
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10, // Sombra no Android
  },
  loading: {
    marginTop: 10,
    color: '#FFFFFF', // Texto claro
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
