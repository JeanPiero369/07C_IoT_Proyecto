#!/usr/bin/env python3
"""
Equivalente Python para Raspberry Pi 4 del sketch Arduino.
Sensores: MPU-6050 (I2C), HC-SR04 (distancia), DHT11 (temp/hum), Vibrador.

Dependencias (instalar con pip):
    pip install smbus2 RPi.GPIO adafruit-circuitpython-dht

Habilitar I2C en la Raspberry Pi:
    sudo raspi-config  ->  Interface Options  ->  I2C  ->  Enable
    sudo reboot
"""

import time
import math
import sys
import smbus2 as smbus
import adafruit_dht
import board
import RPi.GPIO as GPIO

# ════════════════════════════════════════════════════════════
#  PINES (numeracion BCM de Raspberry Pi)
# ════════════════════════════════════════════════════════════
PIN_VIBRADOR = 8
PIN_TRIG     = 9
PIN_ECHO     = 10
PIN_DHT      = 7   # BCM 7, se usa con board via adafruit_dht

# ════════════════════════════════════════════════════════════
#  CONFIGURACION GPIO
# ════════════════════════════════════════════════════════════
GPIO.setmode(GPIO.BCM)
GPIO.setup(PIN_VIBRADOR, GPIO.OUT)
GPIO.setup(PIN_TRIG,     GPIO.OUT)
GPIO.setup(PIN_ECHO,     GPIO.IN)
GPIO.output(PIN_TRIG, GPIO.LOW)

# ════════════════════════════════════════════════════════════
#  MPU-6050 (I2C)
# ════════════════════════════════════════════════════════════
MPU_ADDR = 0x68
bus = smbus.SMBus(1)

class BiquadFilter:
    __slots__ = ('b0', 'b1', 'b2', 'a1', 'a2', 'x1', 'x2', 'y1', 'y2')
    def __init__(self, b0, b1, b2, a1, a2):
        self.b0, self.b1, self.b2 = b0, b1, b2
        self.a1, self.a2 = a1, a2
        self.x1 = self.x2 = self.y1 = self.y2 = 0.0

SAMPLE_RATE_HZ = 200.0
WINDOW_SIZE    = 256
SECONDS_PER_SAMPLE = 1.0 / SAMPLE_RATE_HZ

# Offsets calculados durante calibracion
offset_ax = 0.0; offset_ay = 0.0; offset_az = 0.0
offset_gx = 0.0; offset_gy = 0.0; offset_gz = 0.0

window_z = [0.0] * WINDOW_SIZE
window_index = 0

# Ultimos valores MPU calculados (se actualizan cada ventana)
last_rms      = 0.0
last_freq_dom = 0.0
last_f1 = last_f2 = last_f3 = last_f4 = last_f5 = 0.0

hp_filter = BiquadFilter(0.9565, -1.9130, 0.9565, -1.9112, 0.9149)
lp_filter = BiquadFilter(0.0675,  0.1349, 0.0675, -1.1430, 0.4128)

# ════════════════════════════════════════════════════════════
#  HC-SR04
# ════════════════════════════════════════════════════════════
MEDIAN_SAMPLES = 5
MA_WINDOW_DIST = 10
DIST_MIN_CM    = 2.0
DIST_MAX_CM    = 400.0

ma_buffer_dist = [0.0] * MA_WINDOW_DIST
ma_index_dist  = 0
ma_count_dist  = 0
ma_sum_dist    = 0.0

distancia_base    = -1.0
last_dist_suav    = 0.0
last_asentamiento = 0.0

# Intervalo: cada 200 ms (igual que Arduino)
DIST_INTERVAL_S = 0.200

# ════════════════════════════════════════════════════════════
#  DHT-11
# ════════════════════════════════════════════════════════════
MA_SIZE_DHT = 5
temp_buffer = [0.0] * MA_SIZE_DHT
hum_buffer  = [0.0] * MA_SIZE_DHT
ma_index_dht = 0
ma_count_dht = 0

DHT_INTERVAL_S = 2.0

# Instanciar DHT11 (usa chip=board con el pin BCM 7)
# Nota: board.D7 no existe; se recomienda usar getattr o definir el pin
# con digitalio si el pin no esta en el enum board.
# Alternativa: usar un raw DHT via pigpio.
# Aqui usamos board.pin.GPIO7 si existe, sino board.D26 (fisico pin 26 = BCM 7)
try:
    dht_pin = getattr(board, 'D7', None) or board.D26
except AttributeError:
    import digitalio
    import microcontroller
    dht_pin = microcontroller.pin.GPIO7 if hasattr(microcontroller.pin, 'GPIO7') else board.D26

