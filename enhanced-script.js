// Enhanced 3D Gift Box Animation with Vietnamese Text
// Global variables
let scene, camera, renderer, giftBox, boxLid, ribbon, textMesh;
let isOpened = false;
let animationId;
let sparkles = [];
let particles = [];
let clock = new THREE.Clock();
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();

// Audio context for sound effects (optional)
let audioContext;

// Initialize the 3D scene
function init() {
    console.log("Initializing magical gift box...");
    
    // Create scene with better atmosphere
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x1a1a2e, 15, 45);
    
    // Create camera with better positioning
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 4, 10);
    camera.lookAt(0, 1, 0);
    
    // Create renderer with enhanced settings
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x0f0f23, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    document.getElementById('container').appendChild(renderer.domElement);
    
    // Setup enhanced lighting
    setupEnhancedLighting();
    
    // Create the magical gift box
    createMagicalGiftBox();
    
    // Create reflective ground
    createReflectiveGround();
    
    // Create ambient magical particles
    createAmbientMagic();
    
    // Create Vietnamese text (hidden initially)
    createVietnameseTextMesh();
    
    // Setup post-processing effects
    setupPostProcessing();
    
    // Hide loading text
    document.getElementById('loading').style.display = 'none';
    
    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
    
    // Start the magical animation loop
    animate();
    
    console.log("Magical gift box initialized!");
}

function setupEnhancedLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404080, 0.4);
    scene.add(ambientLight);
    
    // Main directional light (moonlight effect)
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(8, 12, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);
    
    // Rim light for dramatic effect
    const rimLight = new THREE.DirectionalLight(0x4169e1, 0.5);
    rimLight.position.set(-8, 8, -5);
    scene.add(rimLight);
    
    // Magical point lights
    const magicLight1 = new THREE.PointLight(0xffd700, 0.8, 15);
    magicLight1.position.set(0, 6, 0);
    scene.add(magicLight1);
    
    const magicLight2 = new THREE.PointLight(0xff6b6b, 0.3, 10);
    magicLight2.position.set(3, 3, 3);
    scene.add(magicLight2);
    
    const magicLight3 = new THREE.PointLight(0x4ecdc4, 0.3, 10);
    magicLight3.position.set(-3, 3, -3);
    scene.add(magicLight3);
}

function createMagicalGiftBox() {
    const boxGroup = new THREE.Group();
    
    // Enhanced box base with better materials
    const boxGeometry = new THREE.BoxGeometry(3.5, 2.2, 3.5);
    const boxMaterial = new THREE.MeshPhongMaterial({
        color: 0xdc143c,
        shininess: 150,
        specular: 0x222222,
        transparent: true,
        opacity: 0.95
    });
    
    const boxBase = new THREE.Mesh(boxGeometry, boxMaterial);
    boxBase.position.y = 1.1;
    boxBase.castShadow = true;
    boxBase.receiveShadow = true;
    boxGroup.add(boxBase);
    
    // Enhanced box lid
    const lidGeometry = new THREE.BoxGeometry(3.6, 0.4, 3.6);
    const lidMaterial = new THREE.MeshPhongMaterial({
        color: 0xb22222,
        shininess: 150,
        specular: 0x333333
    });
    
    boxLid = new THREE.Mesh(lidGeometry, lidMaterial);
    boxLid.position.y = 2.3;
    boxLid.castShadow = true;
    boxLid.receiveShadow = true;
    boxGroup.add(boxLid);
    
    // Enhanced golden ribbon system
    createGoldenRibbon(boxGroup);
    
    // Add magical glow effect
    createMagicalGlow(boxGroup);
    
    giftBox = boxGroup;
    scene.add(giftBox);
}

function createGoldenRibbon(boxGroup) {
    const ribbonMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd700,
        shininess: 300,
        specular: 0x666666,
        emissive: 0x221100
    });
    
    // Horizontal ribbon
    const ribbonHGeometry = new THREE.BoxGeometry(3.7, 0.5, 0.4);
    const ribbonH = new THREE.Mesh(ribbonHGeometry, ribbonMaterial);
    ribbonH.position.y = 1.6;
    ribbonH.castShadow = true;
    boxGroup.add(ribbonH);
    
    // Vertical ribbon
    const ribbonVGeometry = new THREE.BoxGeometry(0.4, 2.8, 3.7);
    const ribbonV = new THREE.Mesh(ribbonVGeometry, ribbonMaterial);
    ribbonV.position.y = 1.1;
    ribbonV.castShadow = true;
    boxGroup.add(ribbonV);
    
    // Enhanced bow with multiple parts
    const bowGeometry = new THREE.SphereGeometry(0.6, 20, 16);
    bowGeometry.scale(1.2, 0.6, 1);
    const bow = new THREE.Mesh(bowGeometry, ribbonMaterial);
    bow.position.y = 2.6;
    bow.castShadow = true;
    boxGroup.add(bow);
    
    // Bow center knot
    const knotGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 12);
    const knot = new THREE.Mesh(knotGeometry, ribbonMaterial);
    knot.position.y = 2.6;
    knot.rotation.x = Math.PI / 2;
    boxGroup.add(knot);
    
    // Enhanced bow tails
    const tailGeometry = new THREE.ConeGeometry(0.25, 1.2, 8);
    const tailL = new THREE.Mesh(tailGeometry, ribbonMaterial);
    tailL.position.set(-0.8, 2.3, 0);
    tailL.rotation.z = Math.PI / 6;
    boxGroup.add(tailL);
    
    const tailR = new THREE.Mesh(tailGeometry, ribbonMaterial);
    tailR.position.set(0.8, 2.3, 0);
    tailR.rotation.z = -Math.PI / 6;
    boxGroup.add(tailR);
}

