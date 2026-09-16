#include <Adafruit_NeoPixel.h>

#define PIN_LED 33
#define NUM_LEDS 64

Adafruit_NeoPixel matriz(NUM_LEDS, PIN_LED, NEO_GRB + NEO_KHZ800);

bool serpentina = true;

int ledXY(int x, int y) {
  if (x < 0 || x >= 8 || y < 0 || y >= 8) return -1;

  if (serpentina && (y % 2 == 1)) {
    return y * 8 + (7 - x);
  }

  return y * 8 + x;
}

void pixel(int x, int y, uint32_t color) {
  int i = ledXY(x, y);
  if (i >= 0) matriz.setPixelColor(i, color);
}

void dibujarCorazon(uint8_t brillo) {
  matriz.clear();

  uint32_t rojo = matriz.Color(brillo, 0, 0);

  // Fila 1
  pixel(1, 1, rojo);
  pixel(2, 1, rojo);
  pixel(5, 1, rojo);
  pixel(6, 1, rojo);

  // Fila 2
  pixel(0, 2, rojo);
  pixel(1, 2, rojo);
  pixel(2, 2, rojo);
  pixel(3, 2, rojo);
  pixel(4, 2, rojo);
  pixel(5, 2, rojo);
  pixel(6, 2, rojo);
  pixel(7, 2, rojo);

  // Fila 3
  pixel(0, 3, rojo);
  pixel(1, 3, rojo);
  pixel(2, 3, rojo);
  pixel(3, 3, rojo);
  pixel(4, 3, rojo);
  pixel(5, 3, rojo);
  pixel(6, 3, rojo);
  pixel(7, 3, rojo);

  // Fila 4
  pixel(1, 4, rojo);
  pixel(2, 4, rojo);
  pixel(3, 4, rojo);
  pixel(4, 4, rojo);
  pixel(5, 4, rojo);
  pixel(6, 4, rojo);

  // Fila 5
  pixel(2, 5, rojo);
  pixel(3, 5, rojo);
  pixel(4, 5, rojo);
  pixel(5, 5, rojo);

  // Fila 6
  pixel(3, 6, rojo);
  pixel(4, 6, rojo);

  matriz.show();
}

void setup() {
  matriz.begin();
  matriz.clear();
  matriz.show();
}

void loop() {

  // Latido: sube brillo
  for (int b = 40; b <= 255; b += 10) {
    dibujarCorazon(b);
    delay(20);
  }

  // Baja rápido
  for (int b = 255; b >= 80; b -= 12) {
    dibujarCorazon(b);
    delay(20);
  }

  delay(100);

  // Segundo latido
  for (int b = 80; b <= 255; b += 15) {
    dibujarCorazon(b);
    delay(15);
  }

  for (int b = 255; b >= 40; b -= 10) {
    dibujarCorazon(b);
    delay(20);
  }

  delay(600);
}