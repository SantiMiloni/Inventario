#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Adafruit_NeoPixel.h>

#define PIN_LED 33
#define NUM_LEDS 64
#define size(x) (sizeof(x) / sizeof(x[0]))

Adafruit_NeoPixel matriz(NUM_LEDS, PIN_LED, NEO_GBR + NEO_KHZ800);

int c1[] = { 0, 1, 2 }; int c2[] = { 5, 6, 7 }; int c3[] = { 8, 9, 10 }; int c4[] = { 13, 14, 15 }; int c5[] = { 16, 17, 18 }; int c6[] = { 21, 22, 23 };

// ======================================================
// WIFI
// ======================================================

const char* SSID = "MECA-IoT";

const char* PASSWORD = "IoT$2027";


// ======================================================
// FIREBASE
// ======================================================

const char* URL_CAJON =
  "https://base-de-datos---inventario-default-rtdb.firebaseio.com/comando/cajon.json";


const char* URL_EVENTO =
  "https://base-de-datos---inventario-default-rtdb.firebaseio.com/comando/evento.json";


// ======================================================
// VARIABLES
// ======================================================

int cajonActual = -1;

unsigned long eventoActual = 0;

unsigned long ultimoChequeo = 0;


// Cada cuánto consultar Firebase
const unsigned long INTERVALO_FIREBASE = 1000;


// ======================================================
// DECLARACIONES
// ======================================================
void pixels(int array[], int size);

void conectarWiFi();

int revisarFirebase();

int leerEnteroFirebase(
  const char* url);

unsigned long leerUnsignedLongFirebase(
  const char* url);


// ======================================================
// SETUP
// ======================================================

void setup() {

  Serial.begin(115200);

  matriz.begin();
  matriz.clear();
  matriz.show();
  matriz.setBrightness(200);

  delay(1000);


  Serial.println();
  Serial.println();
  Serial.println(
    "==============================");

  Serial.println(
    "      SISTEMA PAÑOL");

  Serial.println(
    "==============================");


  conectarWiFi();
}


// ======================================================
// LOOP
// ======================================================

void loop() {

  // ------------------------------------------
  // RECONECTAR WIFI SI SE DESCONECTA
  // ------------------------------------------

  if (
    WiFi.status() != WL_CONNECTED) {

    Serial.println(
      "WiFi desconectado.");

    conectarWiFi();
  }


  // ------------------------------------------
  // CONSULTAR FIREBASE
  // ------------------------------------------

  if (
    millis() - ultimoChequeo >= INTERVALO_FIREBASE) {

    ultimoChequeo =
      millis();


    revisarFirebase();
  }
  switch (revisarFirebase()) {
    case 1:
      Serial.println("Mostrando case 1");
      matriz.clear();
      pixels(c1, size(c1));
      matriz.show();
      break;
    case 2:
      Serial.println("Mostrando case 2");
      matriz.clear();
      pixels(c2, size(c2));
      matriz.show();
      break;
    case 3:
      Serial.println("Mostrando case 3");
      matriz.clear();
      pixels(c3, size(c3));
      matriz.show();
      break;
    case 4:
      Serial.println("Mostrando case 4");
      matriz.clear();
      pixels(c4, size(c4));
      matriz.show();
      break;
    case 5:
      Serial.println("Mostrando case 5");
      matriz.clear();
      pixels(c5, size(c5));
      matriz.show();
      break;
    case 6:
      Serial.println("Mostrando case 6");
      matriz.clear();
      pixels(c6, size(c6));
      matriz.show();
      break;
    default:
      matriz.clear();
      break;
  }
}


// ======================================================
// CONECTAR WIFI
// ======================================================

void conectarWiFi() {

  Serial.println();
  Serial.print(
    "Conectando a: ");

  Serial.println(
    SSID);


  WiFi.begin(
    SSID,
    PASSWORD);


  int intentos = 0;


  while (
    WiFi.status() != WL_CONNECTED) {

    delay(500);

    Serial.print(".");


    intentos++;


    if (
      intentos >= 40) {

      Serial.println();
      Serial.println(
        "No se pudo conectar.");


      WiFi.disconnect();

      delay(1000);


      WiFi.begin(
        SSID,
        PASSWORD);


      intentos = 0;
    }
  }


  Serial.println();
  Serial.println(
    "WiFi conectado correctamente.");


  Serial.print(
    "IP del ESP32: ");

  Serial.println(
    WiFi.localIP());


  Serial.print(
    "Potencia WiFi: ");

  Serial.print(
    WiFi.RSSI());

  Serial.println(
    " dBm");


  Serial.println();
}