function createMagicalGlow(boxGroup) {
    // Create glow effect using a larger, transparent box
    const glowGeometry = new THREE.BoxGeometry(4, 3, 4);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd700,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = 1.1;
    boxGroup.add(glow);
}

function createReflectiveGround() {
    const groundGeometry = new THREE.PlaneGeometry(25, 25);
    const groundMaterial = new THREE.MeshPhongMaterial({
        color: 0x2c2c54,
        shininess: 200,
        transparent: true,
        opacity: 0.9,
        reflectivity: 0.3
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Add subtle grid pattern
    const gridHelper = new THREE.GridHelper(25, 50, 0x444466, 0x222244);
    gridHelper.position.y = -0.05;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);
}

function createAmbientMagic() {
    // Create floating magical particles
    for (let i = 0; i < 80; i++) {
        createMagicalParticle();
    }
    
    // Create HTML sparkles overlay
    createHTMLSparkles();
}

function createMagicalParticle() {
    const colors = [0xffd700, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: Math.random() * 0.8 + 0.2
    });
    
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.set(
        (Math.random() - 0.5) * 15,
        Math.random() * 8 + 1,
        (Math.random() - 0.5) * 15
    );
    
    particle.userData = {
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            Math.random() * 0.01 + 0.005,
            (Math.random() - 0.5) * 0.02
        ),
        life: Math.random() * 200 + 100,
        maxLife: Math.random() * 200 + 100,
        rotationSpeed: (Math.random() - 0.5) * 0.05
    };
    
    sparkles.push(particle);
    scene.add(particle);
}

function createHTMLSparkles() {
    const sparkleOverlay = document.querySelector('.sparkle-overlay');
    
    setInterval(() => {
        if (Math.random() < 0.3) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle animate';
            sparkle.style.left = Math.random() * window.innerWidth + 'px';
            sparkle.style.top = window.innerHeight + 'px';
            sparkle.style.animationDelay = Math.random() * 2 + 's';
            
            sparkleOverlay.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 3000);
        }
    }, 200);
}

function createVietnameseTextMesh() {
    // The text is already in HTML, we'll animate it there
    // But we can also create a 3D version for the scene
    createText3D();
}

function createText3D() {
    // Create a simple 3D text using TextGeometry simulation
    const textGroup = new THREE.Group();
    
    // Create individual letters as planes with textures
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 256;
    
    // Clear canvas
    context.fillStyle = 'rgba(0, 0, 0, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Setup text style
    context.font = 'bold 80px Arial';
    context.fillStyle = '#FFD700';
    context.strokeStyle = '#FFA500';
    context.lineWidth = 4;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Add magical glow
    context.shadowColor = '#FFD700';
    context.shadowBlur = 30;
    
    // Draw text
    const text = 'Chị Hai Cho Em Tiền';
    context.strokeText(text, canvas.width / 2, canvas.height / 2);
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    // Create 3D text mesh
    const textGeometry = new THREE.PlaneGeometry(8, 2);
    const textMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
    });
    
    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(0, 4, 0);
    scene.add(textMesh);
}

function updateMagicalParticles() {
    sparkles.forEach((particle, index) => {
        // Update position
        particle.position.add(particle.userData.velocity);
        
        // Update rotation
        particle.rotation.x += particle.userData.rotationSpeed;
        particle.rotation.y += particle.userData.rotationSpeed * 0.7;
        
        // Update life
        particle.userData.life -= 1;
        
        // Fade out over time
        const lifeRatio = particle.userData.life / particle.userData.maxLife;
        particle.material.opacity = lifeRatio * 0.8;
        particle.scale.setScalar(0.5 + lifeRatio * 0.5);
        
        // Reset particle when it dies
        if (particle.userData.life <= 0) {
            particle.position.set(
                (Math.random() - 0.5) * 15,
                -1,
                (Math.random() - 0.5) * 15
            );
            particle.userData.life = particle.userData.maxLife;
        }
        
        // Keep particles in bounds
        if (particle.position.y > 10) {
            particle.position.y = -1;
        }
    });
}

function handleClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    if (!isOpened) {
        openMagicalGiftBox();
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function openMagicalGiftBox() {
    if (isOpened) return;
    isOpened = true;
    
    console.log("Opening magical gift box!");
    
    // Hide instructions with fade effect
    const instructions = document.getElementById('instructions');
    instructions.style.opacity = '0';
    
    // Animate box lid opening with enhanced effects
    animateBoxLidOpening();
    
    // Create magical explosion effect
    createMagicalExplosion();
    
    // Show Vietnamese text after delay
    setTimeout(() => {
        showVietnameseText();
    }, 1500);
    
    // Add camera shake effect
    addCameraShake();
}

function animateBoxLidOpening() {
    const duration = 2500;
    const startTime = Date.now();
    const startRotation = { x: 0, y: 0, z: 0 };
    const startPosition = { x: 0, y: 2.3, z: 0 };
    const targetRotation = { x: -Math.PI * 0.8, y: 0, z: 0 };
    const targetPosition = { x: 0, y: 3, z: -2 };
    
    function updateLid() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Advanced easing function
        const easeOutBounce = progress < 0.7 ? 
            7.5625 * progress * progress : 
            7.5625 * (progress - 0.9545) * (progress - 0.9545) + 0.9775;
        
        // Update rotation
        boxLid.rotation.x = startRotation.x + (targetRotation.x - startRotation.x) * easeOutBounce;
        
        // Update position
        boxLid.position.y = startPosition.y + (targetPosition.y - startPosition.y) * easeOutBounce;
        boxLid.position.z = startPosition.z + (targetPosition.z - startPosition.z) * easeOutBounce;
        
        if (progress < 1) {
            requestAnimationFrame(updateLid);
        }
    }
    
    updateLid();
}

function createMagicalExplosion() {
    // Create burst of magical particles
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const colors = [0xffd700, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            const explosion = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: color,
                    transparent: true,
                    opacity: 1
                })
            );
            
            explosion.position.set(0, 2.3, 0);
            
            const direction = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 1.5 + 0.5,
                (Math.random() - 0.5) * 2
            ).normalize();
            
            explosion.userData = {
                velocity: direction.multiplyScalar(0.15 + Math.random() * 0.1),
                life: 100,
                gravity: -0.002
            };
            
            particles.push(explosion);
            scene.add(explosion);
        }, i * 30);
    }
}

function updateExplosionParticles() {
    particles.forEach((particle, index) => {
        particle.position.add(particle.userData.velocity);
        particle.userData.velocity.y += particle.userData.gravity;
        particle.userData.life -= 2;
        
        particle.material.opacity = particle.userData.life / 100;
        particle.scale.setScalar(1 + (100 - particle.userData.life) / 100);
        
        if (particle.userData.life <= 0) {
            scene.remove(particle);
            particles.splice(index, 1);
        }
    });
}

function showVietnameseText() {
    console.log("Showing Vietnamese text!");
    
    // Show HTML text
    const textElement = document.getElementById('vietnameseText');
    textElement.classList.add('show');
    
    // Animate 3D text mesh
    if (textMesh) {
        const duration = 3000;
        const startTime = Date.now();
        
        function updateText3D() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            textMesh.material.opacity = progress;
            textMesh.position.y = 4 + Math.sin(progress * Math.PI) * 1;
            textMesh.rotation.y = progress * Math.PI * 2;
            
            if (progress < 1) {
                requestAnimationFrame(updateText3D);
            }
        }
        
        updateText3D();
    }
}

function addCameraShake() {
    const originalPosition = camera.position.clone();
    const duration = 1000;
    const startTime = Date.now();
    
    function shake() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            const intensity = (1 - progress) * 0.1;
            camera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity;
            camera.position.y = originalPosition.y + (Math.random() - 0.5) * intensity;
            camera.position.z = originalPosition.z + (Math.random() - 0.5) * intensity;
            
            requestAnimationFrame(shake);
        } else {
            camera.position.copy(originalPosition);
        }
    }
    
    shake();
}

function setupPostProcessing() {
    // This would be where we'd add post-processing effects like bloom
    // For now, we'll keep it simple but this is where enhancements would go
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Gentle rotation for the gift box
    if (giftBox && !isOpened) {
        giftBox.rotation.y = Math.sin(time * 0.3) * 0.1;
        giftBox.position.y = Math.sin(time * 1.2) * 0.05;
    }
    
    // Animate 3D text floating
    if (textMesh && isOpened) {
        textMesh.position.y += Math.sin(time * 2) * 0.01;
        textMesh.rotation.y += 0.005;
    }
    
    // Update all particle systems
    updateMagicalParticles();
    updateExplosionParticles();
    
    // Animate lights for magical effect
    const lights = scene.children.filter(child => child.type === 'PointLight');
    lights.forEach((light, index) => {
        if (light.color.getHex() === 0xffd700) {
            light.intensity = 0.8 + Math.sin(time * 2 + index) * 0.3;
        }
    });
    
    // Render the scene
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize when page loads
window.addEventListener('load', () => {
    console.log("Page loaded, initializing...");
    init();
});