dht = adafruit_dht.DHT11(dht_pin, use_pulseio=False)

# ════════════════════════════════════════════════════════════
#  VIBRADOR
# ════════════════════════════════════════════════════════════
vibrador_timer  = 0.0
vibrador_activo = True
TIEMPO_VIBRA_S  = 10.0
TIEMPO_PAUSA_S  =  5.0

# ════════════════════════════════════════════════════════════
#  FUNCIONES AUXILIARES DE TIEMPO
# ════════════════════════════════════════════════════════════
def micros():
    """Retorna microsegundos (int) como Arduino micros()."""
    return int(time.perf_counter_ns() / 1000)

def millis():
    """Retorna milisegundos (int) como Arduino millis()."""
    return int(time.perf_counter_ns() / 1_000_000)

def sleep_us(us):
    """Equivalente a delayMicroseconds()."""
    end = time.perf_counter_ns() + us * 1000
    while time.perf_counter_ns() < end:
        pass

# ════════════════════════════════════════════════════════════
#  FUNCIONES MPU-6050
# ════════════════════════════════════════════════════════════
def goertzel(buffer_, N, target_freq, sample_rate):
    k     = int(0.5 + float(N) * target_freq / sample_rate)
    omega = (2.0 * math.pi * k) / float(N)
    coeff = 2.0 * math.cos(omega)
    q0 = q1 = q2 = 0.0
    for i in range(N):
        q0 = coeff * q1 - q2 + buffer_[i]
        q2 = q1
        q1 = q0
    real = q1 - q2 * math.cos(omega)
    imag = q2 * math.sin(omega)
    return math.sqrt(real * real + imag * imag) / N

def dominant_frequency(buffer_, N, sample_rate):
    max_power = 0.0
    dom_freq  = 0.0
    freq = 1.0
    while freq <= 50.0:
        power = goertzel(buffer_, N, freq, sample_rate)
        if power > max_power:
            max_power = power
            dom_freq  = freq
        freq += 1.0
    return dom_freq

def apply_biquad(filt, input_val):
    output = (filt.b0 * input_val
              + filt.b1 * filt.x1
              + filt.b2 * filt.x2
              - filt.a1 * filt.y1
              - filt.a2 * filt.y2)
    filt.x2 = filt.x1
    filt.x1 = input_val
    filt.y2 = filt.y1
    filt.y1 = output
    return output

def apply_bandpass(input_val):
    return apply_biquad(lp_filter, apply_biquad(hp_filter, input_val))

def read_raw_mpu():
    """Lee 14 bytes desde 0x3B. Retorna (ax, ay, az, gx, gy, gz) en g y deg/s."""
    data = bus.read_i2c_block_data(MPU_ADDR, 0x3B, 14)
    def combine(h, l):
        val = (h << 8) | l
        if val >= 0x8000:
            val -= 0x10000
        return val
    ax = combine(data[0], data[1]) / 16384.0
    ay = combine(data[2], data[3]) / 16384.0
    az = combine(data[4], data[5]) / 16384.0
    gx = combine(data[8],  data[9])  / 131.0
    gy = combine(data[10], data[11]) / 131.0
    gz = combine(data[12], data[13]) / 131.0
    return ax, ay, az, gx, gy, gz

def calibrate_mpu(num_samples=500):
    global offset_ax, offset_ay, offset_az, offset_gx, offset_gy, offset_gz
    print("# [MPU] Calibrando... no muevas el sensor")
    sys.stdout.flush()
    s_ax = s_ay = s_az = 0.0
    s_gx = s_gy = s_gz = 0.0
    for _ in range(num_samples):
        ax, ay, az, gx, gy, gz = read_raw_mpu()
        s_ax += ax; s_ay += ay; s_az += az
        s_gx += gx; s_gy += gy; s_gz += gz
        time.sleep(0.005)
    n = float(num_samples)
    offset_ax = s_ax / n
    offset_ay = s_ay / n
    offset_az = (s_az / n) - 1.0
    offset_gx = s_gx / n
    offset_gy = s_gy / n
    offset_gz = s_gz / n
    print(f"# [MPU] Offsets Ac: {offset_ax:.4f} {offset_ay:.4f} {offset_az:.4f}")

