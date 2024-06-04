let g;
let trazos = [];
let cantidadTrazos = 7;
let imagesOnScreen = [];
let maxImages = 6;
let interval = 30; // Intervalo de generación de imágenes en frames
let lastGenTime = 0;
let deleteInterval = 20; // Intervalo para eliminar imágenes en frames
let lastDeleteTime = 0;

let minVibration = 0.5; // Mínimo desplazamiento de vibración
let maxVibration = 5;   // Máximo desplazamiento de vibración

function preload() {
    for (let i = 0; i < cantidadTrazos; i++) {
        let nombre = "data/trazo" + nf(i, 2) + ".png";
        trazos[i] = loadImage(nombre);
    }
    // Iniciar el contexto de audio
    userStartAudio();
}

function setup() {
    createCanvas(windowWidth,windowHeight); // Tamaño de la pantalla: ancho x alto
    background(255);
    imageMode(CENTER);
    g = new GestorDeInteraccion();
}

function draw() {
    g.actualizar();

    // Si el mouse está detenido, eliminar imágenes en el orden que aparecen
    if (g.mouseDetenido()) {
        if (frameCount - lastDeleteTime >= deleteInterval && imagesOnScreen.length > 0) {
            imagesOnScreen.shift();
            lastDeleteTime = frameCount;
        }
    } else {
        // Controlar la generación de imágenes con un temporizador
        if (frameCount - lastGenTime >= interval) {
            if (mouseY < height / 2) {
                crearPeques();
            } else {
                crearGrandes();
            }
            lastGenTime = frameCount;
        }
    }

    // Limpiar la pantalla
    background(255);

    // Dibujar todas las imágenes actualmente en pantalla
    for (let i = 0; i < imagesOnScreen.length; i++) {
        let currentImage = imagesOnScreen[i];

        // Ajustar la vibración en función de la velocidad del mouse
        let vibrationAmount = map(g.mouse.velocidad(), 0, 50, minVibration, maxVibration);
        let offsetX = random(-vibrationAmount, vibrationAmount); // Vibración en X
        let offsetY = random(-vibrationAmount, vibrationAmount); // Vibración en Y

        push();
        tint(currentImage.tint);
        image(currentImage.img, currentImage.x + offsetX, currentImage.y + offsetY, currentImage.width, currentImage.height);
        pop();
    }
}

function crearGrandes() {
    let cual = int(random(trazos.length));
    let x = random(width);
    let y = random(height);
    let originalWidth = trazos[cual].width;
    let originalHeight = trazos[cual].height;
    let newWidth = random(400,600); // Define the new width
    let newHeight = originalHeight * (newWidth / originalWidth); // Adjust height proportionally

    let img = {
        img: trazos[cual],
        x: x,
        y: y,
        width: newWidth,
        height: newHeight,
        tint: [random(0), random(0), random(0), 255]
    };

    if (imagesOnScreen.length >= maxImages) {
        imagesOnScreen.shift();
    }

    imagesOnScreen.push(img);
}

function crearPeques() {
    let cual = int(random(trazos.length));
    let x = random(width);
    let y = random(height);
    let originalWidth = trazos[cual].width;
    let originalHeight = trazos[cual].height;
    let newWidth = random(400,600); // Define the new width
    let newHeight = originalHeight * (newWidth / originalWidth); // Adjust height proportionally

    let img = {
        img: trazos[cual],
        x: x,
        y: y,
        width: newWidth,
        height: newHeight,
        tint: [random(200, 255), random(0), random(0), 255]
    };

    if (imagesOnScreen.length >= maxImages) {
        imagesOnScreen.shift();
    }

    imagesOnScreen.push(img);
}

class Dir_y_Vel {
    constructor() {
        this.posX = 0;
        this.posY = 0;
        this.prevPosX = 0;
        this.prevPosY = 0;
        this.vel = 0;
    }

    calcularTodo(mi_X, mi_Y) {
        this.prevPosX = this.posX;
        this.prevPosY = this.posY;
        this.posX = mi_X;
        this.posY = mi_Y;

        this.miDireccionX = this.posX - this.prevPosX;
        this.miDireccionY = this.posY - this.prevPosY;
        this.miDireccionPolar = degrees(atan2(this.posY - this.prevPosY, this.posX - this.prevPosX));

        this.vel = dist(this.posX, this.posY, this.prevPosX, this.prevPosY);
    }

    velocidad() {
        return this.vel;
    }

    direccionX() {
        return this.miDireccionX;
    }

    direccionY() {
        return this.miDireccionY;
    }

    direccionPolar() {
        return this.miDireccionPolar;
    }

    mostrarData() {
        textSize(24);
        text("Velocidad: " + this.vel, 50, 50);
        text("Direccion X: " + this.miDireccionX, 50, 75);
        text("Direccion Y: " + this.miDireccionY, 50, 100);
        text("Direccion Polar: " + this.miDireccionPolar, 50, 125);

        push();
        noFill();
        stroke(255);
        strokeWeight(3);
        translate(width / 2, height / 2);

        ellipse(0, 0, 100, 100);
        rotate(radians(this.miDireccionPolar));
        line(0, 0, this.vel * 2, 0);

        pop();
    }
}

class GestorDeInteraccion {
    constructor() {
        this.mouse = new Dir_y_Vel();
        this.movGrande = false;
        this.movPeque = false;
        this.tiempoGrande = 0;
        this.tiempoPeque = 0;
    }

    actualizar() {
        this.mouse.calcularTodo(mouseX, mouseY);
        this.movGrande = false;
        this.movPeque = false;
        this.tiempoGrande--;
        this.tiempoPeque--;
        this.tiempoGrande = constrain(this.tiempoGrande, 0, 90);
        this.tiempoPeque = constrain(this.tiempoPeque, 0, 90);

        if (this.mouse.velocidad() > 10) {
            let umbral = 40;
            if (this.mouse.velocidad() > umbral) {
                this.tiempoGrande += 10;
                this.tiempoPeque -= 10;
            } else {
                if (this.tiempoGrande < 10) {
                    this.tiempoPeque += 10;
                }
            }
        }

        if (this.tiempoGrande > 55) {
            this.movGrande = true;
        }
        if (this.tiempoPeque > 55) {
            this.movPeque = true;
        }
    }

    mouseDetenido() {
        return this.mouse.velocidad() === 0;
    }
}

