let modelo, scaler;

// Campos seleccionados (simplificados)
const campos = [
  "koi_period",
  "koi_duration",
  "koi_depth",
  "koi_ror",
  "koi_model_snr"
];

// Explicaciones simples
const explicaciones = {
  "koi_period": "Cada cuántos días el planeta completa una órbita alrededor de su estrella.",
  "koi_duration": "Cuánto dura el tránsito o mini eclipse causado por el planeta.",
  "koi_depth": "Qué tanto se oscurece la estrella cuando el planeta pasa frente a ella.",
  "koi_ror": "Tamaño del planeta comparado con su estrella.",
  "koi_model_snr": "Qué tan clara o fuerte es la señal del planeta frente al ruido del telescopio."
};

async function init() {
  modelo = await tf.loadGraphModel("model/model.json");
  const resp = await fetch("model/scaler.json");
  scaler = await resp.json();

  const inputsDiv = document.getElementById("inputs");

  campos.forEach(campo => {
    const label = document.createElement("label");

    label.innerHTML = `
      ${campo.replace("koi_", "").replace(/_/g, " ")}
      <span class="tooltip">ℹ️
        <span class="tooltiptext">${explicaciones[campo]}</span>
      </span>
    `;

    const input = document.createElement("input");
    input.type = "number";
    input.step = "any";
    input.id = campo;

    inputsDiv.appendChild(label);
    inputsDiv.appendChild(input);
  });

  document.getElementById("btnPredict").addEventListener("click", predecir);
  console.log("Modelo y escalador listos ✅");
}

window.addEventListener("DOMContentLoaded", init);

async function predecir() {
  if (!modelo || !scaler) {
    alert("El modelo aún no está cargado 🚧");
    return;
  }

  const valores = campos.map(campo => parseFloat(document.getElementById(campo).value || 0));
  const escalado = valores.map((v, i) => (v - scaler.mean[i]) / scaler.scale[i]);

  const tensor = tf.tensor2d([escalado], [1, campos.length]);
  const salida = modelo.execute(tensor);
  const valor = (await salida.data())[0];

  const resultado = document.getElementById("resultado");
  resultado.textContent = valor > 0.5 ? "🪐 Es un planeta" : "🪨 No es un planeta";

  tensor.dispose();
  salida.dispose();
}
