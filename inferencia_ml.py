"""
Modulo de inferencia para el clasificador de estado estructural del puente.
Carga el modelo TorchScript (.pt) y el archivo de normalizacion (.json)
una sola vez al iniciar el programa, y expone una funcion simple para
predecir el estado (normal / alerta / critico) a partir de las lecturas
de los sensores en un instante dado.

Uso esperado desde main.py:

    from inferencia_ml import ClasificadorPuenteML

    clasificador = ClasificadorPuenteML(
        ruta_modelo="modelo_puente_real.pt",
        ruta_escalador="scaler_puente_real.json",
    )

    estado = clasificador.predecir({
        "rms": last_rms,
        "freq_dom_hz": last_freq_dom,
        "f2hz": last_f1,
        "f5hz": last_f2,
        "f10hz": last_f3,
        "f20hz": last_f4,
        "f35hz": last_f5,
        "distancia_cm": last_dist_suav,
        "asentamiento_cm": last_asentamiento,
    })
    print(estado)  # "normal", "alerta" o "critico"
"""

import json

import torch


class ClasificadorPuenteML:
    def __init__(self, ruta_modelo, ruta_escalador):
        # Cargar el modelo TorchScript. No requiere tener la clase original
        # de PyTorch (ClasificadorEstadoPuente) disponible en este archivo.
        self.modelo = torch.jit.load(ruta_modelo)
        self.modelo.eval()

        # Cargar los parametros de normalizacion generados en el notebook.
        with open(ruta_escalador, "r", encoding="utf-8") as archivo:
            parametros = json.load(archivo)

        self.variables_entrada = parametros["variables_entrada"]
        self.media = torch.tensor(parametros["media"], dtype=torch.float32)
        self.desviacion = torch.tensor(parametros["desviacion_estandar"], dtype=torch.float32)

        # mapa_clases viene como {"normal": 0, "alerta": 1, "critico": 2};
        # se invierte para poder traducir el indice predicho a un nombre.
        self.indice_a_nombre = {v: k for k, v in parametros["mapa_clases"].items()}

        print(f"[ML] Modelo cargado desde {ruta_modelo}")
        print(f"[ML] Variables esperadas, en este orden: {self.variables_entrada}")

    def predecir(self, valores):
        """
        valores: diccionario con una clave por cada variable en
        self.variables_entrada (los nombres deben coincidir exactamente).
        Devuelve un string: "normal", "alerta" o "critico".
        """
        try:
            entrada = [float(valores[nombre]) for nombre in self.variables_entrada]
        except KeyError as error:
            raise ValueError(
                f"Falta la variable {error} en el diccionario de entrada. "
                f"Se esperaban: {self.variables_entrada}"
            )

        x = torch.tensor(entrada, dtype=torch.float32)
        x_normalizado = (x - self.media) / self.desviacion

        with torch.no_grad():
            salida = self.modelo(x_normalizado.unsqueeze(0))
            indice_predicho = salida.argmax(dim=1).item()

        return self.indice_a_nombre[indice_predicho]


if __name__ == "__main__":
    # Prueba rapida y manual: ejecutar "python3 inferencia_ml.py" en la Pi
    # para confirmar que el modelo carga y responde antes de integrarlo
    # al programa principal.
    clasificador = ClasificadorPuenteML(
        ruta_modelo="modelo_puente_real.pt",
        ruta_escalador="scaler_puente_real.json",
    )

    ejemplo = {
        "rms": 0.04,
        "freq_dom_hz": 33.0,
        "f2hz": 0.002,
        "f5hz": 0.003,
        "f10hz": 0.005,
        "f20hz": 0.010,
        "f35hz": 0.007,
        "distancia_cm": 10.5,
        "asentamiento_cm": -3.0,
    }
    print("Estado predicho para el ejemplo de prueba:", clasificador.predecir(ejemplo))
