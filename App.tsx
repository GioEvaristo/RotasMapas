// Grupo: Gabriel Machado, Giovanna Fonseca, Julia Garcia e Pedro Henrique Liló
// Atividade 03 - Maps // Rota do ET

import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, ActivityIndicator, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import React, { useRef } from 'react';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';

export default function App() {
  const mapRef = useRef(null);
  
  const [region, setRegion] = useState({
    latitude: -21.5539,
    longitude: -45.4370,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  
  const [index, setIndex] = useState(0);
  const [localizacao, setLocalizacao] = useState(null);
  const [carrega, setCarrega] = useState(true);
  const [permissaoNegada, setPermissaoNegada] = useState(false);
  const [rota, setRota] = useState([]);
  const [carregandoRota, setCarregandoRota] = useState(false);

  // Lista de 8 pontos da Rota do ET baseada no G1
  const rotas = [
    {
      id: 1,
      nome: 'Terreno em que ET teria sido visto por meninas',
      descricao: 'Rua Dr. Benevenuto Braz Viêira, 21 - Vila Andere',
      latitude: -21.568298300296714,
      longitude: -45.43423220696292,
      imagem: require('./assets/terreno.webp'),
    },
    {
      id: 2,
      nome: 'Memorial do ET',
      descricao: 'R. Maria Paiva Pinto, 105 - Vila Paiva',
      latitude: -21.53944157296884, 
      longitude: -45.43689312383651,
      imagem: require('./assets/memorial.png'),
    },
    {
      id: 3,
      nome: 'Nave Espacial e Estátua do ET',
      descricao: 'Praça Getúlio Vargas, 193 - Centro',
      latitude: -21.55930627625668,
      longitude: -45.43999730338807,
      imagem: require('./assets/nave.png'),
    },
    {
      id: 4,
      nome: 'Estátuas com formato do ‘verdadeiro’ ET',
      descricao: 'Praça José R. Paiva - Centro',
      latitude: -21.55720673416103, 
      longitude: -45.43842937385777,
      imagem: require('./assets/estatuaet2.png'),
    },
    {
      id: 5,
      nome: 'Ponto de ônibus temático',
      descricao: 'Av. Francisco Navarra, 425',
      latitude: -21.566611540623995, 
      longitude: -45.43696405587806,
      imagem: require('./assets/pontodeonibus.png'),
    },
    {
      id: 6,
      nome: 'Zoológico de Varginha',
      descricao: 'R. Petrópolis - Jardim Petropolis',
      latitude: -21.56777478239457, 
      longitude: -45.44578910437535,
      imagem: require('./assets/zoovarginha.png'),
    },
    {
      id: 7,
      nome: 'Prefeitura Municipal',
      descricao: 'R. Júlio Paulo Marcelini, 50',
      latitude: -21.544688046723167, 
      longitude: -45.44453380612826,
      imagem: require('./assets/prefeituraelevador.png'),
    },
    {
      id: 8,
      nome: 'Aeroporto de Varginha',
      descricao: 'Aeroporto, Varginha - MG',
      latitude: -21.588588533252317, 
      longitude: -45.47640492882973,
      imagem: require('./assets/aeroporto.png'),
    },
  ];

  const buscarRota = async (origem, destino) => {
    try {
      setCarregandoRota(true);
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
      setCarregandoRota(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setPermissaoNegada(true);
          setCarrega(false);
          return;
        }
        
        let userLocal = await Location.getCurrentPositionAsync({});
        setLocalizacao(userLocal.coords);
        setCarrega(false);
      } catch (error) {
        console.error('Erro ao obter localização:', error);
        setPermissaoNegada(true);
        setCarrega(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!carrega && mapRef.current) {
      mapRef.current.animateToRegion(region, 2000);
    }
  }, [region]);

  const irParaOutroLocal = () => {
    const pontoAtual = rotas[index];
    const proximoIndex = (index + 1) % rotas.length;
    const proximoPonto = rotas[proximoIndex];
        buscarRota(
      { latitude: pontoAtual.latitude, longitude: pontoAtual.longitude },
      { latitude: proximoPonto.latitude, longitude: proximoPonto.longitude }
    );
    setRegion({
      latitude: proximoPonto.latitude,
      longitude: proximoPonto.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
    
    setIndex(proximoIndex);
  };

  if (permissaoNegada) {
    return (
      <View style={styles.container}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={region}
            ref={mapRef}
            mapType='hybrid'
          >
            {rotas.map((item) => (
              <Marker
                key={item.id}
                title={item.nome}
                description={item.descricao}
                coordinate={{ latitude: item.latitude, longitude: item.longitude }}
              >
                <Image 
                  source={item.imagem} 
                  style={{ width: 80, height: 80 }}
                  resizeMode="contain"
                />
              </Marker>
            ))}
            {rota.length > 0 && (
              <Polyline
                coordinates={rota}
                strokeColor="#E91E63"
                strokeWidth={5}
                lineDashPattern={[10, 10]}
              />
            )}
          </MapView>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.warningText}>
            Permissão de localização negada
          </Text>
          <Text style={styles.infoText}>
            O mapa está disponível, mas sua localização não será exibida.
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title={`Visitar: ${rotas[index].nome}`} 
            onPress={irParaOutroLocal}
            color="#4CAF50"
          />
        </View>
        
        {carregandoRota && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingRouteText}>Calculando Rota...</Text>
          </View>
        )}
        <StatusBar style="auto" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.titleText}>Rota do ET de Varginha</Text>
        <Text style={styles.infoText}>
          Explore os 8 pontos turísticos da Rota do ET em Varginha!!
        </Text>
      </View>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={region}
          ref={mapRef}
          showsUserLocation={true}
          showsMyLocationButton={true}
          mapType='hybrid'
        >
          {rotas.map((item) => (
            <Marker
              key={item.id}
              title={item.nome}
              description={item.descricao}
              coordinate={{ latitude: item.latitude, longitude: item.longitude }}
            >
              <Image 
                source={item.imagem} 
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </Marker>
          ))}
          {rota.length > 0 && (
            <Polyline
              coordinates={rota}
              strokeColor="#19f619ff"
              strokeWidth={5}
              lineDashPattern={[10, 10]}
            />
          )}
        </MapView>
      </View>
      <View style={styles.buttonContainer}>
        <Button 
          title={`Você está em: ${rotas[index].nome}`} 
          onPress={irParaOutroLocal}
          color="#4CAF50"
        />
      </View>
      
      {carregandoRota && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E91E63" />
          <Text style={styles.loadingRouteText}>Calculando Rota...</Text>
        </View>
      )}
      <StatusBar style="auto" />
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
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#4CAF50',
    width: '100%',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    marginTop: 40,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 10,
    width: '100%',
    marginBottom: 40,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  loadingRouteText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});