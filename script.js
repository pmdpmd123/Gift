// Global variables
let scene, camera, renderer, giftBox, boxLid, ribbon, textMesh;
let isOpened = false;
let animationId;
let sparkles = [];
let clock = new THREE.Clock();

// Initialize the 3D scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x1a1a2e, 1);
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Setup lighting
    setupLighting();
    
    // Create the gift box
    createGiftBox();
    
    // Create ground/surface
    createGround();
    
    // Create initial sparkles
    createAmbientSparkles();
    
    // Hide loading text
    document.getElementById('loading').style.display = 'none';
    
    // Add event listeners
    document.addEventListener('click', openGiftBox);
    window.addEventListener('resize', onWindowResize);
    
    // Start animation loop
    animate();
}

function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);
    
    // Rim light
    const rimLight = new THREE.DirectionalLight(0x4169e1, 0.3);
    rimLight.position.set(-5, 5, -5);
    scene.add(rimLight);
    
    // Point light for magical glow
    const pointLight = new THREE.PointLight(0xffd700, 0.5, 20);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);
}

function createGiftBox() {
    const boxGroup = new THREE.Group();
    
    // Box base
    const boxGeometry = new THREE.BoxGeometry(3, 2, 3);
    const boxMaterial = new THREE.MeshPhongMaterial({
        color: 0xdc143c,
        shininess: 100,
        specular: 0x111111
    });
    
    const boxBase = new THREE.Mesh(boxGeometry, boxMaterial);
    boxBase.position.y = 1;
    boxBase.castShadow = true;
    boxBase.receiveShadow = true;
    boxGroup.add(boxBase);
    
    // Box lid
    const lidGeometry = new THREE.BoxGeometry(3.1, 0.3, 3.1);
    const lidMaterial = new THREE.MeshPhongMaterial({
        color: 0xb22222,
        shininess: 100,
        specular: 0x111111
    });
    
    boxLid = new THREE.Mesh(lidGeometry, lidMaterial);
    boxLid.position.y = 2.15;
    boxLid.castShadow = true;
    boxGroup.add(boxLid);
    
    // Golden ribbon - horizontal
    const ribbonHGeometry = new THREE.BoxGeometry(3.2, 0.4, 0.3);
    const ribbonMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        shininess: 200,
        specular: 0x444444
    });
    
    const ribbonH = new THREE.Mesh(ribbonHGeometry, ribbonMaterial);
    ribbonH.position.y = 1.5;
    ribbonH.position.z = 0;
    ribbonH.castShadow = true;
    boxGroup.add(ribbonH);
    
    // Golden ribbon - vertical
    const ribbonVGeometry = new THREE.BoxGeometry(0.3, 2.5, 3.2);
    const ribbonV = new THREE.Mesh(ribbonVGeometry, ribbonMaterial);
    ribbonV.position.y = 1;
    ribbonV.position.x = 0;
    ribbonV.castShadow = true;
    boxGroup.add(ribbonV);
    
    // Ribbon bow
    const bowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    bowGeometry.scale(1, 0.5, 1);
    const bow = new THREE.Mesh(bowGeometry, ribbonMaterial);
    bow.position.y = 2.4;
    bow.castShadow = true;
    boxGroup.add(bow);
    
    // Bow tails
    const tailGeometry = new THREE.ConeGeometry(0.2, 1, 8);
    const tailL = new THREE.Mesh(tailGeometry, ribbonMaterial);
    tailL.position.set(-0.6, 2.2, 0);
    tailL.rotation.z = Math.PI / 4;
    boxGroup.add(tailL);
    
    const tailR = new THREE.Mesh(tailGeometry, ribbonMaterial);
    tailR.position.set(0.6, 2.2, 0);
    tailR.rotation.z = -Math.PI / 4;
    boxGroup.add(tailR);
    
    giftBox = boxGroup;
    scene.add(giftBox);
}

function createGround() {
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({
        color: 0x2c2c54,
        shininess: 100,
        transparent: true,
        opacity: 0.8
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);
}

function createVietnameseText() {
    const loader = new THREE.FontLoader();
    
    // Create text geometry manually since we can't load external fonts easily
    const textGeometry = new THREE.TextGeometry('Chị Hai Cho Em Tiền', {
        font: null, // We'll use a simple approach
        size: 0.5,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });
    
    // Fallback: Create text using sprites/planes with canvas texture
    createTextSprite();
}

function createTextSprite() {
    // Create canvas for text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 256;
    
    // Style the text
    context.fillStyle = 'rgba(255, 215, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'bold 60px Arial';
    context.fillStyle = '#FFD700';
    context.strokeStyle = '#FFA500';
    context.lineWidth = 3;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Add glow effect
    context.shadowColor = '#FFD700';
    context.shadowBlur = 20;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    
    // Draw text
    const text = 'Chị Hai Cho Em Tiền';
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Create sprite material
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0
    });
    
    // Create sprite
    textMesh = new THREE.Sprite(spriteMaterial);
    textMesh.position.set(0, 3, 0);
    textMesh.scale.set(6, 1.5, 1);
    scene.add(textMesh);
}