def analyze_window():
    global last_rms, last_freq_dom, last_f1, last_f2, last_f3, last_f4, last_f5
    denom = WINDOW_SIZE - 1
    for i in range(WINDOW_SIZE):
        hann = 0.5 * (1.0 - math.cos(2.0 * math.pi * i / denom))
        window_z[i] *= hann
    sum_sq = sum(v * v for v in window_z)
    last_rms      = math.sqrt(sum_sq / WINDOW_SIZE)
    last_freq_dom = dominant_frequency(window_z, WINDOW_SIZE, SAMPLE_RATE_HZ)
    last_f1 = goertzel(window_z, WINDOW_SIZE,  2.0, SAMPLE_RATE_HZ)
    last_f2 = goertzel(window_z, WINDOW_SIZE,  5.0, SAMPLE_RATE_HZ)
    last_f3 = goertzel(window_z, WINDOW_SIZE, 10.0, SAMPLE_RATE_HZ)
    last_f4 = goertzel(window_z, WINDOW_SIZE, 20.0, SAMPLE_RATE_HZ)
    last_f5 = goertzel(window_z, WINDOW_SIZE, 35.0, SAMPLE_RATE_HZ)

# ════════════════════════════════════════════════════════════
#  FUNCIONES HC-SR04
# ════════════════════════════════════════════════════════════
def pulse_in(pin, level, timeout_us):
    """Equivalente a pulseIn() de Arduino: mide duracion de pulso en us."""
    GPIO.setup(pin, GPIO.IN)
    t_start = time.perf_counter_ns()
    timeout_ns = timeout_us * 1000
    # Esperar flanco de subida (level=HIGH)
    while GPIO.input(pin) != level:
        if time.perf_counter_ns() - t_start > timeout_ns:
            return 0
    t_pulse_start = time.perf_counter_ns()
    # Esperar flanco de bajada
    while GPIO.input(pin) == level:
        if time.perf_counter_ns() - t_start > timeout_ns:
            return 0
    t_pulse_end = time.perf_counter_ns()
    return (t_pulse_end - t_pulse_start) // 1000

def leer_distancia_cruda():
    GPIO.output(PIN_TRIG, GPIO.LOW)
    sleep_us(2)
    GPIO.output(PIN_TRIG, GPIO.HIGH)
    sleep_us(10)
    GPIO.output(PIN_TRIG, GPIO.LOW)
    tiempo = pulse_in(PIN_ECHO, GPIO.HIGH, 25000)
    if tiempo == 0:
        return -1.0
    dist = tiempo / 58.0
    if dist < DIST_MIN_CM or dist > DIST_MAX_CM:
        return -1.0
    return dist