// ======================================================
// REVISAR FIREBASE
// ======================================================

int revisarFirebase() {

  /*
        Primero leemos "evento".

        Si evento cambió significa que alguien
        volvió a pulsar "Mostrar ubicación".

        Incluso aunque sea el mismo cajón.
    */


  unsigned long nuevoEvento =
    leerUnsignedLongFirebase(
      URL_EVENTO);


  if (
    nuevoEvento == 0) {

    return -1;
  }


  // Si es el mismo evento, no hacemos nada
  if (
    nuevoEvento == eventoActual) {

    return -1;
  }


  // Guardamos el nuevo evento
  eventoActual =
    nuevoEvento;


  // Ahora leemos el cajón
  int nuevoCajon =
    leerEnteroFirebase(
      URL_CAJON);


  if (
    nuevoCajon <= 0) {

    Serial.println(
      "Se recibió un cajón inválido.");

    return -1;
  }


  cajonActual =
    nuevoCajon;


  // ==========================================
  // NUEVA ORDEN
  // ==========================================

  Serial.println();

  Serial.println(
    "==============================");

  Serial.println(
    "NUEVA SOLICITUD");


  Serial.print(
    "Cajón: ");

  Serial.println(
    cajonActual);


  Serial.print(
    "Evento: ");

  Serial.println(
    eventoActual);


  Serial.println(
    "==============================");


  /*
        MÁS ADELANTE:

        prenderCajon(
            cajonActual
        );
    */
  return cajonActual;
}


// ======================================================
// LEER ENTERO DE FIREBASE
// ======================================================

int leerEnteroFirebase(
  const char* url) {

  if (
    WiFi.status() != WL_CONNECTED) {

    return -1;
  }


  WiFiClientSecure client;


  /*
        Para las primeras pruebas usamos
        setInsecure().

        Funciona por HTTPS pero no verifica
        manualmente el certificado.

        Más adelante podemos mejorarlo.
    */

  client.setInsecure();


  HTTPClient https;


  if (
    !https.begin(
      client,
      url)) {

    Serial.println(
      "Error iniciando HTTPS.");

    return -1;
  }


  int codigoHTTP =
    https.GET();


  if (
    codigoHTTP != HTTP_CODE_OK) {

    Serial.print(
      "Error HTTP cajón: ");

    Serial.println(
      codigoHTTP);


    https.end();

    return -1;
  }


  String respuesta =
    https.getString();


  https.end();


  respuesta.trim();


  if (
    respuesta == "null") {

    return -1;
  }


  return respuesta.toInt();
}


// ======================================================
// LEER EVENTO DE FIREBASE
// ======================================================

unsigned long leerUnsignedLongFirebase(
  const char* url) {

  if (
    WiFi.status() != WL_CONNECTED) {

    return 0;
  }


  WiFiClientSecure client;

  client.setInsecure();


  HTTPClient https;


  if (
    !https.begin(
      client,
      url)) {

    Serial.println(
      "Error iniciando HTTPS.");

    return 0;
  }


  int codigoHTTP =
    https.GET();


  if (
    codigoHTTP != HTTP_CODE_OK) {

    Serial.print(
      "Error HTTP evento: ");

    Serial.println(
      codigoHTTP);


    https.end();

    return 0;
  }


  String respuesta =
    https.getString();


  https.end();


  respuesta.trim();


  if (
    respuesta == "null") {

    return 0;
  }


  return strtoul(
    respuesta.c_str(),
    nullptr,
    10);
}

void pixels(int array[], int arraySize) {
  for (int i = 0; i < arraySize; i++) {
    matriz.setPixelColor(array[i], 0, 30, 10);
  }
}
