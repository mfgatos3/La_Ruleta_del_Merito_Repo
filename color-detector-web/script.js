const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const colorPreview = document.getElementById('color-preview');
const colorNameText = document.getElementById('color-name');
const colorHexText = document.getElementById('color-hex');
const colorValueText = document.getElementById('color-value');
const reactionMsg = document.getElementById('reaction-msg');
const verdictMsg = document.getElementById('verdict-msg');
const startBtn = document.getElementById('start-btn');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

let isCameraActive = false;

// Configuración de reacciones con crítica social (1-10)
const reactions = [
    { range: [0, 20], name: 'Rojo', msg: 'Alerta de riesgo sistémico.', color: '#ff4b2b', value: 1 },
    { range: [20, 45], name: 'Naranja', msg: 'Inestabilidad emocional y económica.', color: '#ff8c00', value: 2 },
    { range: [45, 70], name: 'Amarillo', msg: 'Esfuerzo insuficiente para el mercado.', color: '#ffd700', value: 3 },
    { range: [70, 150], name: 'Verde', msg: 'Crecimiento dentro de los límites.', color: '#2ecc71', value: 4 },
    { range: [150, 200], name: 'Cian', msg: 'Serenidad improductiva.', color: '#00ced1', value: 5 },
    { range: [200, 260], name: 'Azul', msg: 'Estabilidad de clase media.', color: '#3498db', value: 6 },
    { range: [260, 320], name: 'Violeta', msg: 'Aspiraciones de estatus superior.', color: '#9b59b6', value: 7 },
    { range: [320, 360], name: 'Rosa', msg: 'Optimismo ingenuo y frágil.', color: '#ff69b4', value: 8 }
];

const verdicts = {
    1: "FRACASO ABSOLUTO. SIN VALOR DE MERCADO.",
    2: "DECEPCIÓN SOCIAL. PASIVO FINANCIERO.",
    3: "SIN FUTURO. CARGA PARA EL SISTEMA.",
    4: "MANO DE OBRA BARATA. REEMPLAZABLE.",
    5: "MEDIOCRIDAD. UN NÚMERO MÁS EN LA MASA.",
    6: "ENGRANAJE ÚTIL. CONSUMIDOR PROMEDIO.",
    7: "ACTIVO RENTABLE. POTENCIAL DE ÉXITO.",
    8: "CAPITAL HUMANO ALTO. ORGULLO SOCIAL.",
    9: "ELITE PRODUCTIVA. EJEMPLO A SEGUIR.",
    10: "PERFECCIÓN SUPREMA. EL IDEAL CAPITALISTA."
};

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: 640, height: 480 } 
        });
        video.srcObject = stream;
        isCameraActive = true;
        startBtn.style.display = 'none';
        
        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            processVideo();
        };
    } catch (err) {
        console.error("Error: ", err);
        reactionMsg.innerText = "Error: Sin acceso a cámara.";
    }
}

function processVideo() {
    if (!isCameraActive) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const scanSize = 20;
    const startX = (canvas.width / 2) - (scanSize / 2);
    const startY = (canvas.height / 2) - (scanSize / 2);

    const imageData = ctx.getImageData(startX, startY, scanSize, scanSize);
    const data = imageData.data;

    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i + 1]; b += data[i + 2];
    }
    r = Math.floor(r / (data.length / 4));
    g = Math.floor(g / (data.length / 4));
    b = Math.floor(b / (data.length / 4));

    updateUI(r, g, b, rgbToHex(r, g, b), rgbToHsl(r, g, b));
    requestAnimationFrame(processVideo);
}

function updateUI(r, g, b, hex, hsl) {
    const [h, s, l] = hsl;
    let reaction;

    if (l < 15) {
        reaction = { name: 'Negro', msg: 'Oscuridad absoluta.', color: '#1a1a1a', value: 10 };
    } else if (l > 85) {
        reaction = { name: 'Blanco', msg: 'Claridad total.', color: '#f0f0f0', value: 9 };
    } else if (s < 15) {
        reaction = { name: 'Gris', msg: 'Neutralidad pura.', color: '#808080', value: 5 };
    } else {
        reaction = reactions.find(res => h >= res.range[0] && h < res.range[1]);
    }

    if (reaction) {
        colorNameText.innerText = reaction.name;
        colorHexText.innerText = hex;
        colorValueText.innerText = reaction.value;
        reactionMsg.innerText = reaction.msg;
        verdictMsg.innerText = verdicts[reaction.value];
        colorPreview.style.backgroundColor = `rgb(${r},${g},${b})`;
        
        document.documentElement.style.setProperty('--bg-color', reaction.color + '22');
        document.documentElement.style.setProperty('--accent-color', reaction.color);
    }
}

// Utilidades de conversión
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.floor(h * 360), Math.floor(s * 100), Math.floor(l * 100)];
}

// Función para simular color al hacer clic en la paleta
function simulateColor(element) {
    const bgColor = window.getComputedStyle(element).backgroundColor;
    const rgb = bgColor.match(/\d+/g).map(Number);
    const [r, g, b] = rgb;
    
    // Si la cámara está activa, la pausamos para la prueba
    if (isCameraActive) {
        // No detenemos el stream, solo permitimos que el clic sobrescriba la UI
    }
    
    updateUI(r, g, b, rgbToHex(r, g, b), rgbToHsl(r, g, b));
}

// Inicializar eventos de la paleta
document.querySelectorAll('.test-color').forEach(btn => {
    btn.addEventListener('click', () => simulateColor(btn));
});

startBtn.addEventListener('click', initCamera);
