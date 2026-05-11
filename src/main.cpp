#include <Arduino.h>
#include <Wire.h>
#include <LIDARLite_v4LED.h>
#include <ESP32Servo.h>

LIDARLite_v4LED lidar;
Servo myServo;

void calculateAndPrintArea();
uint16_t getFilteredDistance();

const int servoPin = 18;
const int STEP_DEGREES = 1;
const int DELAY_MS = 50;
const int MAX_ANGLE = 180;

// Constraints to filter out "junk" data
const uint16_t MAX_VALID_DISTANCE = 2000; 
const uint16_t MIN_VALID_DISTANCE = 5;   

float distances[181];
bool sweepDone = false;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);// Standard I2C speed for better stability

  myServo.setPeriodHertz(50);
  myServo.attach(servoPin, 500, 2400);

  lidar.configure(0);

  myServo.write(0);
  delay(1000);

  Serial.println("=== LIDAR Room Scanner (Filtered) ===");
  Serial.println("Angle(deg),Distance(cm)");
}

void loop() {
  if (sweepDone) return;

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

    Serial.println("Angle" + String(angle));
    Serial.println("Distance" + String(distance) + " cm");
    Serial.print(",");
    Serial.println(distances[angle]);
  }

  sweepDone = true;
  calculateAndPrintArea();
}

uint16_t getFilteredDistance() {
  uint16_t dist = 0;
  int retryLimit = 3;

  for (int i = 0; i < retryLimit; i++) {
    lidar.takeRange();
    lidar.waitForBusy();
    dist = lidar.readDistance();

    // 16380 is a common high-bit error for this sensor
    if (dist > MIN_VALID_DISTANCE && dist < MAX_VALID_DISTANCE && dist != 16380) {
      return dist; 
    }
    
    delay(5); 
  }

  return 0; 
}

void calculateAndPrintArea() {
  Serial.println("\n=== Sweep Complete ===");
  
  float totalArea = 0.0;
  float deltaTheta = STEP_DEGREES * (PI / 180.0);

  for (int i = 0; i < MAX_ANGLE; i++) {
    float r1 = distances[i];
    float r2 = distances[i + 1];

    // Only calculate if both points are valid
    if (r1 > 0 && r2 > 0) {
      totalArea += 0.5 * r1 * r2 * sin(deltaTheta);
    }
  }

  float areaM2 = totalArea / 10000.0;

  Serial.print("Estimated Room Area: ");
  Serial.print(totalArea, 1);
  Serial.println(" cm²");

  Serial.print("Estimated Room Area: ");
  Serial.print(areaM2, 3);
  Serial.println(" m²");
}