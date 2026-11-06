/*
  =======================================================================================
  KrishiSync (SoilSathi) - Handheld IoT Soil Analyzer Wand Firmware
  Target Board: ESP32 DOIT DEVKIT V1
  Sensors:
    - Analog pH Sensor (BNC Probe Module) -> GPIO 32 (ADC1_CH4)
    - Capacitive Soil Moisture Sensor v1.2 -> GPIO 34 (ADC1_CH6)
    - 18650 Battery Voltage Divider -> GPIO 36 (ADC1_CH0)
    - Status Indicator LED -> GPIO 2 (Onboard Blue LED)
    - Push-to-Test Button -> GPIO 4 (Wakes from Deep Sleep / Triggers Measurement)
  BLE Specs:
    - Device Name: KrishiSync-Wand
    - Service UUID: 4fafc201-1fb5-459e-8fcc-c5c9c331914b
    - Characteristic UUID: beb5483e-36e1-4688-b7f5-ea07361b26a8 (NOTIFY, READ)
  =======================================================================================
*/

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// PIN ASSIGNMENTS
#define PIN_PH_SENSOR       32  // Analog pH Probe Input (ADC1)
#define PIN_SOIL_MOISTURE   34  // Capacitive Soil Moisture Sensor (ADC1)
#define PIN_BATTERY_DIVIDER 36  // 1:2 Voltage Divider for 18650 Cell (ADC1)
#define PIN_STATUS_LED       2  // Built-in Blue LED for status
#define PIN_PROBE_BUTTON     4  // Push button (Active LOW with pull-up)

// BLE UUID DEFINITIONS
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// CALIBRATION CONSTANTS
// Soil Moisture (Capacitive v1.2):
const int AIR_VALUE = 3150;    // Raw ADC reading in dry air (0% moisture)
const int WATER_VALUE = 1350;  // Raw ADC reading in water cup (100% moisture)

// pH Probe 2-Point Buffer Calibration (pH 4.01 and pH 7.00):
const float PH7_VOLTAGE = 1.65; // Voltage output at neutral buffer (pH 7.00)
const float PH_SLOPE = 0.18;    // Volts per pH unit change

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;
unsigned long lastActivityTime = 0;
const unsigned long SLEEP_TIMEOUT_MS = 60000; // Go to deep sleep after 60s of inactivity

// BLE Server Callbacks
class KrishiServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    digitalWrite(PIN_STATUS_LED, HIGH);
    Serial.println("[BLE] Farmer smartphone connected!");
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    digitalWrite(PIN_STATUS_LED, LOW);
    Serial.println("[BLE] Smartphone disconnected.");
  }
};

// Oversampling ADC helper (averages 32 samples to suppress soil impedance noise)
uint32_t readOversampledADC(int pin, int samples = 32) {
  uint32_t sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delayMicroseconds(200);
  }
  return sum / samples;
}

// Convert raw ADC to battery percentage (18650 Li-ion cell: 3.2V = 0%, 4.2V = 100%)
int readBatteryPercentage() {
  uint32_t raw = readOversampledADC(PIN_BATTERY_DIVIDER, 16);
  // ADC range 0-4095 (3.3V reference) through 100k:100k divider (multiplier x2)
  float pinVoltage = (raw / 4095.0) * 3.3;
  float batteryVoltage = pinVoltage * 2.0;

  int percent = (int)(((batteryVoltage - 3.2) / (4.2 - 3.2)) * 100.0);
  if (percent > 100) percent = 100;
  if (percent < 0) percent = 0;
  return percent;
}

// Read and compute calibrated Soil Moisture %
float readSoilMoisturePercent() {
  uint32_t raw = readOversampledADC(PIN_SOIL_MOISTURE, 32);
  float percent = ((float)(AIR_VALUE - raw) / (float)(AIR_VALUE - WATER_VALUE)) * 100.0;
  if (percent > 100.0) percent = 100.0;
  if (percent < 0.0) percent = 0.0;
  return percent;
}

