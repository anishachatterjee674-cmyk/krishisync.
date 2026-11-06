# 🌿 KrishiSync (SoilSathi) - Hardware Architecture & IoT Wand Guide

The **"Probe-and-Go" handheld wand** is engineered to eliminate the two biggest failure points of conventional in-ground agri-sensors: **sensor corrosion** and **in-field theft/tampering**. The farmer carries the lightweight wand into the field, inserts the probe into the root zone (3-4 inches deep), captures the readings via BLE on their smartphone in under 3 seconds, wipes it clean, and returns home.

---

## 1. Bill of Materials (BOM) & Cost Breakdown (Target: < ₹1,400 INR)

| Component | Specification | Function | Approx Cost (INR) |
| :--- | :--- | :--- | :--- |
| **Microcontroller** | ESP32 DOIT DevKit V1 (30-pin) | BLE 4.2 / 5.0, ADC oversampling, power management | ₹350 |
| **Soil pH Sensor** | Analog pH Electrode Probe with BNC breakout module | Real-time soil acidity / alkalinity detection | ₹650 |
| **Soil Moisture Sensor** | Capacitive Soil Moisture Sensor v1.2 | Corrosion-resistant dielectric moisture sensing (0-100%) | ₹110 |
| **Rechargeable Battery** | 18650 Li-ion 3.7V (2600mAh) | Field power source (lasts 2+ months on deep sleep) | ₹140 |
| **Charging & Protection**| TP4056 USB-C Li-ion Charger + BMS board | Charge using any standard Android phone charger | ₹35 |
| **Enclosure & Wand** | PVC wand tube (32mm dia) + 3D printed handle | Waterproof probe holder & ergonomic grip | ₹80 |
| **Misc & Wiring** | 100kΩ resistors (divider), momentary push switch, wires | Battery monitoring & test trigger button | ₹30 |
| **TOTAL** | | | **~ ₹1,395 INR (~$16 USD)** |

---

## 2. Wiring & Pinout Diagram

```
                 +------------------------------------------------+
                 |            ESP32 DOIT DEVKIT V1                |
                 |                                                |
  (pH Signal) ---| GPIO 32 (ADC1_CH4)                      3.3V   |---> Sensor VCC (3.3V)
                 |                                                |
  (Moisture)  ---| GPIO 34 (ADC1_CH6)                       GND   |---> Common Ground
                 |                                                |
  (Bat Sense) ---| GPIO 36 (ADC1_CH0)                       VIN   |<--- Battery 3.7V - 4.2V
                 |                                                |
  (Trigger)   ---| GPIO 4 (Pullup Button)                GPIO 2   |---> Status Blue LED
                 +------------------------------------------------+

BATTERY MONITOR CIRCUIT:
  18650 Battery (+) ----[ 100kΩ ]----+----[ 100kΩ ]---- Battery (-) / GND
                                     |
                                 GPIO 36 (ADC)
```

---

## 3. Sensor Calibration Guide

### A. Capacitive Soil Moisture Sensor (v1.2)
1. **Air Value (`AIR_VALUE`)**: Hold the sensor in dry air. Record the ADC value (typically ~3150 in 12-bit mode). This corresponds to **0% Volumetric Water Content**.
2. **Water Value (`WATER_VALUE`)**: Submerge the probe into a glass of plain water up to the white marker line. Record the ADC value (typically ~1350). This corresponds to **100% saturation**.
3. The firmware calculates moisture percentage using:
   $$\text{Moisture } \% = \frac{\text{AIR\_VALUE} - \text{Raw ADC}}{\text{AIR\_VALUE} - \text{WATER\_VALUE}} \times 100$$

### B. Soil pH Electrode Probe
1. Clean the glass bulb with distilled water.
2. Dip into **pH 7.00 buffer solution**. Adjust the 10-turn potentiometer on the BNC module until the analog output reads exactly **1.65V** (ADC ~2048).
3. Dip into **pH 4.01 buffer solution** to calibrate the slope ($0.18\text{ V per pH unit}$).

---

## 4. Ultra-Low Power Consumption
- **Active Probe Measurement**: 65 mA for 3 seconds.
- **ESP32 BLE Advertising**: 45 mA for 60 seconds.
- **Deep Sleep Mode**: Only **15 µA**!
- With a standard 2600mAh 18650 cell, taking 5 soil tests daily allows over **8 months of operation** without recharging.
