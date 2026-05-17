Import("env")
import os

def patch_library(source, target, env):
    files_to_patch = ["LIDARLite_v4LED.cpp", "LIDARLite_v3HP.cpp"]

    old = """    Wire.requestFrom
    (
        lidarliteAddress, // Slave address
        numBytes,         // number of consecutive bytes to read
        regAddr,          // address of first register to read
        1,                // number of bytes in regAddr
        true              // true = set STOP condition following I2C read
    );"""

    new = """    Wire.beginTransmission(lidarliteAddress);
    Wire.write(regAddr);
    Wire.endTransmission(false);
    Wire.requestFrom(lidarliteAddress, numBytes, true);"""

    libdeps_root = env["PROJECT_LIBDEPS_DIR"]
    for envname in os.listdir(libdeps_root):
        for filename in files_to_patch:
            lib_path = os.path.join(libdeps_root, envname, "LIDAR-Lite", "src", filename)

            if not os.path.exists(lib_path):
                continue

            with open(lib_path, "r") as f:
                content = f.read()

            if old in content:
                content = content.replace(old, new)
                with open(lib_path, "w") as f:
                    f.write(content)
                print(f"✅ {envname}/{filename} patched correctly")
            else:
                print(f"✅ {envname}/{filename} already patched")

env.AddPreAction("buildprog", patch_library)