def mediana():
    muestras = []
    for _ in range(MEDIAN_SAMPLES):
        d = leer_distancia_cruda()
        if d > 0:
            muestras.append(d)
        sleep_us(30000)
    if not muestras:
        return -1.0
    muestras.sort()
    return muestras[len(muestras) // 2]

def media_movil_dist(nueva_lectura):
    global ma_sum_dist, ma_index_dist, ma_count_dist
    ma_sum_dist -= ma_buffer_dist[ma_index_dist]
    ma_buffer_dist[ma_index_dist] = nueva_lectura
    ma_sum_dist += nueva_lectura
    ma_index_dist = (ma_index_dist + 1) % MA_WINDOW_DIST
    if ma_count_dist < MA_WINDOW_DIST:
        ma_count_dist += 1
    return ma_sum_dist / ma_count_dist

def calibrar_dist(num_muestras=10):
    global distancia_base
    print("# [DIST] Calibrando distancia base...")
    sys.stdout.flush()
    suma = 0.0
    validas = 0
    for _ in range(num_muestras):
        m = mediana()
        if m > 0:
            suma += m
            validas += 1
    if validas > 0:
        distancia_base = suma / validas
        print(f"# [DIST] Distancia base: {distancia_base:.2f} cm")
    else:
        print("# [DIST] ERROR: calibracion fallida")

# ════════════════════════════════════════════════════════════
#  FUNCIONES DHT-11
# ════════════════════════════════════════════════════════════
def promediar_dht(buffer_, count):
    return sum(buffer_[:count]) / count

# ════════════════════════════════════════════════════════════
#  VIBRADOR
# ════════════════════════════════════════════════════════════
def actualizar_vibrador(ahora):
    global vibrador_activo, vibrador_timer
    if vibrador_activo:
        GPIO.output(PIN_VIBRADOR, GPIO.HIGH)
        if ahora - vibrador_timer >= TIEMPO_VIBRA_S:
            vibrador_activo = False
            vibrador_timer  = ahora
            GPIO.output(PIN_VIBRADOR, GPIO.LOW)
    else:
        if ahora - vibrador_timer >= TIEMPO_PAUSA_S:
            vibrador_activo = True
            vibrador_timer  = ahora
            GPIO.output(PIN_VIBRADOR, GPIO.HIGH)

# ════════════════════════════════════════════════════════════
#  SETUP
# ════════════════════════════════════════════════════════════
def setup():
    global last_sample_time, last_dist_time, last_dht_time
    global vibrador_timer

    print("# Iniciando sensores en Raspberry Pi 4...")
    sys.stdout.flush()

    # --- MPU-6050: despertar y configurar ---
    bus.write_byte_data(MPU_ADDR, 0x6B, 0x00)   # Salir de sleep
    bus.write_byte_data(MPU_ADDR, 0x1A, 0x02)   # DLPF_CFG = 2 (94 Hz Acc, 98 Hz Gyro)
    bus.write_byte_data(MPU_ADDR, 0x1C, 0x00)   # ACCEL_CONFIG: ±2g
    bus.write_byte_data(MPU_ADDR, 0x1B, 0x00)   # GYRO_CONFIG: ±250 deg/s
    calibrate_mpu(500)

    # --- HC-SR04 ---
    calibrar_dist(10)

    # --- Vibrador: arranca encendido ---
    vibrador_timer = time.perf_counter()
    GPIO.output(PIN_VIBRADOR, GPIO.HIGH)

    # --- Cabecera CSV ---
    print("# millis,rms,freq_dom_hz,f2hz,f5hz,f10hz,f20hz,f35hz,"
          "distancia_cm,asentamiento_cm,temperatura_c,humedad_pct,vibrador")

    last_sample_time = time.perf_counter()
    last_dist_time   = time.perf_counter()
    last_dht_time    = time.perf_counter()

# ════════════════════════════════════════════════════════════
#  LOOP
# ════════════════════════════════════════════════════════════
def loop():
    global last_sample_time, last_dist_time, last_dht_time
    global window_index
    global last_dist_suav, last_asentamiento
    global temp_buffer, hum_buffer, ma_index_dht, ma_count_dht

    while True:
        ahora = time.perf_counter()

        # --- MPU-6050 a 200 Hz: solo acumula, no imprime ---
        if ahora - last_sample_time >= SECONDS_PER_SAMPLE:
            last_sample_time += SECONDS_PER_SAMPLE
            # Compensar drift: si nos atrasamos mucho, resincronizar
            if last_sample_time < ahora - SECONDS_PER_SAMPLE:
                last_sample_time = ahora

            ax, ay, az, gx, gy, gz = read_raw_mpu()
            ax -= offset_ax; ay -= offset_ay; az -= offset_az
            filtered = apply_bandpass(az)
            window_z[window_index] = filtered
            window_index += 1
            if window_index >= WINDOW_SIZE:
                window_index = 0
                analyze_window()

        # --- HC-SR04 cada 200 ms ---
        if ahora - last_dist_time >= DIST_INTERVAL_S:
            last_dist_time += DIST_INTERVAL_S
            med = mediana()
            if med > 0:
                last_dist_suav = media_movil_dist(med)
                if distancia_base > 0:
                    last_asentamiento = last_dist_suav - distancia_base

        # --- Vibrador ---
        actualizar_vibrador(ahora)

        # --- DHT-11 cada 2 s: imprime la fila completa ---
        if ahora - last_dht_time >= DHT_INTERVAL_S:
            last_dht_time += DHT_INTERVAL_S

            try:
                humedad     = dht.humidity
                temperatura = dht.temperature
            except RuntimeError as e:
                print(f"# [DHT] LECTURA INVALIDA: {e}")
                time.sleep(0.5)
                continue

            if humedad is None or temperatura is None:
                print("# [DHT] LECTURA INVALIDA")
                continue

            temp_buffer[ma_index_dht] = temperatura
            hum_buffer[ma_index_dht]  = humedad
            ma_index_dht = (ma_index_dht + 1) % MA_SIZE_DHT
            if ma_count_dht < MA_SIZE_DHT:
                ma_count_dht += 1
            temp_suav = promediar_dht(temp_buffer, ma_count_dht)
            hum_suav  = promediar_dht(hum_buffer,  ma_count_dht)

            ms = int(ahora * 1000)
            vib_state = "ON" if vibrador_activo else "OFF"

            # Fila CSV unificada
            print(f"{ms},{last_rms:.6f},{last_freq_dom:.1f},"
                  f"{last_f1:.6f},{last_f2:.6f},{last_f3:.6f},"
                  f"{last_f4:.6f},{last_f5:.6f},"
                  f"{last_dist_suav:.3f},{last_asentamiento:.3f},"
                  f"{temp_suav:.2f},{hum_suav:.2f},{vib_state}")
            sys.stdout.flush()

# ════════════════════════════════════════════════════════════
#  MAIN
# ════════════════════════════════════════════════════════════
if __name__ == "__main__":
    try:
        setup()
        loop()
    except KeyboardInterrupt:
        print("\n# Detenido por el usuario")
    finally:
        dht.exit()
        GPIO.cleanup()
        bus.close()
        print("# Recursos liberados.")
