import gpio
import gpio.pwm as pwm
import i2c
import math
import net
import http
import encoding.json
import tls

// --- Hardware Constants ---
SERVO-PIN       ::= 18
LIDAR-ADDR      ::= 0x62
REG-ACQ-CMD     ::= 0x00
REG-STATUS      ::= 0x01
REG-DIST-HIGH   ::= 0x0f
REG-DIST-LOW    ::= 0x10

// --- Flespi Config ---
FLESPI-TOKEN    ::= "QZBImJsYXGlviI2NJprnuLAZs5Mzdl1p6y6NcXGJcA05wgbFShRxgwke65khn3Qy"
DEVICE-ID       ::= "8235942" 
FLESPI-URL      ::= "https://flespi.io/gw/devices/$DEVICE-ID/messages"

ROOT-CERTIFICATE ::= """
-----BEGIN CERTIFICATE-----
MIIFUTCCBDmgAwIBAgIQdR4/VknnTLv2nQAmtnyqjDANBgkqhkiG9w0BAQwFADBX
MQswCQYDVQQGEwJCRTEZMBcGA1UEChMQR2xvYmFsU2lnbiBudi1zYTEQMA4GA1UE
CxMHUm9vdCBDQTEbMBkGA1UEAxMSR2xvYmFsU2lnbiBSb290IENBMB4XDTE5MDYx
OTAwMDAwMFoXDTI4MDEyODEyMDAwMFowTDEgMB4GA1UECxMXR2xvYmFsU2lnbiBS
b290IENBIC0gUjYxEzARBgNVBAoTCkdsb2JhbFNpZ24xEzARBgNVBAMTCkdsb2Jh
bFNpZ24wggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQCVB+hzymb57BTK
ezz3DQjxtEULLIK0SMbrWzyug7hBkjMUpG9/6SrMxrCIa8W2idHGsv8UzlEUIexK
3RtaxtaH7k06FQbtZGYLkoDKRN5zlE7zp4l/T3hjCMgSUG1CZi9NuXkoTVIaihqA
txmBDn7EirxkTCEcQ2jXPTyKxbJm1ZCatzEGxb7ibTIGph75ueuqo7i/voJjUNDw
GInf5A959eqiHyrScC5757yTu21T4kh8jBAHOP9msndhfuDqjDyqtKT285VKEgdt
/Yyyic/QoGF3yFh0sNQjOvddOsqi250J3l1ELZDxgc1Xkvp+vFAEYzTfa5MYvms2
sjnkrCQ2t/DvthwTV5O23rL44oW3c6K4NapF8uCdNqFvVIrxclZuLojFUUJEFZTu
o8U4lptOTloLR/MGNkl3MLxxN+Wm7CEIdfzmYRY/d9XZkZeECmzUAk10wBTt/Tn7
g/JeFKEEsAvp/u6P4W4LsgizYWYJarEGOmWWWcDwNf3J2iiNGhGHcIEKqJp1HZ46
hgUAntuA1iX53AWeJ1lMdjlb6vmlodiDD9H/3zAR+YXPM0j1ym1kFCx6WE/TSwhJ
xZVkGmMOeT31s4zKWK2cQkV5bg6HGVxUsWW2v4yb3BPpDW+4LtxnbsmLEbWEFIoA
GXCDeZGXkdQaJ783HjIH2BRjPChMrwIDAQABo4IBIjCCAR4wDgYDVR0PAQH/BAQD
AgEGMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFK5sBaOTE+Ki5+LXHNbH8H/I
Z1OgMB8GA1UdIwQYMBaAFGB7ZhpFDZfKiVAvfQTNNKj//P1LMD0GCCsGAQUFBwEB
BDEwLzAtBggrBgEFBQcwAYYhaHR0cDovL29jc3AuZ2xvYmFsc2lnbi5jb20vcm9v
dHIxMDMGA1UdHwQsMCowKKAmoCSGImh0dHA6Ly9jcmwuZ2xvYmFsc2lnbi5jb20v
cm9vdC5jcmwwRwYDVR0gBEAwPjA8BgRVHSAAMDQwMgYIKwYBBQUHAgEWJmh0dHBz
Oi8vd3d3Lmdsb2JhbFNpZ24uY29tL3JlcG9zaXRvcnkvMA0GCSqGSIb3DQEBDAUA
A4IBAQDHrE3fEsZgYRw59I03e5wt03B45il4hAHmquLc33pbkGZn6r3GgoKVzvwC
aBgtl6Jp93gZD8G5UjAFLj840jWDhOP7KSX6Q7rGjOsWNFFDJJLDUKQeJpB1PTRu
HqVI15zxiCl/VCP7mbTW7X/pILaFOPO+T0Qj+TUOU37WOjk6wdeyyOFiDhKSwH2Y
VE4YlAo0R10Jo3uNnSCFBgPw7gy1xt1+ajCbnzZYpQNXFy/0Lp9h3JOClE7TGvli
FUazCjxvhHm5YWqulA51wFT2K9LRiiEWw3UJAgTTmxASitVHHLb3erkETk6SCwGv
OG1eD0qLwuSeARZmhw3xFOCvMHeQ
-----END CERTIFICATE-----
"""

duty-for-angle angle/int -> float:
  return 0.025 + (angle.to-float / 180.0) * 0.100

main:
  distances := List 181 0.0
  do-scan distances

  print "Scanning complete. Connecting to network..."
  network := net.open
  (tls.RootCertificate ROOT-CERTIFICATE).install
  client := http.Client network

  calculate-and-send client distances
  
  client.close
  network.close

do-scan distances/List:
  sda := gpio.Pin 21
  scl := gpio.Pin 22
  bus := i2c.Bus --sda=sda --scl=scl --frequency=100_000
  lidar := bus.device LIDAR-ADDR
  
  servo-pin := gpio.Pin SERVO-PIN
  pwm-gen := pwm.Pwm --frequency=50
  channel := pwm-gen.start servo-pin --duty-factor=(duty-for-angle 0)
  
  last-valid := 0.0
  181.repeat: | angle |
    channel.set-duty-factor (duty-for-angle angle)
    sleep --ms=40
    
    val := 0
    catch:
      lidar.write #[0x00, 0x04]
      sleep --ms=20
      status-reg := lidar.read-reg 0x01 1
      if (status-reg[0] & 0x01) == 0:
        high-byte := lidar.read-reg 0x0f 1
        low-byte := lidar.read-reg 0x10 1
        // Access index [0] of the ByteArrays to get the int values
        val = (high-byte[0] << 8) | low-byte[0]

    distances[angle] = (val > 5 ? val.to-float : last-valid)
    if val > 5: last-valid = val.to-float
    if angle % 30 == 0: print "Scanning $angle°..."
  
  // Cleanup: Close the pin to stop PWM and free hardware resources
  servo-pin.close

calculate-and-send client/http.Client distances/List:
  area := 0.0
  180.repeat: | i |
    r1 := distances[i]
    r2 := distances[i+1]
    // Standard area formula for a sector segment
    area += 0.5 * r1 * r2 * (math.sin (math.PI / 180.0))

  payload := json.encode [{
    "scanned_area": area,
    "timestamp": (Time.now.ms-since-epoch / 1000)
  }]

  headers := http.Headers
  headers.set "Authorization" "FlespiToken $FLESPI-TOKEN"

  print "Sending Area: $area to Flespi..."
  
  catch --trace:
    response := client.post payload
      --uri=FLESPI-URL 
      --headers=headers 
      --content-type="application/json"
    
    body := response.body.read-all.to-string
    print "Status: $response.status-code"
    print "Response: $body"
    response.drain