// Read and compute calibrated Soil pH
float readSoilPh() {
  uint32_t raw = readOversampledADC(PIN_PH_SENSOR, 32);
  float voltage = (raw / 4095.0) * 3.3;
  // pH equation: pH = 7.0 + ((V_neutral - V_meas) / slope)
  float ph = 7.0 + ((PH7_VOLTAGE - voltage) / PH_SLOPE);
  if (ph > 14.0) ph = 14.0;
  if (ph < 0.0) ph = 0.0;
  return ph;
}

// Transmit telemetry packet to Smartphone App via BLE
void sendTelemetryPacket() {
  // Flash LED twice to indicate measurement
  for (int i = 0; i < 2; i++) {
    digitalWrite(PIN_STATUS_LED, LOW);
    delay(80);
    digitalWrite(PIN_STATUS_LED, HIGH);
    delay(80);
  }

  float ph = readSoilPh();
  float moisture = readSoilMoisturePercent();
  int battery = readBatteryPercentage();

  // Create JSON payload
  char payload[96];
  snprintf(payload, sizeof(payload), "{\"ph\":%.2f,\"moist\":%.1f,\"batt\":%d}", ph, moisture, battery);

  Serial.print("[BLE TX] Transmitting Soil Reading: ");
  Serial.println(payload);

  if (deviceConnected && pCharacteristic != NULL) {
    pCharacteristic->setValue((uint8_t*)payload, strlen(payload));
    pCharacteristic->notify();
  }
}

void enterDeepSleep() {
  Serial.println("[POWER] Inactivity timeout reached. Entering Ultra-Low Power Deep Sleep...");
  digitalWrite(PIN_STATUS_LED, LOW);
  
  // Configure wake up on button press (GPIO 4 LOW)
  esp_sleep_enable_ext0_wakeup((gpio_num_t)PIN_PROBE_BUTTON, 0);
  esp_deep_sleep_start();
}

void setup() {
  Serial.begin(115200);
  Serial.println("\n==========================================");
  Serial.println("  KrishiSync Handheld IoT Wand Initializing");
  Serial.println("==========================================");

  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_PROBE_BUTTON, INPUT_PULLUP);
  digitalWrite(PIN_STATUS_LED, LOW);

  // Configure ESP32 ADC (12-bit, 11dB attenuation for 0-3.3V range)
  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // Initialize BLE Stack
  BLEDevice::init("KrishiSync-Wand");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new KrishiServerCallbacks());

  // Create BLE Service
  BLEService* pService = pServer->createService(SERVICE_UUID);

  // Create BLE Characteristic
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_NOTIFY
                    );

  // Enable notifications via Client Characteristic Configuration Descriptor (CCCD)
  pCharacteristic->addDescriptor(new BLE2902());

  // Start Service & Advertising
  pService->start();
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("[BLE] Advertising started as 'KrishiSync-Wand'. Ready for smartphone pairing!");
  lastActivityTime = millis();

  // Perform initial power-on calibration reading
  sendTelemetryPacket();
}

void loop() {
  // Check probe trigger button
  if (digitalRead(PIN_PROBE_BUTTON) == LOW) {
    delay(50); // Debounce
    if (digitalRead(PIN_PROBE_BUTTON) == LOW) {
      Serial.println("[BUTTON] Probe button pressed! Reading soil...");
      sendTelemetryPacket();
      lastActivityTime = millis();
      while (digitalRead(PIN_PROBE_BUTTON) == LOW) delay(10); // Wait for release
    }
  }

  // Handle BLE disconnect / reconnect housekeeping
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    Serial.println("[BLE] Restarted advertising.");
    oldDeviceConnected = deviceConnected;
  }
  if (deviceConnected && !oldDeviceConnected) {
    oldDeviceConnected = deviceConnected;
    lastActivityTime = millis();
  }

  // Periodic automatic reading every 15 seconds if connected
  if (deviceConnected && (millis() - lastActivityTime > 15000)) {
    sendTelemetryPacket();
    lastActivityTime = millis();
  }

  // Sleep timeout if disconnected and idle
  if (!deviceConnected && (millis() - lastActivityTime > SLEEP_TIMEOUT_MS)) {
    enterDeepSleep();
  }

  delay(20);
}
