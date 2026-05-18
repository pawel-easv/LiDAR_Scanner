#include <Arduino.h>
#include <Wire.h>
#include <LIDARLite_v4LED.h>
#include <ESP32Servo.h>
#include <WiFi.h>
#include <ArduinoOTA.h>
#include <HTTPClient.h>
#include <LiquidCrystal_I2C.h>

// ─── Hardware ─────────────────────────────────────────────────────────────────
const int servoPin          = 18;
const int STEP_DEGREES      = 1;
const int DELAY_MS          = 50;
const int MAX_ANGLE         = 180;

const uint16_t MAX_VALID_DISTANCE = 1680;
const uint16_t MIN_VALID_DISTANCE = 5;

// ─── Globals ──────────────────────────────────────────────────────────────────
LIDARLite_v4LED lidar;
Servo myServo;
LiquidCrystal_I2C lcd(0x27, 16, 2);


float distances[181];
bool sweepDone = false;
int lastAngle  = 0;

// ─── Live print timer ─────────────────────────────────────────────────────────
unsigned long lastPrint = 0;
const unsigned long PRINT_INTERVAL = 1000;

// ─── Forward declarations ─────────────────────────────────────────────────────
uint16_t getFilteredDistance();
float    computeArea();
void     sendToFlespi(float areaCm2, float areaM2);
void     connectWiFi();
void     setupOTA();

// ─────────────────────────────────────────────────────────────────────────────

uint16_t getFilteredDistance() {
    uint16_t dist = 0;
    const int retryLimit = 3;

    for (int i = 0; i < retryLimit; i++) {
        lidar.takeRange();
        lidar.waitForBusy();
        dist = lidar.readDistance();

        if (dist > MIN_VALID_DISTANCE && dist < MAX_VALID_DISTANCE) {
            return dist;
        }
        delay(5);
    }
    return 0;
}

float computeArea() {
    float totalArea  = 0.0;
    float deltaTheta = STEP_DEGREES * (PI / 180.0);

    for (int i = 0; i < MAX_ANGLE; i++) {
        float r1 = distances[i];
        float r2 = distances[i + 1];
        if (r1 > 0 && r2 > 0) {
            totalArea += 0.5f * r1 * r2 * sin(deltaTheta);
        }
    }
    return totalArea;
}

void sendToFlespi(float areaCm2, float areaM2) {
    String url = "https://flespi.io/gw/devices/";
    url += DEVICE_ID;
    url += "/messages";

    // Manual JSON — no ArduinoJson needed
    String payload = "[{\"scanned_area_cm2\":";
    payload += String(areaCm2, 1);
    payload += ",\"scanned_area_m2\":";
    payload += String(areaM2, 3);
    payload += ",\"timestamp\":";
    payload += String((long)(millis() / 1000));
    payload += "}]";

    Serial.println("Sending to Flespi: " + payload);

    HTTPClient http;
    http.begin(url);
    http.addHeader("Content-Type",  "application/json");
    http.addHeader("Authorization", String("FlespiToken ") + FLESPI_TOKEN);

    int httpCode = http.POST(payload);
    if (httpCode > 0) {
        Serial.printf("Flespi HTTP %d: %s\n", httpCode, http.getString().c_str());
    } else {
        Serial.printf("Flespi POST failed: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
}

void connectWiFi() {
    Serial.printf("\nConnecting to: %s\n", WIFI_SSID);
    WiFi.disconnect(true);
    delay(100);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.printf("Connected! IP: %s\n", WiFi.localIP().toString().c_str());
}

void setupOTA() {
    ArduinoOTA.setHostname(OTA_HOSTNAME);
    if (strlen(OTA_PASSWORD) > 0) ArduinoOTA.setPassword(OTA_PASSWORD);

    ArduinoOTA.onStart([]() {
        String type = (ArduinoOTA.getCommand() == U_FLASH) ? "sketch" : "filesystem";
        Serial.println("OTA start: " + type);
    });
    ArduinoOTA.onEnd([]()  { Serial.println("\nOTA end."); });
    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
        Serial.printf("OTA: %u%%\r", (progress * 100) / total);
    });
    ArduinoOTA.onError([](ota_error_t error) {
        Serial.printf("OTA error[%u]\n", error);
    });

    ArduinoOTA.begin();
    Serial.println("OTA ready – hostname: " + String(OTA_HOSTNAME));
}

// ─────────────────────────────────────────────────────────────────────────────

void setup() {
    Serial.begin(115200);
    Wire.begin(21, 22);

    lcd.init();
    lcd.backlight();
    lcd.setCursor(0, 0);    
    lcd.print("LIDAR Scanner");
    myServo.setPeriodHertz(50);
    myServo.attach(servoPin, 500, 2400);
    lidar.configure(0);

    myServo.write(0);
    delay(1000);
    connectWiFi();
    setupOTA();

}

void loop() {
    ArduinoOTA.handle();

    unsigned long now = millis();
    if (!sweepDone && (now - lastPrint >= PRINT_INTERVAL)) {
        lastPrint = now;
    }

    if (!sweepDone) {
        float lastValidDistance = 0;

        for (int angle = 0; angle <= MAX_ANGLE; angle += STEP_DEGREES) {
            myServo.write(angle);
            delay(DELAY_MS);

            uint16_t distance = getFilteredDistance();

            if (distance == 0 && lastValidDistance > 0) {
                distances[angle] = lastValidDistance;
            } else {
                distances[angle] = (float)distance;
                if (distance > 0) lastValidDistance = (float)distance;
            }

            lastAngle = angle;

            Serial.printf("Angle: %3d°  Distance: %u cm\n", angle, distance);

            lcd.setCursor(0, 0);
            lcd.print("Angle: ");
            lcd.print(angle);
            lcd.print((char)223);
            lcd.print("    ");

            lcd.setCursor(0, 1);
            lcd.print("Distance: ");
            lcd.print(distance);
            lcd.print(" cm  ");
            ArduinoOTA.handle(); 
        }

        sweepDone = true;

        float totalCm2 = computeArea();
        float totalM2  = totalCm2 / 10000.0f;

        Serial.println("\n=== Sweep Complete ===");
        Serial.printf("Estimated Room Area: %.1f cm²\n", totalCm2);
        Serial.printf("Estimated Room Area: %.3f m²\n",  totalM2);
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Area:");
        lcd.setCursor(6, 0);
        lcd.print(totalM2);
        lcd.print("m2");
        lcd.setCursor(6, 1);
        lcd.print((int)totalCm2);
        lcd.print("cm2");

        sendToFlespi(totalCm2, totalM2);
    }
}