function createAmbientSparkles() {
    for (let i = 0; i < 50; i++) {
        createSparkle();
    }
}

function createSparkle() {
    const sparkleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
    const sparkleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.5, 0.8),
        transparent: true,
        opacity: Math.random() * 0.8 + 0.2
    });
    
    const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
    sparkle.position.set(
        (Math.random() - 0.5) * 10,
        Math.random() * 5 + 1,
        (Math.random() - 0.5) * 10
    );
    
    sparkle.userData = {
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            Math.random() * 0.02,
            (Math.random() - 0.5) * 0.02
        ),
        life: Math.random() * 100
    };
    
    sparkles.push(sparkle);
    scene.add(sparkle);
}

function updateSparkles() {
    sparkles.forEach((sparkle, index) => {
        sparkle.position.add(sparkle.userData.velocity);
        sparkle.userData.life -= 1;
        
        // Fade out over time
        sparkle.material.opacity = sparkle.userData.life / 100;
        
        // Remove dead sparkles
        if (sparkle.userData.life <= 0) {
            scene.remove(sparkle);
            sparkles.splice(index, 1);
        }
    });
    
    // Add new sparkles occasionally
    if (Math.random() < 0.1) {
        createSparkle();
    }
}

function openGiftBox() {
    if (isOpened) return;
    isOpened = true;
    
    // Hide instructions
    document.getElementById('instructions').style.opacity = '0';
    
    // Animate box lid opening
    const lidTween = {
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 2.15, z: 0 }
    };
    
    const targetRotation = { x: -Math.PI * 0.7, y: 0, z: 0 };
    const targetPosition = { x: 0, y: 2.5, z: -1.5 };
    
    animateLid(lidTween, targetRotation, targetPosition);
    
    // Create explosion of sparkles
    createSparkleExplosion();
    
    // Show text after delay
    setTimeout(() => {
        showVietnameseText();
    }, 1000);
}

function animateLid(current, targetRot, targetPos) {
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    function updateLid() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        // Update rotation
        boxLid.rotation.x = current.rotation.x + (targetRot.x - current.rotation.x) * easeOut;
        
        // Update position
        boxLid.position.y = current.position.y + (targetPos.y - current.position.y) * easeOut;
        boxLid.position.z = current.position.z + (targetPos.z - current.position.z) * easeOut;
        
        if (progress < 1) {
            requestAnimationFrame(updateLid);
        }
    }
    
    updateLid();
}

function createSparkleExplosion() {
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const sparkle = new THREE.Mesh(
                new THREE.SphereGeometry(0.05, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0xffd700,
                    transparent: true,
                    opacity: 1
                })
            );
            
            sparkle.position.set(0, 2, 0);
            
            const direction = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2 + 1,
                (Math.random() - 0.5) * 2
            ).normalize();
            
            sparkle.userData = {
                velocity: direction.multiplyScalar(0.1),
                life: 60
            };
            
            sparkles.push(sparkle);
            scene.add(sparkle);
        }, i * 50);
    }
}

function showVietnameseText() {
    if (!textMesh) {
        createTextSprite();
    }
    
    // Animate text appearance
    const startOpacity = 0;
    const targetOpacity = 1;
    const duration = 2000;
    const startTime = Date.now();
    
    function updateTextOpacity() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        textMesh.material.opacity = startOpacity + (targetOpacity - startOpacity) * progress;
        textMesh.position.y = 3 + Math.sin(progress * Math.PI) * 0.5;
        
        if (progress < 1) {
            requestAnimationFrame(updateTextOpacity);
        }
    }
    
    updateTextOpacity();
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Rotate gift box slightly
    if (giftBox) {
        giftBox.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
    
    // Animate text floating
    if (textMesh && isOpened) {
        textMesh.position.y += Math.sin(time * 2) * 0.005;
        textMesh.rotation.y = Math.sin(time) * 0.1;
    }
    
    // Update sparkles
    updateSparkles();
    
    // Render the scene
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when page loads
window.addEventListener('load', init);
